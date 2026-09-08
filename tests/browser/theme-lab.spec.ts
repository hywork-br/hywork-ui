import { expect, test } from "@playwright/test";
import { openStory } from "./helpers";

test("palette changes preserve text contrast throughout rendered frames", async ({ page }, info) => {
  await openStory(page, "labs-temas-de-tenant--validation-lab");
  const action = page.getByTestId("theme-preview").getByRole("button");
  await page.getByRole("button", { name: "Acento claro aprovado" }).click();
  await expect(action).toHaveCSS("background-color", "rgb(253, 242, 226)");
  const frames = await page.evaluate(async () => {
    const action = document.querySelector<HTMLElement>('[data-testid="theme-preview"] button.hw-button')!;
    const change = [...document.querySelectorAll<HTMLButtonElement>("button")].find((button) => button.textContent === "Acento escuro aprovado")!;
    const luminance = (color: string) => {
      const values = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map((value) => {
        const channel = value / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
      return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
    };
    const frames: Array<{ foreground: string; background: string; ratio: number }> = [];
    change.click();
    for (let index = 0; index < 30; index++) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const style = getComputedStyle(action);
      const foreground = style.color;
      const background = style.backgroundColor;
      const a = luminance(foreground);
      const b = luminance(background);
      frames.push({ foreground, background, ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) });
    }
    return frames;
  });
  await info.attach("palette-frame-contrast", { body: JSON.stringify(frames, null, 2), contentType: "application/json" });
  expect(frames.length).toBe(30);
  expect(Math.min(...frames.map((frame) => frame.ratio))).toBeGreaterThanOrEqual(4.5);
  expect(await action.evaluate((element) => getComputedStyle(element).transitionDuration.split(",").every((value) => parseFloat(value) === 0))).toBe(true);
  const defaultAction = page.getByRole("button", { name: "Confirmar exemplo · Padrão Hywork" });
  expect(await defaultAction.evaluate((element) => getComputedStyle(element).transitionDuration.split(",").every((value) => parseFloat(value) > 0))).toBe(true);
  const structuralDuration = await action.evaluate((element) => getComputedStyle(element).getPropertyValue("--hw-duration-base").trim());
  expect(structuralDuration).toBe(await defaultAction.evaluate((element) => getComputedStyle(element).getPropertyValue("--hw-duration-base").trim()));
  expect(parseFloat(structuralDuration)).toBeGreaterThan(0);
});

for (const width of [1440, 768, 390]) {
  test.describe(`theme editor ${width}`, () => {
    test.use({ viewport: { width, height: 1000 }, hasTouch: width === 390 });
    for (const reducedMotion of ["no-preference", "reduce"] as const) {
      test(`${reducedMotion}: actual controls, independent themes and recovery`, async ({ page }, info) => {
        await page.emulateMedia({ reducedMotion });
        const surface = width === 390 ? "portal" : "admin";
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await openStory(page, "labs-temas-de-tenant--validation-lab", surface);
        if (width === 390) expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches)).toBe(true);
        const initialRootStyle = await page.evaluate(() => {
          document.documentElement.style.setProperty("--color-primary", "host-owned");
          return document.documentElement.getAttribute("style");
        });
        const preview = page.getByTestId("theme-preview");
        const action = preview.getByRole("button", { name: "Continuar para revisar todas as unidades selecionadas" });
        const independent = page.getByRole("button", { name: "Confirmar exemplo · Outro workspace" });
        const standard = page.getByRole("button", { name: "Confirmar exemplo · Padrão Hywork" });
        const otherColor = await independent.evaluate((element) => getComputedStyle(element).backgroundColor);
        const standardColor = await standard.evaluate((element) => getComputedStyle(element).backgroundColor);
        const audience = preview.getByRole("combobox");
        await audience.click();
        await page.getByRole("option", { name: "Unidades selecionadas", exact: true }).click();
        await expect(audience).toBeFocused();
        await page.getByRole("button", { name: "Acento claro aprovado" }).click();
        await expect(action).toHaveCSS("background-color", "rgb(253, 242, 226)");
        await expect(action).toHaveCSS("color", "rgb(9, 41, 56)");
        await expect(audience).toHaveText("Unidades selecionadas");
        await action.click();
        await expect(action).toHaveAttribute("aria-pressed", "true");
        await page.getByRole("button", { name: "Acento escuro aprovado" }).click();
        await expect(action).toHaveAttribute("aria-pressed", "false");
        await expect(audience).toHaveText("Unidades selecionadas");
        // Read the accepted endpoint, not an interpolated animation frame.
        await expect(action).toHaveCSS("background-color", otherColor);
        const lastValid = await action.evaluate((element) => getComputedStyle(element).backgroundColor);
        await page.getByLabel("Seletor nativo da cor primária", { exact: true }).fill("#ffffff");
        await expect(page.getByRole("alert")).toContainText("Rejeitada");
        await expect(action).toHaveCSS("background-color", lastValid);
        await expect(independent).toHaveCSS("background-color", otherColor);
        await expect(standard).toHaveCSS("background-color", standardColor);
        expect(await page.evaluate(() => document.documentElement.getAttribute("style"))).toBe(initialRootStyle);
        expect(await preview.evaluate((element) => (element as HTMLElement).style.getPropertyValue("--color-primary"))).toBe("");
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: info.outputPath("theme-editor.png"), fullPage: true, animations: "disabled" });
        await openStory(page, "labs-temas-de-tenant--invalid-initial", surface);
        await expect(page.getByRole("alert")).toContainText("Rejeitada");
        await expect(page.getByTestId("theme-preview").getByRole("button", { name: "Continuar para revisar todas as unidades selecionadas" })).toHaveCSS("background-color", "rgb(30, 114, 161)");
        expect(errors).toEqual([]);
      });
    }
  });
}
