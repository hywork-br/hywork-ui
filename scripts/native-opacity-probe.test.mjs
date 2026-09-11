import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../tests/browser/native-opacity-probe.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;

// Controlled scheduler and a minimal Web Animations model: only this
// observer's frames are advanced by hand. This is a harness liveness and
// hold-control proof, not evidence of browser rendering (covered natively).
function fixture({ honorPause = true, emptyBoxFrames = 0 } = {}) {
  const frames = new Map();
  let frameId = 0, time = 0, boxChecks = 0;
  const duration = 240;
  const browser = {};
  class NativeAnimation extends EventTarget {
    playState = "running";
    pending = true;
    startTime = null;
    finished = new Promise((resolve, reject) => { this.completed = resolve; this.aborted = reject; });
    effect = { target: null, getKeyframes: () => [{ opacity: 0 }, { opacity: 1 }],
      getComputedTiming: () => ({ delay: 0, activeDuration: duration, progress: time / duration }) };
    get currentTime() { return time; }
    set currentTime(value) { time = value; if (this.playState === "paused") this.pending = false; }
    pause() { if (honorPause) { this.playState = "paused"; this.pending = true; } }
    finish() { this.playState = "finished"; time = duration; this.pending = false; this.completed(this); }
    elapse(ms) { if (this.playState === "running") time = Math.min(duration, time + ms); }
  }
  const animation = new NativeAnimation();
  class NativeElement {
    isConnected = true;
    matches() { return true; }
    getAnimations() { return [animation]; }
    getBoundingClientRect() { boxChecks += 1; return { width: 100, height: boxChecks > emptyBoxFrames ? 40 : 0 }; }
    animate() { return animation; }
  }
  const element = new NativeElement();
  animation.effect.target = element;
  const exports = {};
  runInNewContext(compiled, { exports, window: browser, Element: NativeElement, Animation: NativeAnimation,
    document: { querySelector: () => element }, getComputedStyle: () => ({ opacity: String(time / duration) }),
    queueMicrotask, requestAnimationFrame: (callback) => { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame: (id) => frames.delete(id), performance: { now: () => time } });
  exports.installOpacityProbe();
  browser.opacityProbe.arm();
  let outcome;
  browser.opacityProbe.result.then((value) => { outcome = value; });
  return { browser, animation, element, result: () => outcome, pendingFrames: () => frames.size,
    advance: () => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach((callback) => callback()); },
  };
}
const flush = async () => { for (let index = 0; index < 4; index++) await Promise.resolve(); };

test("born opacity animation is held at half its native duration without any frame", async () => {
  const run = fixture();
  const born = run.element.animate();
  await flush();
  const result = run.result();
  assert.equal(result?.status, "held");
  assert.equal(result?.source, "native-birth");
  assert.equal(result?.seekTime, 120);
  assert.equal(result?.heldTime, 120);
  assert.equal(result?.opacity, 0.5);
  assert.equal(result?.playState, "paused");
  assert.equal(result?.pending, false);
  assert.equal(result?.commitFrames, 0);
  assert.equal(run.browser.heldAnimation, born);
  run.animation.elapse(1000);
  assert.equal(run.animation.currentTime, 120, "the held animation must not follow the real clock");
});

test("a hold the page overrides fails with evidence instead of waiting", async () => {
  const run = fixture({ honorPause: false });
  run.element.animate();
  await flush();
  assert.equal(run.result()?.status, "failed");
  assert.equal(run.result()?.reason, "hold-overridden");
});

test("an animation settled before the hold fails without another observer frame", async () => {
  const run = fixture();
  run.element.animate();
  run.animation.finish();
  await flush();
  assert.equal(run.result()?.status, "failed");
  assert.equal(run.result()?.reason, "settled-before-hold");
});

test("a held value waits a bounded number of frames for a nonzero box", async () => {
  const settling = fixture({ emptyBoxFrames: 2 });
  settling.element.animate();
  await flush();
  assert.equal(settling.result(), undefined);
  settling.advance(); settling.advance();
  await flush();
  assert.equal(settling.result()?.status, "held");
  assert.equal(settling.result()?.commitFrames, 2);
  assert.equal(settling.result()?.heldTime, 120);

  const hidden = fixture({ emptyBoxFrames: Number.POSITIVE_INFINITY });
  hidden.element.animate();
  await flush();
  for (let index = 0; index < 16; index++) hidden.advance();
  await flush();
  assert.equal(hidden.result()?.status, "failed");
  assert.equal(hidden.result()?.reason, "hold-not-rendered");
  assert.equal(hidden.pendingFrames(), 0);
});

test("an action with no matching native birth fails within four observer frames", async () => {
  const run = fixture();
  run.browser.opacityProbe.actionComplete();
  for (let index = 0; index < 4; index++) run.advance();
  await Promise.resolve();
  assert.equal(run.result()?.status, "failed");
  assert.equal(run.result()?.reason, "no-native-opacity-birth");
});
