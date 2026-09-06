export type PartialOpacity = {
  status: "held";
  sampledOpacity: number;
  opacity: number;
  playState: string;
  pending: boolean;
  heldTime: number;
  pauseFrameChecks: number;
  source: string;
  sameNativeAnimation: boolean;
  observations: unknown;
};
export type OpacityFailure = { status: "failed"; reason: string; diagnostics: unknown };
export type OpacityProbeWindow = Window & {
  heldAnimation?: Animation;
  opacityProbe: {
    arm: () => void;
    actionComplete: () => void;
    result: Promise<PartialOpacity | OpacityFailure>;
  };
};

/** Test-only browser observer. Kept serializable for Playwright addInitScript. */
export function installOpacityProbe() {
  const probe = window as unknown as OpacityProbeWindow;
  const nativeAnimate = Element.prototype.animate;
  let onBirth: ((element: Element, animation: Animation) => void) | undefined;
  let onActionComplete: (() => void) | undefined;
  Element.prototype.animate = function (...args: Parameters<Element["animate"]>) {
    const animation = Reflect.apply(nativeAnimate, this, args) as Animation;
    onBirth?.(this, animation);
    // Motion receives exactly its original native object and unchanged arguments.
    return animation;
  };
  probe.opacityProbe = {
    result: Promise.resolve({ status: "failed", reason: "not-armed", diagnostics: null }),
    actionComplete() { onActionComplete?.(); },
    arm() {
      if (onBirth) throw new Error("opacity observer already armed");
      probe.opacityProbe.result = new Promise((resolve) => {
        let settled = false, candidate: Animation | undefined, element: Element | undefined;
        let sampleFrames = 0, birthFrames = 0, pauseFrameChecks = 0, pausing = false;
        const frames = new Set<number>();
        const observations: unknown[] = [];
        const frame = (callback: () => void) => {
          const id = requestAnimationFrame(() => { frames.delete(id); if (!settled) callback(); });
          frames.add(id);
        };
        const finish = (result: PartialOpacity | OpacityFailure) => {
          if (settled) return;
          settled = true;
          frames.forEach(cancelAnimationFrame);
          onBirth = undefined;
          onActionComplete = undefined;
          resolve(result);
        };
        const state = (source: string) => ({
          source, opacity: element ? Number(getComputedStyle(element).opacity) : null,
          playState: candidate?.playState, pending: candidate?.pending,
          currentTime: candidate?.currentTime, startTime: candidate?.startTime,
          progress: candidate?.effect?.getComputedTiming().progress,
          sampleFrames, birthFrames, pauseFrameChecks,
        });
        const fail = (reason: string) => finish({ status: "failed", reason,
          diagnostics: { ...state(reason), observations } });
        const sample = (source: string) => {
          if (settled || pausing || !candidate || !element) return;
          const snapshot = state(source);
          observations.push(snapshot);
          const opacity = snapshot.opacity!;
          if (snapshot.playState === "finished" || snapshot.playState === "idle") {
            fail("finished-before-partial");
            return;
          }
          const rect = element.getBoundingClientRect();
          if (snapshot.playState !== "running" || !(opacity > 0 && opacity < 1)
            || !(Number(snapshot.progress) > 0 && Number(snapshot.progress) < 1)
            || !element.isConnected || rect.width <= 0 || rect.height <= 0) return;
          const animation = candidate;
          const target = element;
          const sameNativeAnimation = animation instanceof Animation
            && (animation.effect as KeyframeEffect).target === target
            && target.getAnimations().includes(animation);
          if (!sameNativeAnimation) { fail("native-animation-identity-mismatch"); return; }
          pausing = true;
          probe.heldAnimation = animation;
          // This is the only playback control: hold a naturally advanced value.
          animation.pause();
          const commitPause = () => {
            const heldOpacity = Number(getComputedStyle(target).opacity);
            const heldTime = animation.currentTime == null ? Number.NaN : Number(animation.currentTime);
            if (animation.playState === "paused" && !animation.pending
              && Number.isFinite(heldTime) && heldOpacity > 0 && heldOpacity < 1) {
              finish({ status: "held", sampledOpacity: opacity, opacity: heldOpacity,
                playState: animation.playState, pending: animation.pending, heldTime,
                pauseFrameChecks, source, sameNativeAnimation, observations });
            } else if (pauseFrameChecks >= 4) fail("pause-not-committed");
            else { pauseFrameChecks += 1; frame(commitPause); }
          };
          queueMicrotask(commitPause);
        };
        onBirth = (target, animation) => {
          if (!target.matches("[data-pilot-presence]")
            || !(animation.effect as KeyframeEffect)?.getKeyframes().some((keyframe) => "opacity" in keyframe)) return;
          if (candidate) { fail("opacity-animation-replaced-before-hold"); return; }
          candidate = animation;
          element = target;
          observations.push(state("native-birth"));
          // Observe native play commitment as well as rendered-frame callbacks.
          // Motion may synchronously set startTime after Element.animate returns.
          animation.ready.then(() => sample("native-ready"), () => { if (!settled) fail("cancelled-before-partial"); });
          animation.finished.then(() => { if (!settled) fail("finished-before-partial"); },
            () => { if (!settled) fail("cancelled-before-partial"); });
          const sampleFrame = () => {
            if (settled || pausing) return;
            sampleFrames += 1;
            sample("native-frame");
            if (settled || pausing) return;
            if (sampleFrames >= 16) fail("partial-frame-budget-exhausted");
            else frame(sampleFrame);
          };
          frame(sampleFrame);
        };
        onActionComplete = () => {
          // Start the absent-birth bound after the actual pointer action, not
          // during Playwright's actionability checks or protocol dispatch.
          const checkBirth = () => {
            if (candidate || settled) return;
            birthFrames += 1;
            if (birthFrames >= 4) fail("no-native-opacity-birth");
            else frame(checkBirth);
          };
          frame(checkBirth);
        };
      });
    },
  };
}
