export type HeldOpacity = {
  status: "held";
  opacity: number;
  progress: number;
  playState: string;
  pending: boolean;
  heldTime: number;
  seekTime: number;
  commitFrames: number;
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
    result: Promise<HeldOpacity | OpacityFailure>;
  };
};

/**
 * Test-only browser observer. Kept serializable for Playwright addInitScript.
 *
 * The app's own native opacity animation is frozen at birth and seeked to a
 * test-chosen point, so the partial frame never depends on the real clock or
 * on the browser painting a frame before a 160-240 ms animation ends.
 */
export function installOpacityProbe() {
  const probe = window as unknown as OpacityProbeWindow;
  const nativeAnimate = Element.prototype.animate;
  // Half of the native active duration: far from both ends, so any monotonic
  // opacity curve yields a strictly partial value.
  const holdFraction = 0.5;
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
        let birthFrames = 0, commitFrames = 0, seekTime = Number.NaN;
        const frames = new Set<number>();
        const observations: unknown[] = [];
        const frame = (callback: () => void) => {
          const id = requestAnimationFrame(() => { frames.delete(id); if (!settled) callback(); });
          frames.add(id);
        };
        const finish = (result: HeldOpacity | OpacityFailure) => {
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
          seekTime, birthFrames, commitFrames,
        });
        const fail = (reason: string) => finish({ status: "failed", reason,
          diagnostics: { ...state(reason), observations } });
        const hold = () => {
          if (settled || !candidate || !element) return;
          const animation = candidate;
          const target = element;
          observations.push(state("before-hold"));
          if (animation.playState === "finished" || animation.playState === "idle") {
            fail("settled-before-hold");
            return;
          }
          const sameNativeAnimation = animation instanceof Animation
            && (animation.effect as KeyframeEffect).target === target
            && target.getAnimations().includes(animation);
          if (!sameNativeAnimation) { fail("native-animation-identity-mismatch"); return; }
          const timing = animation.effect!.getComputedTiming();
          const activeDuration = Number(timing.activeDuration);
          if (!(activeDuration > 0) || !Number.isFinite(activeDuration)) { fail("no-finite-native-duration"); return; }
          seekTime = Number(timing.delay ?? 0) + activeDuration * holdFraction;
          probe.heldAnimation = animation;
          // The only playback control: freeze, then seek. Seeking a pause-pending
          // animation completes the pause synchronously (Web Animations).
          animation.pause();
          animation.currentTime = seekTime;
          observations.push(state("held"));
          const commit = () => {
            const heldTime = animation.currentTime == null ? Number.NaN : Number(animation.currentTime);
            if (animation.playState !== "paused") { fail("hold-overridden"); return; }
            if (heldTime !== seekTime) { fail("hold-time-moved"); return; }
            const opacity = Number(getComputedStyle(target).opacity);
            const progress = Number(animation.effect?.getComputedTiming().progress);
            const rect = target.getBoundingClientRect();
            if (!animation.pending && opacity > 0 && opacity < 1 && progress > 0 && progress < 1
              && target.isConnected && rect.width > 0 && rect.height > 0) {
              finish({ status: "held", opacity, progress, playState: animation.playState,
                pending: animation.pending, heldTime, seekTime, commitFrames,
                source: "native-birth", sameNativeAnimation, observations });
            } else if (commitFrames >= 16) fail("hold-not-rendered");
            else {
              // Only layout may still be settling (e.g. a JS height tween from 0).
              // Bounded by frames, not by elapsed time: the held value cannot expire.
              commitFrames += 1;
              observations.push(state("commit-frame"));
              frame(commit);
            }
          };
          commit();
        };
        onBirth = (target, animation) => {
          if (!target.matches("[data-pilot-presence]")
            || !(animation.effect as KeyframeEffect)?.getKeyframes().some((keyframe) => "opacity" in keyframe)) return;
          if (candidate) { fail("opacity-animation-replaced-before-hold"); return; }
          candidate = animation;
          element = target;
          observations.push(state("native-birth"));
          animation.finished.then(() => { if (!settled) fail("finished-before-hold"); },
            () => { if (!settled) fail("cancelled-before-hold"); });
          // Motion may assign startTime right after Element.animate returns, which
          // would resume a paused animation; hold once its constructor has run.
          queueMicrotask(hold);
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
