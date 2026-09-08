import { expect, test, type Locator } from "@playwright/test";
import { openStory } from "./helpers";
import { contrastRatio, parseOpaqueCssColor } from "../../src/lib/theme-validation";

async function expectRenderedContrast(target: Locator, focus = false) {
  const paint = await target.evaluate((element, focus) => {
    const css = getComputedStyle(element);
    let surface: Element | null = focus ? element.parentElement : element;
    let background = "";
    while (surface) {
      background = getComputedStyle(surface).backgroundColor;
      if (background !== "rgba(0, 0, 0, 0)" && background !== "transparent") break;
      surface = surface.parentElement;
    }
    return { foreground: focus ? css.outlineColor : css.color, background, outlineStyle: css.outlineStyle, outlineWidth: parseFloat(css.outlineWidth) };
  }, focus);
  if (focus) {
    await expect(target).toBeFocused();
    expect(paint.outlineStyle).not.toBe("none");
    expect(paint.outlineWidth).toBeGreaterThan(0);
  }
  const foreground = parseOpaqueCssColor(paint.foreground);
  const background = parseOpaqueCssColor(paint.background);
  expect(foreground.ok, JSON.stringify(paint)).toBe(true);
  expect(background.ok, JSON.stringify(paint)).toBe(true);
  if (!foreground.ok || !background.ok) throw new Error("Rendered pair is not opaque");
  expect(contrastRatio(paint.foreground, paint.background), JSON.stringify(paint)).toBeGreaterThanOrEqual(focus ? 3 : 4.5);
}

for (const width of [1440, 390]) {
  test(`${width}: accent ink is independent from a light fill`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 1000 });
    await openStory(page, "themes-scoped-components--accent-ink", "admin");
    if (width < 768) await page.getByRole("button", { name: "Abrir navegação" }).click();
    const selected = page.locator('.hw-shell-navigation a[aria-current="page"]');
    await expect(selected).toHaveCSS("color", "rgb(255, 255, 255)");
    if (width < 768) await page.keyboard.press("Escape");
    await expect(page.locator('.hw-stepper li[data-status="current"] .hw-stepper__marker')).toHaveCSS("color", "rgb(30, 114, 161)");
    await expect(page.locator(".hw-filter-chip")).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(page.getByRole("img", { name: "Maria Silva" })).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(page.getByRole("tab", { name: "Visão geral" })).toHaveCSS("border-bottom-color", "rgb(30, 114, 161)");
    const selection = await page.getByRole("textbox", { name: "Buscar conteúdos" }).evaluate((element) => getComputedStyle(element, "::selection").color);
    expect(selection).toBe("rgb(255, 255, 255)");
    if (width < 768) {
      const metrics = await page.locator(".hw-admin-shell__mobile-header").evaluate((header) => {
        const css = getComputedStyle(header);
        return {
          height: header.getBoundingClientRect().height,
          intrinsic: Math.max(...Array.from(header.children).map((child) => child.getBoundingClientRect().height)) + parseFloat(css.paddingTop) + parseFloat(css.paddingBottom) + parseFloat(css.borderTopWidth) + parseFloat(css.borderBottomWidth),
        };
      });
      expect(metrics.height).toBeLessThanOrEqual(metrics.intrinsic + 1);
    }
    await page.screenshot({ path: info.outputPath("accent-ink.png"), animations: "disabled" });
  });
}

for (const width of [1440, 390]) {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    test(`${width} ${reducedMotion}: real portal colors and isolation`, async ({ page }, info) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await openStory(page, "themes-scoped-components--portal-contract", "admin");
      // Read-only paint assertion also runs while Radix hides the background
      // from accessibility. Never use this locator to interact through a modal.
      const external = page.getByRole("button", { name: "Botão padrão", exact: true, includeHidden: true });
      const defaultFill = await external.evaluate((element) => getComputedStyle(element).backgroundColor);
      const alternateFill = await page.getByRole("button", { name: "Publicar B", exact: true }).evaluate((element) => getComputedStyle(element).backgroundColor);
      const subtle = await page.getByRole("textbox", { name: "Nome A" }).evaluate((element) => getComputedStyle(element).backgroundColor);
      expect(defaultFill).not.toBe(alternateFill);
      const input = page.getByRole("textbox", { name: "Nome A" });
      await expectRenderedContrast(input);
      await page.getByRole("button", { name: "Publicar A", exact: true }).focus();
      await page.keyboard.press("Tab");
      await expectRenderedContrast(input, true);

      const trigger = page.getByRole("button", { name: "Abrir diálogo A", exact: true });
      await trigger.click();
      const dialog = page.getByRole("dialog", { name: "Preferências do workspace A" });
      await expect(dialog).toBeVisible();
      await dialog.getByRole("button", { name: "Aplicar tema alternativo", exact: true }).click();
      await expect(dialog).toHaveCSS("background-color", subtle);
      await expectRenderedContrast(dialog);
      await expect(external).toHaveCSS("background-color", defaultFill);
      await dialog.getByRole("button", { name: "Testar cor inválida", exact: true }).click();
      await expect(dialog.getByRole("alert")).toBeVisible();
      await expect(dialog).toHaveCSS("background-color", subtle);
      const nested = dialog.getByRole("combobox", { name: "Status no diálogo" });
      await page.keyboard.press("Tab");
      await expect(nested).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("listbox")).toHaveCSS("background-color", subtle);
      await expectRenderedContrast(page.getByRole("listbox"));
      await page.keyboard.press("ArrowDown");
      await expectRenderedContrast(page.getByRole("option", { name: "Rascunho", exact: true }));
      await page.keyboard.press("Escape");
      await expect(nested).toBeFocused();
      await expectRenderedContrast(nested, true);
      await page.screenshot({ path: info.outputPath("scoped-dialog.png"), animations: "disabled" });
      await page.keyboard.press("Escape");
      await expect(trigger).toBeFocused();

      await page.getByRole("button", { name: "Abrir detalhes A", exact: true }).click();
      await expect(page.getByRole("dialog", { name: "Detalhes A" })).toHaveCSS("background-color", subtle);
      await expectRenderedContrast(page.getByRole("dialog", { name: "Detalhes A" }));
      await page.keyboard.press("Escape");
      const menuTrigger = page.getByRole("button", { name: "Ações A", exact: true });
      await menuTrigger.click();
      await expect(page.getByRole("menu", { name: "Ações A" })).toHaveCSS("background-color", subtle);
      await expectRenderedContrast(page.getByRole("menu", { name: "Ações A" }));
      await page.keyboard.press("ArrowDown");
      await expectRenderedContrast(page.getByRole("menuitem", { name: "Restaurar tema padrão" }));
      await page.keyboard.press("Escape");
      await expect(menuTrigger).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(page.getByRole("button", { name: "Ajuda A", exact: true })).toBeFocused();
      await expect(page.getByRole("tooltip")).toBeVisible();
      // Tooltip intentionally retains the fixed inverse semantic pair.
      await expect(page.locator(".hw-tooltip")).toHaveCSS("background-color", "rgb(9, 41, 56)");
      await expectRenderedContrast(page.locator(".hw-tooltip"));
      await page.keyboard.press("Escape");
      await expect(external).toHaveCSS("background-color", defaultFill);
      await expect(page.getByRole("button", { name: "Publicar B", exact: true })).toHaveCSS("background-color", alternateFill);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: info.outputPath("scoped-overview.png"), animations: "disabled" });
      expect(errors).toEqual([]);
    });
  }
}
