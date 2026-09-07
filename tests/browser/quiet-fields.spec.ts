import { expect, test } from "@playwright/test";

import { expectSettled, openStory } from "./helpers";

const storyId = "contracts-quiet-fields--state-matrix";

async function capture(page: Parameters<typeof openStory>[0], path: string) {
  await page.screenshot({
    animations: "allow",
    caret: "hide",
    fullPage: true,
    path,
  });
}

for (const surface of ["admin", "portal"] as const) {
  test(`${surface}: invalid selection retains its cue through keyboard focus`, async ({ page }) => {
    await openStory(page, storyId, surface);
    const control = page.getByRole("combobox", {
      name: "Categoria inválida",
      exact: true,
    });
    const error = page.locator("#quiet-category-error");
    await expect(control).toHaveAttribute(
      "aria-describedby",
      "quiet-category-error",
    );
    const errorColor = await error.evaluate(
      (element) => getComputedStyle(element).color,
    );
    await expect(control).toHaveCSS("border-bottom-color", errorColor);
    await control.focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(control).toBeFocused();
    await expect(control).toHaveCSS("border-bottom-color", errorColor);
  });

  test(`${surface}: invalid and disabled examples do not masquerade as read-only`, async ({
    page,
  }) => {
    await openStory(page, storyId, surface);
    const invalidSearch = page.getByLabel("Busca inválida", { exact: true });
    await expect(invalidSearch).not.toHaveAttribute("readonly", "");
    await expect(invalidSearch).not.toHaveCSS("border-bottom-style", "dashed");

    for (const name of [
      "Texto desabilitado",
      "Descrição desabilitada",
      "Data desabilitada",
    ]) {
      const control = page.getByLabel(name, { exact: true });
      await expect(control).toBeDisabled();
      await expect(control).not.toHaveAttribute("readonly", "");
    }
  });

  test(`${surface}: contextual selection has an associated label and distinct quiet paint`, async ({
    page,
  }) => {
    await openStory(page, storyId, surface);
    const formSelect = page.getByRole("combobox", {
      name: "Categoria normal",
      exact: true,
    });
    const contextualLabel = page.getByText("Status contextual", { exact: true });
    const contextualSelect = page.getByRole("combobox", {
      name: "Status contextual",
      exact: true,
    });
    await expect(contextualLabel).toBeVisible();
    await expect(contextualSelect).toHaveAttribute("id", "quiet-status-contextual");
    expect(
      await contextualLabel.evaluate(
        (element) => (element as HTMLLabelElement).control?.id,
      ),
    ).toBe("quiet-status-contextual");
    const [formPaint, contextualPaint] = await Promise.all([
      formSelect.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          background: style.backgroundColor,
          baseline: style.borderBottomColor,
        };
      }),
      contextualSelect.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          background: style.backgroundColor,
          baseline: style.borderBottomColor,
        };
      }),
    ]);
    expect(contextualPaint.background).not.toBe(formPaint.background);
    expect(contextualPaint.baseline).not.toBe(formPaint.baseline);
  });

  for (const width of [390, 1440]) {
    test(`${surface} ${width}px: quiet field states retain their semantic cues`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 1000 });
      await openStory(page, storyId, surface);

      const normalNames = [
        "Texto normal",
        "Descrição normal",
        "Categoria normal",
        "Responsável normal",
        "Participantes normais",
        "Data normal",
      ];
      const reference = page.getByLabel("Texto normal", { exact: true });
      const referencePaint = await reference.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          background: style.backgroundColor,
          baseline: style.borderBottomColor,
        };
      });
      for (const name of normalNames) {
        const control = page.getByLabel(name, { exact: true });
        await expect(control).toHaveCSS("background-color", referencePaint.background);
        await expect(control).toHaveCSS("border-bottom-color", referencePaint.baseline);
      }

      for (const [name, errorId] of [
        ["Texto inválido", "quiet-text-error"],
        ["Descrição inválida", "quiet-description-error"],
        ["Categoria inválida", "quiet-category-error"],
        ["Responsável inválido", "quiet-owner-error"],
        ["Participantes inválidos", "quiet-participants-error"],
        ["Data inválida", "quiet-date-error"],
        ["Busca inválida", "quiet-search-error"],
      ] as const) {
        const control = page.getByLabel(name, { exact: true });
        const error = page.locator(`#${errorId}`);
        await expect(control).toHaveAttribute("aria-describedby", errorId);
        const errorColor = await error.evaluate(
          (element) => getComputedStyle(element).color,
        );
        await expect(control).toHaveCSS("border-bottom-color", errorColor);
      }

      for (const name of [
        "Texto desabilitado",
        "Descrição desabilitada",
        "Categoria desabilitada",
        "Responsável desabilitado",
        "Participantes desabilitados",
        "Data desabilitada",
      ]) {
        await expect(page.getByLabel(name, { exact: true })).toBeDisabled();
      }

      for (const [name, value] of [
        ["Texto somente leitura", "Código HR-204"],
        ["Descrição somente leitura", "Registro preservado para consulta."],
        ["Data somente leitura", "2026-09-07"],
      ] as const) {
        const control = page.getByLabel(name, { exact: true });
        await expect(control).toHaveAttribute("readonly", "");
        await expect(control).toHaveValue(value);
        await expect(control).toHaveCSS("border-bottom-style", "dashed");
      }

      const focused = page.getByLabel("Texto normal", { exact: true });
      await focused.focus();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Shift+Tab");
      await expect(focused).toBeFocused();
      const focus = await focused.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          visible: element.matches(":focus-visible"),
          width: parseFloat(style.outlineWidth),
        };
      });
      expect(focus.visible).toBe(true);
      expect(focus.width).toBeGreaterThanOrEqual(2);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      ).toBe(true);

      await expectSettled(page);
      const screenshot = testInfo.outputPath(`quiet-fields-${surface}-${width}.png`);
      await capture(page, screenshot);
      await testInfo.attach(`quiet-fields-${surface}-${width}`, {
        path: screenshot,
        contentType: "image/png",
      });
    });
  }

  test(`${surface}: real collection and recovery consumers render shared controls`, async ({
    page,
  }, testInfo) => {
    await openStory(page, "contracts-quiet-fields--collection-consumer", surface);
    await expect(page.getByRole("searchbox", { name: "Buscar conteúdos" })).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Status" })).toBeVisible();
    await expectSettled(page);
    const collection = testInfo.outputPath(`collection-${surface}.png`);
    await capture(page, collection);

    await openStory(page, "contracts-quiet-fields--recovery-consumer", surface);
    const draft = page.getByRole("textbox", { name: "Rascunho", exact: true });
    await expect(draft).toHaveClass(/hw-textarea/);
    await expect(draft).toHaveValue(/Hywork|preservado/);
    await expectSettled(page);
    const recovery = testInfo.outputPath(`recovery-${surface}.png`);
    await capture(page, recovery);
  });
}
