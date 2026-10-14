import { act } from "@testing-library/react";
import { vi } from "vitest";

/**
 * jsdom has no layout: every element measures 0 and `tests/setup.ts` stubs a
 * ResizeObserver that never fires. The charts measure their container, so a
 * test that wants a drawing calls this first: every element then measures
 * `width` px, and `resize()` reports a new width to the observers, as a
 * browser would when the card narrows.
 */
export function mockResizeObserver(width: number, height = 400) {
  let current = width;
  const previous = globalThis.ResizeObserver;
  const live = new Set<{ callback: ResizeObserverCallback; targets: Set<Element>; observer: ResizeObserver }>();

  const rect = () =>
    ({ width: current, height, top: 0, left: 0, right: current, bottom: height, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
  const spy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(rect);

  class FakeResizeObserver {
    private entry: { callback: ResizeObserverCallback; targets: Set<Element>; observer: ResizeObserver };
    constructor(callback: ResizeObserverCallback) {
      this.entry = { callback, targets: new Set(), observer: this as unknown as ResizeObserver };
      live.add(this.entry);
    }
    observe(target: Element) {
      this.entry.targets.add(target);
    }
    unobserve(target: Element) {
      this.entry.targets.delete(target);
    }
    disconnect() {
      live.delete(this.entry);
    }
  }
  vi.stubGlobal("ResizeObserver", FakeResizeObserver);

  return {
    resize(next: number) {
      current = next;
      act(() => {
        for (const { callback, targets, observer } of live) {
          const entries = [...targets].map((target) => ({ target, contentRect: rect() }) as unknown as ResizeObserverEntry);
          if (entries.length) callback(entries, observer);
        }
      });
    },
    restore() {
      spy.mockRestore();
      vi.stubGlobal("ResizeObserver", previous);
    },
  };
}

/** axe-core without colour contrast: jsdom has no layout; contrast runs in the browser test. */
export const axeOptions = { rules: { "color-contrast": { enabled: false } } } as const;

/**
 * `prefers-reduced-motion`, which jsdom lacks. Recharts reads it to decide
 * whether to animate: with `reduce`, the marks are drawn at once, at their
 * final size. Returns the restore function.
 */
export function mockReducedMotion(reduce: boolean) {
  const previous = window.matchMedia;
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes("prefers-reduced-motion: reduce"),
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
  return () => {
    window.matchMedia = previous;
  };
}
