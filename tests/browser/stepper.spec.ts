import { expect, test } from "@playwright/test";
import { openStory } from "./helpers";

/** Uma linha é o contrato: o trilho troca de MODO quando não cabe, nunca quebra
 *  em duas. 672px é a largura do formulário que o hospeda — a mesma em 1440 e
 *  em 1024, que é por que medir o viewport não resolvia. */
const WIDTHS = [1440, 1024, 768, 672, 390, 320];

async function track(page: import("@playwright/test").Page) {
  return page.getByRole("list", { name: "Etapas" }).evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const items = [...element.querySelectorAll("li")];
    const caption = element.parentElement?.querySelector(".hw-stepper__current");
    const labels = [...element.querySelectorAll("button > span:last-child")];
    return {
      rows: new Set(items.map((item) => Math.round(item.getBoundingClientRect().top))).size,
      fits: element.scrollWidth <= element.clientWidth,
      width: Math.round(bounds.width),
      compact: getComputedStyle(labels[0]).position === "absolute",
      caption: caption && getComputedStyle(caption).display !== "none" ? caption.textContent : null,
      labelsVisible: labels.every((label) => label.getBoundingClientRect().width > 1),
      inside: [...element.querySelectorAll("button")].every((button) => {
        const rect = button.getBoundingClientRect();
        return rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1 && button.scrollWidth <= button.clientWidth;
      }),
      documentOverflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });
}

for (const surface of ["admin", "portal"]) {
  for (const story of ["constrained", "full-width"]) {
    test(`${surface} ${story}: five named steps stay on one row at every width`, async ({ page }, testInfo) => {
      const measured: Record<number, unknown> = {};
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 1000 });
        await page.emulateMedia({ reducedMotion: "reduce" });
        await openStory(page, `patterns-stepper--${story}`, surface);
        const geometry = await track(page);
        measured[width] = geometry;
        expect(geometry.rows, `${width}px: linhas do trilho`).toBe(1);
        expect(geometry.fits, `${width}px: sem rolagem interna`).toBe(true);
        expect(geometry.inside, `${width}px: botões dentro do trilho`).toBe(true);
        expect(geometry.documentOverflow, `${width}px: sem overflow horizontal`).toBe(false);
        // Ou os cinco nomes na linha, ou o nome do passo atual logo abaixo dela.
        if (geometry.compact) {
          expect(geometry.caption, `${width}px: nome do passo atual`).toContain("Estrutura");
          expect(geometry.labelsVisible).toBe(false);
        } else {
          expect(geometry.labelsVisible, `${width}px: rótulos legíveis`).toBe(true);
          expect(geometry.caption).toBeNull();
        }
        await page.screenshot({ path: testInfo.outputPath(`stepper-${story}-${width}.png`) });
      }
      console.log(`stepper ${surface} ${story}: ${JSON.stringify(measured)}`);
    });
  }

  test(`${surface}: the compact track keeps every step named for assistive technology`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1000 });
    await openStory(page, "patterns-stepper--constrained", surface);
    const steps = page.getByRole("list", { name: "Etapas" });
    await expect(steps.getByRole("button", { name: /Certificado/ })).toBeDisabled();
    await expect(steps.getByRole("button", { name: "Escolha", exact: true })).toBeVisible();
  });

  for (const width of [1440, 672, 390, 320]) {
    test(`${surface} ${width}: a completed step is reachable by keyboard`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await openStory(page, "patterns-stepper--constrained", surface);
      const steps = page.getByRole("list", { name: "Etapas" });
      await page.keyboard.press("Tab");
      await expect(steps.getByRole("button", { name: "Escolha", exact: true })).toBeFocused();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter");
      await expect(page.getByRole("status")).toHaveText("Etapa selecionada: 2");
    });
  }
}
