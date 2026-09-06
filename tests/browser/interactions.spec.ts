import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
import { writeFile } from "node:fs/promises";
import { openStory, expectSettled } from "./helpers";

const require = createRequire(import.meta.url);
const workspace = "lab-interface-details--workspace";

type MotionChange = {
  atChange: number; inert: boolean; trusted: boolean; matches: boolean;
  heldStateAtChange: string | null; heldTimeAtChange: number | null;
  finalOpacity: string | null; finalHeight: string | null; policy: string | null;
  finalAnimationState: string | null; timeOrigin: number;
};

for (const key of ["Escape", "Tab"] as const) {
  test(`native ${key} immediately after saving disables the Save button`, async ({ page }, testInfo) => {
    await openStory(page, workspace);
    const trigger = page.getByRole("button", { name: "Preferências de visualização" });
    await trigger.click();
    await page.getByText("Gerenciar visões", { exact: true }).click();
    await page.getByLabel("Nome da visão").fill("Editorial");
    const save = page.getByRole("button", { name: "Salvar visão", exact: true });
    await save.click();
    await expect(save).toBeDisabled();
    await expect(page.getByLabel("Visões salvas")).toHaveValue("view-1");
    await expect(page.getByLabel("Nome da visão")).toBeFocused();
    const focusImage = testInfo.outputPath("saved-view-focus.png");
    await page.screenshot({ path: focusImage });
    await testInfo.attach("saved-view-focus", { path: focusImage, contentType: "image/png" });
    // No focus repair: native keyboard starts exactly where the click left it.
    await page.keyboard.press(key);
    if (key === "Tab") {
      await expect(page.getByRole("button", { name: "Excluir visão" })).toBeFocused();
      await page.keyboard.press("Escape");
    }
    await expect(trigger).toBeFocused();
    await expect(page.getByRole("region", { name: "Preferências de visualização" })).toHaveCount(0);
  });
}

for (const width of [1440, 390, 320]) {
  for (const surface of ["admin", "portal"]) {
    test(`${surface} ${width}px: reflow, target size, text and axe`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await openStory(page, workspace, surface);
      await page.getByRole("button", { name: "Preferências de visualização" }).click();
      await page.getByText("Gerenciar visões", { exact: true }).click();
      await expectSettled(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const geometry = await page.locator("button:visible, input:visible, select:visible, summary:visible").evaluateAll((controls) => controls.map((control) => {
        const label = control instanceof HTMLInputElement && control.matches("[type=checkbox], [type=radio]") ? control.labels?.[0] : null;
        const rect = (label ?? control).getBoundingClientRect();
        return { name: control.getAttribute("aria-label") || control.textContent || control.tagName,
          width: rect.width, height: rect.height,
          font: parseFloat(getComputedStyle(control).fontSize), input: control.matches("input:not([type=checkbox]):not([type=radio]), select") };
      }));
      for (const control of geometry) {
        const minimum = surface === "portal" || width <= 390 ? 44 : 32;
        expect(control.height, control.name).toBeGreaterThanOrEqual(minimum);
        expect(control.width, control.name).toBeGreaterThanOrEqual(minimum);
        if (width <= 390 && control.input) expect(control.font, control.name).toBeGreaterThanOrEqual(16);
      }
      // Prove that the associated label is an actual hit area outside the 16px glyph.
      const checkbox = page.getByLabel("Selecionar página", { exact: true });
      const labelHit = async () => {
        await checkbox.scrollIntoViewIfNeeded();
        return checkbox.evaluate((element) => {
        const input = element as HTMLInputElement;
        const label = input.labels?.[0];
        if (!label) throw new Error("Selection target needs its real associated label");
        const box = label.getBoundingClientRect();
        const glyph = input.getBoundingClientRect();
        const point = { x: box.left + 2, y: box.top + 2 };
        if (point.x >= glyph.left && point.x <= glyph.right && point.y >= glyph.top && point.y <= glyph.bottom)
          throw new Error("Probe must be outside the visible input glyph");
        if (!label.contains(document.elementFromPoint(point.x, point.y))) throw new Error("Label target is obscured");
        return point;
        });
      };
      await expect(checkbox).not.toBeChecked();
      const hit = await labelHit();
      await page.mouse.click(hit.x, hit.y);
      await expect(checkbox).toBeChecked();
      await expectSettled(page);
      // The contextual selection bar changes layout, so resolve the target again.
      const restoreHit = await labelHit();
      await page.mouse.click(restoreHit.x, restoreHit.y);
      await expect(checkbox).not.toBeChecked();
      await expectSettled(page);
      await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
      const violations = await page.evaluate(async () => {
        const axe = (window as unknown as { axe: { run: (context: string, options: object) => Promise<{ violations: unknown[] }> } }).axe;
        return (await axe.run("#storybook-root", { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } })).violations;
      });
      expect(violations).toEqual([]);
    });
  }
}

