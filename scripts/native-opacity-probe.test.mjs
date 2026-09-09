import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../tests/browser/native-opacity-probe.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;

// Controlled scheduler: only this observer's frames can be withheld. This is a
// harness liveness proof, not evidence of browser rendering (covered natively).
function fixture() {
  const frames = new Map();
  let frameId = 0, opacity = 0;
  const browser = {};
  class NativeAnimation extends EventTarget {
    playState = "running";
    pending = false;
    currentTime = 0;
    startTime = 0;
    ready = new Promise((resolve) => { this.started = resolve; });
    finished = new Promise((resolve) => { this.completed = resolve; });
    effect = { target: null, getKeyframes: () => [{ opacity: 0 }, { opacity: 1 }], getComputedTiming: () => ({ progress: opacity, duration: 180 }) };
    pause() { this.playState = "paused"; }
    finish() { this.playState = "finished"; this.currentTime = 180; opacity = 1; this.completed(this); }
  }
  const animation = new NativeAnimation();
  class NativeElement {
    isConnected = true;
    matches() { return true; }
    getAnimations() { return [animation]; }
    getBoundingClientRect() { return { width: 100, height: 40 }; }
    animate() { return animation; }
  }
  const element = new NativeElement();
  animation.effect.target = element;
  const exports = {};
  runInNewContext(compiled, { exports, window: browser, Element: NativeElement, Animation: NativeAnimation,
    document: { querySelector: () => element }, getComputedStyle: () => ({ opacity: String(opacity) }),
    queueMicrotask, requestAnimationFrame: (callback) => { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame: (id) => frames.delete(id), performance: { now: () => animation.currentTime } });
  exports.installOpacityProbe();
  browser.opacityProbe.arm();
  let outcome;
  browser.opacityProbe.result.then((value) => { outcome = value; });
  return { browser, animation, element, result: () => outcome,
    advance: () => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach((callback) => callback()); },
    partial: () => { opacity = 0.25; animation.currentTime = 45; animation.started(animation); },
  };
}

test("missed partial window fails on native completion without another observer frame", async () => {
  const run = fixture();
  run.element.animate();
  run.animation.finish();
  await Promise.resolve(); await Promise.resolve();
  assert.equal(run.result()?.status, "failed");
  assert.equal(run.result()?.reason, "finished-before-partial");
});

test("native ready captures the born animation when the generic frame poll is starved", async () => {
  const run = fixture();
  const born = run.element.animate();
  run.partial();
  await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  assert.equal(run.result()?.status, "held");
  assert.equal(run.result()?.source, "native-ready");
  assert.equal(run.result()?.sampledOpacity, 0.25);
  assert.equal(run.browser.heldAnimation, born);
});

test("an action with no matching native birth fails within four observer frames", async () => {
  const run = fixture();
  run.browser.opacityProbe.actionComplete();
  for (let index = 0; index < 4; index++) run.advance();
  await Promise.resolve();
  assert.equal(run.result()?.status, "failed");
  assert.equal(run.result()?.reason, "no-native-opacity-birth");
});
