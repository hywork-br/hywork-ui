import { expect, test } from "@playwright/test";
import { openStory } from "./helpers";

for (const surface of ["admin", "portal"]) {
for (const width of [1440, 768, 390, 320]) {
  test(`${surface} ${width}: all step labels remain readable without horizontal scrolling`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openStory(page, "patterns-stepper--constrained", surface);
    const steps = page.getByRole("list", { name: "Etapas" });
    const geometry = await steps.evaluate(element => {
      const bounds = element.getBoundingClientRect();
      return {
        fits: element.scrollWidth <= element.clientWidth,
        labels: [...element.querySelectorAll("button")].map(button => {
          const rect = button.getBoundingClientRect();
          return rect.left >= bounds.left && rect.right <= bounds.right + 1 && button.scrollWidth <= button.clientWidth;
        }),
      };
    });
    expect(geometry.fits).toBe(true);
    expect(geometry.labels).toEqual([true, true, true, true, true]);
    await expect(steps.getByRole("button", { name: /Certificado/ })).toBeDisabled();
    await page.keyboard.press("Tab");
    await expect(steps.getByRole("button", { name: "Escolha", exact: true })).toBeFocused();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("status")).toHaveText("Etapa selecionada: 2");
    await page.screenshot({ path: testInfo.outputPath("stepper.png") });
  });
}
}