test("keyboard selection is immediate and visible focus uses the orange semantic token", async ({ page }) => {
  await openStory(page, workspace);
  const select = page.getByLabel("Selecionar página", { exact: true });
  await select.focus();
  await page.keyboard.press("Space");
  const state = await page.locator("[data-pilot-presence]").evaluate((element) => ({ opacity: getComputedStyle(element).opacity, height: (element as HTMLElement).style.height }));
  expect(state).toEqual({ opacity: "1", height: "auto" });
  await expect(page.locator("[data-pilot-motion]")).toHaveAttribute("data-pilot-motion", "instant");
  const focus = await select.evaluate((element) => {
    const css = getComputedStyle(element);
    const probe = document.createElement("i");
    probe.style.color = "var(--hw-focus)";
    element.parentElement!.append(probe);
    const token = getComputedStyle(probe).color;
    probe.remove();
    return { visible: element.matches(":focus-visible"), color: css.outlineColor, width: parseFloat(css.outlineWidth), token };
  });
  expect(focus.visible).toBe(true);
  expect(focus.width).toBeGreaterThanOrEqual(2);
  expect(focus.color).toBe(focus.token);
});

for (const direction of ["entry", "exit"] as const) {
  test(`reduced preference interrupts rendered ${direction} mid-flight without reload`, async ({ page }, testInfo) => {
    // Observe each real native MQL before returning it to application listeners.
    // Ordering between separate MediaQueryList objects is not portable across engines.
    await page.addInitScript(() => {
      const probe = window as unknown as { motionChange: Promise<MotionChange>; heldAnimation?: Animation };
      const nativeMatchMedia = window.matchMedia.bind(window);
      probe.motionChange = new Promise((resolve) => {
        let observed = false;
        const observe = (event: MediaQueryListEvent) => {
          if (!event.matches || observed) return;
          observed = true;
          const before = document.querySelector("[data-pilot-presence]");
          const atChange = before ? Number(getComputedStyle(before).opacity) : -1;
          const inert = !before || (before as HTMLElement).inert;
          const heldStateAtChange = probe.heldAnimation?.playState ?? null;
          const heldTimeAtChange = probe.heldAnimation?.currentTime == null ? null : Number(probe.heldAnimation.currentTime);
          requestAnimationFrame(() => requestAnimationFrame(() => {
            const element = document.querySelector("[data-pilot-presence]");
            resolve({ atChange, inert, trusted: event.isTrusted, matches: event.matches,
              heldStateAtChange, heldTimeAtChange,
              finalAnimationState: probe.heldAnimation?.playState ?? null, timeOrigin: performance.timeOrigin,
              finalOpacity: element ? getComputedStyle(element).opacity : null,
              finalHeight: element ? (element as HTMLElement).style.height : null,
              policy: document.querySelector("[data-pilot-motion]")?.getAttribute("data-pilot-motion") ?? null });
          }));
        };
        window.matchMedia = (query) => {
          const media = nativeMatchMedia(query);
          if (query === "(prefers-reduced-motion: reduce)" || query === "(prefers-reduced-motion)")
            media.addEventListener("change", observe, { once: true });
          return media;
        };
      });
    });
    await openStory(page, workspace);
    const timeOrigin = await page.evaluate(() => performance.timeOrigin);
    const select = page.getByLabel("Selecionar página", { exact: true });
    if (direction === "exit") { await select.click(); await expectSettled(page); }
    // Arm the actual rendered partial-frame observer BEFORE the pointer action.
    const partial = page.evaluate(() => new Promise<{ sampledOpacity: number; opacity: number; playState: string; heldTime: number }>((resolve, reject) => {
      const sample = () => {
        const element = document.querySelector("[data-pilot-presence]");
        const opacity = element ? Number(getComputedStyle(element).opacity) : -1;
        const animation = element?.getAnimations().find((candidate) => candidate.playState === "running"
          && (candidate.effect as KeyframeEffect).getKeyframes().some((frame) => "opacity" in frame));
        if (opacity > 0 && opacity < 1 && animation) {
          (window as unknown as { heldAnimation: Animation }).heldAnimation = animation;
          // Hold this naturally rendered frame; do not seek, alter duration, or set styles.
          // Only the application may cancel it after the real preference change.
          animation.pause();
          void animation.ready.then(() => resolve({ sampledOpacity: opacity,
            opacity: Number(getComputedStyle(element!).opacity), playState: animation.playState,
            heldTime: Number(animation.currentTime) })).catch(reject);
        } else requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    }));
    const clicked = select.click();
    const { sampledOpacity, opacity, playState, heldTime } = await partial;
    expect(sampledOpacity).toBeGreaterThan(0);
    expect(sampledOpacity).toBeLessThan(1);
    expect(opacity).toBeGreaterThan(0);
    expect(opacity).toBeLessThan(1);
    expect(playState, "native partial opacity must be held before crossing the media protocol boundary").toBe("paused");
    const partialImage = testInfo.outputPath("paused-partial-frame.png");
    await page.screenshot({ path: partialImage, animations: "allow" });
    await testInfo.attach("paused-partial-frame", { path: partialImage, contentType: "image/png" });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const result = await page.evaluate(() => (window as unknown as { motionChange: Promise<MotionChange> }).motionChange);
    await clicked;
    const motionEvidence = testInfo.outputPath("rendered-interruption.json");
    await writeFile(motionEvidence, JSON.stringify({ direction, harnessControl: "pause native opacity at rendered partial frame",
      partialOpacity: sampledOpacity, heldOpacity: opacity, heldTime, ...result }, null, 2));
    await testInfo.attach("rendered-interruption", { path: motionEvidence, contentType: "application/json" });
    expect(result.atChange, "preference must change before animation already settled").toBeGreaterThan(0);
    expect(result.atChange).toBeLessThan(1);
    expect(result.trusted, "preference event must come from the browser, not a dispatched fixture").toBe(true);
    expect(result.matches).toBe(true);
    expect(result.heldStateAtChange).toBe("paused");
    expect(result.heldTimeAtChange).toBe(heldTime);
    expect(result.finalAnimationState, "application must cancel the held native animation").toBe("idle");
    expect(result.timeOrigin, "preference changes without reloading the document").toBe(timeOrigin);
    expect(result.policy).toBe("instant");
    if (direction === "entry") {
      expect(result.finalOpacity).toBe("1");
      expect(result.finalHeight).toBe("auto");
    } else {
      expect(result.inert, "outgoing controls already inert at preference change").toBe(true);
      expect(result.finalOpacity).toBeNull();
      await expect(page.getByRole("button", { name: "Limpar seleção de todas as páginas" })).toHaveCount(0);
    }
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(page.locator("[data-pilot-motion]")).toHaveAttribute("data-pilot-motion", "full");
  });
}
