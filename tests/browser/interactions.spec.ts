import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
import { writeFile } from "node:fs/promises";
import { openStory, expectSettled } from "./helpers";
import { installOpacityProbe, type OpacityProbeWindow } from "./native-opacity-probe";
import { contrastRatio } from "../../src/lib/theme-validation";

test("long focus content stays readable without overflowing on mobile", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openStory(page, "patterns-modo-foco--long-content", "portal");
  const trigger = page.getByRole("button", {
    exact: true,
    name: "Abrir conteúdo longo",
  });
  await trigger.click();
  await expectSettled(page);
  const sizes = await page
    .locator(".hw-focus-mode, .hw-focus-mode__header, .hw-focus-mode__body")
    .evaluateAll((elements) =>
      elements.map((element) => ({
        client: element.clientWidth,
        right: element.getBoundingClientRect().right,
        scroll: element.scrollWidth,
      }))
    );
  for (const size of sizes) {
    expect(size.scroll).toBeLessThanOrEqual(size.client + 1);
    expect(size.right).toBeLessThanOrEqual(391);
  }
  await expect(
    page.getByRole("button", {
      exact: true,
      name: `Sair de ${"A".repeat(160)}`,
    })
  ).toBeVisible();
  const finish = page.getByRole("button", {
    exact: true,
    name: "Concluir leitura",
  });
  await finish.scrollIntoViewIfNeeded();
  await expect(finish).toBeVisible();
  await expect(finish).toBeEnabled();
  await page.screenshot({
    path: testInfo.outputPath("focus-long-mobile.png"),
  });
  await finish.click();
  await expect(finish).not.toBeVisible();
  await expect(trigger).toBeFocused();

  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

for (const width of [1440, 390]) {
  test(`audited priority domains preserve fields and layouts at ${width}px`, async ({ page }, testInfo) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width, height: 1000 });
    await openStory(page, "pilots-priority-features--academy");
    await page.getByRole("combobox", { name: "Status", exact: true }).click();
    await expect(page.getByRole("option", { name: "Inativo", exact: true })).toBeVisible();
    await expect(page.getByRole("option", { name: "Agendado", exact: true })).toHaveCount(0);
    await page.keyboard.press("Escape");
    await page.screenshot({ path: testInfo.outputPath(`academy-${width}.png`), fullPage: true });

    await openStory(page, "pilots-priority-features--conteudos");
    await page.getByRole("button", { name: "Mais filtros" }).click();
    await page.getByRole("combobox", { name: "Etiqueta", exact: true }).click();
    await page.getByRole("option", { name: "Resultados", exact: true }).click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("table")).toContainText("Resultados do semestre");
    await expect(page.getByRole("table").getByRole("row")).toHaveCount(2);
    await page.screenshot({ path: testInfo.outputPath(`contents-${width}.png`), fullPage: true });

    await openStory(page, "pilots-priority-features--tv-corporativa");
    await expect(page.getByRole("table", { name: "Configurações de TV" })).toContainText("Conteúdos em destaque · Relógio");
    await expect(page.getByRole("combobox", { name: "Unidade" })).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath(`tv-${width}.png`), fullPage: true });

    await openStory(page, "pilots-priority-features--assinaturas-email");
    await expect(page.locator('[data-layout="horizontal"]')).toHaveCSS("flex-direction", "row");
    await expect(page.locator('[data-layout="vertical"]')).toHaveCSS("flex-direction", "column");
    await expect(page.locator('[data-layout="compact"]')).toContainText("E-mail");
    await expect(page.locator('[data-layout="compact"]')).not.toContainText("Telefone");
    await page.screenshot({ path: testInfo.outputPath(`signatures-${width}.png`), fullPage: true });
  });
}

for (const surface of ["admin", "portal"]) {
  test(`${surface}: small Button respects the surface target floor`, async ({ page }, testInfo) => {
    await openStory(page, "contracts-core-families--menus-contract", surface);
    await page.getByRole("button", { name: "Ver contexto" }).click();
    const small = page.getByRole("button", { name: "Fechar", exact: true });
    await expect(small).toHaveAttribute("data-size", "sm");
    await expectSettled(page);
    const rect = await small.boundingBox();
    expect(rect!.height).toBeGreaterThanOrEqual(surface === "admin" ? 32 : 44);
    expect(rect!.width).toBeGreaterThanOrEqual(surface === "admin" ? 32 : 44);
    const screenshot = testInfo.outputPath(`small-${surface}.png`);
    await page.screenshot({ path: screenshot });
    await testInfo.attach(`small-${surface}`, { path: screenshot, contentType: "image/png" });
  });

  test(`${surface}: Select ArrowDown focuses an unclipped orange option ring`, async ({ page }, testInfo) => {
    await openStory(page, "contracts-core-families--select-contract", surface);
    const trigger = page.getByRole("combobox", { name: "Status", exact: true });
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("option", { name: "Ativas", exact: true })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    const option = page.getByRole("option", { name: "Arquivadas", exact: true });
    await expect(option).toBeFocused();
    await expectSettled(page);
    const focus = await option.evaluate((element) => {
      const css = getComputedStyle(element), rect = element.getBoundingClientRect();
      const probe = document.createElement("i");
      probe.style.color = "var(--hw-focus)";
      element.append(probe);
      const token = getComputedStyle(probe).color;
      probe.remove();
      const extent = Math.max(0, parseFloat(css.outlineWidth) + parseFloat(css.outlineOffset));
      let unclipped = true;
      for (let parent = element.parentElement; parent; parent = parent.parentElement) {
        const style = getComputedStyle(parent), bounds = parent.getBoundingClientRect();
        if (/(hidden|clip|auto|scroll)/.test(style.overflowX)) unclipped &&= rect.left - extent >= bounds.left && rect.right + extent <= bounds.right;
        if (/(hidden|clip|auto|scroll)/.test(style.overflowY)) unclipped &&= rect.top - extent >= bounds.top && rect.bottom + extent <= bounds.bottom;
      }
      return { visible: element.matches(":focus-visible"), color: css.outlineColor, width: parseFloat(css.outlineWidth), token, unclipped };
    });
    expect(focus.visible).toBe(true);
    expect(focus.width).toBeGreaterThanOrEqual(2);
    expect(focus.color).toBe(focus.token);
    expect(focus.token).toBe("rgb(233, 80, 27)");
    expect(focus.unclipped).toBe(true);
    const screenshot = testInfo.outputPath(`select-focus-${surface}.png`);
    await page.screenshot({ path: screenshot });
    await testInfo.attach(`select-focus-${surface}`, { path: screenshot, contentType: "image/png" });
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  });
}

const require = createRequire(import.meta.url);
const workspace = "lab-interface-details--workspace";

type MotionChange = {
  atChange: number; inert: boolean; trusted: boolean; matches: boolean;
  heldStateAtChange: string | null; heldPendingAtChange: boolean | null;
  heldTimeAtChange: number | null; timeOrigin: number;
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

test("native opacity observer reports bounded absence for instant keyboard entry", async ({ page }) => {
  await page.addInitScript(installOpacityProbe);
  await openStory(page, workspace);
  const select = page.getByLabel("Selecionar página", { exact: true });
  await select.focus();
  await page.evaluate(() => (window as unknown as OpacityProbeWindow).opacityProbe.arm());
  await page.keyboard.press("Space");
  await page.evaluate(() => (window as unknown as OpacityProbeWindow).opacityProbe.actionComplete());
  const result = await page.evaluate(() => (window as unknown as OpacityProbeWindow).opacityProbe.result);
  expect(result.status).toBe("failed");
  if (result.status !== "failed") throw new Error("Instant entry must not manufacture native motion evidence");
  expect(result.reason).toBe("no-native-opacity-birth");
  await expect(page.locator("[data-pilot-motion]")).toHaveAttribute("data-pilot-motion", "instant");
  await expect(page.locator("[data-pilot-presence]")).toHaveCSS("opacity", "1");
});

for (const direction of ["entry", "exit"] as const) {
  test(`reduced preference interrupts rendered ${direction} mid-flight without reload`, async ({ page }, testInfo) => {
    await page.addInitScript(installOpacityProbe);
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
          resolve({ atChange: before ? Number(getComputedStyle(before).opacity) : -1,
            inert: !before || (before as HTMLElement).inert, trusted: event.isTrusted, matches: event.matches,
            heldStateAtChange: probe.heldAnimation?.playState ?? null,
            heldPendingAtChange: probe.heldAnimation?.pending ?? null,
            heldTimeAtChange: probe.heldAnimation?.currentTime == null ? null : Number(probe.heldAnimation.currentTime),
            timeOrigin: performance.timeOrigin });
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
    // Acknowledge arming synchronously before dispatching the real pointer action.
    await page.evaluate(() => (window as unknown as OpacityProbeWindow).opacityProbe.arm());
    await select.click();
    await page.evaluate(() => (window as unknown as OpacityProbeWindow).opacityProbe.actionComplete());
    const partial = await page.evaluate(() => (window as unknown as OpacityProbeWindow).opacityProbe.result);
    const observationEvidence = testInfo.outputPath("native-opacity-observation.json");
    await writeFile(observationEvidence, JSON.stringify(partial, null, 2));
    await testInfo.attach("native-opacity-observation", { path: observationEvidence, contentType: "application/json" });
    if (partial.status === "failed") throw new Error(`Native opacity observation failed: ${JSON.stringify(partial)}`);
    const { opacity, progress, playState, pending, heldTime, seekTime, commitFrames, source, sameNativeAnimation } = partial;
    expect(sameNativeAnimation, "hold the exact native animation returned to Motion at birth").toBe(true);
    expect(heldTime, "held at the test-chosen point, not wherever the real clock left it").toBe(seekTime);
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThan(1);
    expect(opacity).toBeGreaterThan(0);
    expect(opacity).toBeLessThan(1);
    expect(playState, "native partial opacity must be held before crossing the media protocol boundary").toBe("paused");
    expect(pending, "native pause operation must be committed before changing the media preference").toBe(false);
    const partialImage = testInfo.outputPath("paused-partial-frame.png");
    await page.screenshot({ path: partialImage, animations: "allow" });
    await testInfo.attach("paused-partial-frame", { path: partialImage, contentType: "image/png" });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const result = await page.evaluate(() => (window as unknown as { motionChange: Promise<MotionChange> }).motionChange);
    // The held animation cannot advance or finish on its own: only the app's
    // reaction to the preference can cancel it, so waiting for that is no race.
    await expect.poll(() => page.evaluate(() => (window as unknown as OpacityProbeWindow).heldAnimation?.playState ?? null),
      { message: "application must cancel the held native animation" }).toBe("idle");
    const settled = await page.evaluate(() => {
      const element = document.querySelector("[data-pilot-presence]");
      return { finalOpacity: element ? getComputedStyle(element).opacity : null,
        finalHeight: element ? (element as HTMLElement).style.height : null,
        policy: document.querySelector("[data-pilot-motion]")?.getAttribute("data-pilot-motion") ?? null,
        timeOrigin: performance.timeOrigin };
    });
    const motionEvidence = testInfo.outputPath("rendered-interruption.json");
    await writeFile(motionEvidence, JSON.stringify({ direction,
      harnessControl: "hold the app's native opacity animation at birth, seeked to half its active duration",
      observationSource: source, sameNativeAnimation,
      heldOpacity: opacity, heldProgress: progress, heldTime, seekTime, commitFrames, ...result, settled }, null, 2));
    await testInfo.attach("rendered-interruption", { path: motionEvidence, contentType: "application/json" });
    expect(result.atChange, "preference must change while the held partial frame is on screen").toBe(opacity);
    expect(result.trusted, "preference event must come from the browser, not a dispatched fixture").toBe(true);
    expect(result.matches).toBe(true);
    expect(result.heldStateAtChange).toBe("paused");
    expect(result.heldPendingAtChange).toBe(false);
    expect(result.heldTimeAtChange).toBe(heldTime);
    expect(result.timeOrigin, "preference changes without reloading the document").toBe(timeOrigin);
    expect(settled.timeOrigin, "interruption settles without reloading the document").toBe(timeOrigin);
    expect(settled.policy).toBe("instant");
    if (direction === "entry") {
      expect(settled.finalOpacity).toBe("1");
      expect(settled.finalHeight).toBe("auto");
    } else {
      expect(result.inert, "outgoing controls already inert at preference change").toBe(true);
      await expect(page.locator("[data-pilot-presence]")).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Limpar seleção de todas as páginas" })).toHaveCount(0);
    }
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(page.locator("[data-pilot-motion]")).toHaveAttribute("data-pilot-motion", "full");
  });
}

/**
 * A faixa de ações é linha do diálogo, não fim do formulário. A medição de
 * 15/09 encontrou a primária abaixo da dobra na etapa 2 em cinco dos seis
 * viewports e na última etapa em TODOS — o passo em que o usuário salva era o
 * passo em que o botão de salvar ficava mais longe da vista.
 */
for (const width of [1440, 1280, 1024, 768, 390, 320]) {
  test(`${width}: back and primary stay visible in every step of the focus flow`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: width < 768 ? 568 : 800 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openStory(page, "patterns-modo-foco--criacao-de-campanha", "admin");
    await page.getByRole("button", { name: "Criar campanha", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Criar campanha" });
    // R29: o foco entra no primeiro campo do corpo, não na saída.
    await expect(dialog.getByLabel("Canal")).toBeFocused();
    const band = page.locator(".hw-focus-mode__actions");
    for (const step of ["Continuar para público", "Continuar para conteúdo", "Revisar campanha", "Salvar rascunho local"]) {
      const primary = page.getByRole("button", { name: step, exact: true });
      await expect(primary).toBeInViewport({ ratio: 1 });
      await expect(page.getByRole("button", { name: "Voltar", exact: true })).toBeInViewport({ ratio: 1 });
      const geometry = await band.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { bottom: rect.bottom, height: rect.height, inner: window.innerHeight };
      });
      expect(geometry.bottom).toBeLessThanOrEqual(geometry.inner + 1);
      expect(geometry.height).toBeGreaterThan(0);
      if (step === "Salvar rascunho local") break;
      if (step === "Revisar campanha") {
        await page.getByLabel("Título da campanha").fill("Integração");
        await page.getByLabel("Mensagem").fill("Rascunho local.");
      }
      await primary.click();
    }
    await page.screenshot({ path: testInfo.outputPath(`focus-actions-${width}.png`) });
  });
}

/**
 * Alvo de toque das seleções. Os três controles são desenhados pelo DS com
 * `appearance: none`, então o pseudo-elemento vale em todos: o alvo do próprio
 * controle vai a 24px sem mexer nos 16px desenhados, e é isso que se mede por
 * `elementsFromPoint` — o que RECEBE o clique, não o que aparece. O alvo
 * confortável (32px no admin, 44px no portal e abaixo de 640px) continua sendo
 * o rótulo clicável, que ocupa a linha inteira.
 *
 * O limite do controle também entra aqui: com aparência nativa ele era o cinza
 * que cada navegador escolhia (Firefox reprovava o piso de 3:1 da WCAG 1.4.11),
 * e agora é `--hw-input-border`, medido contra a superfície realmente pintada.
 */
for (const width of [1440, 390]) {
  test(`${width}: selection controls hand the click to a target that meets the minimum`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
    await openStory(page, "components-seleção--interactive", "admin");
    const minimum = width < 640 ? 44 : 32;
    const measured = await page.evaluate((floor) => {
      const controls = [...document.querySelectorAll<HTMLInputElement>(".hw-choice")];
      const centre = (element: Element) => {
        const box = element.getBoundingClientRect();
        return { x: box.left + box.width / 2, y: box.top + box.height / 2, box };
      };
      const around = (element: Element) => {
        let node: Element | null = element.parentElement;
        while (node) {
          const paint = getComputedStyle(node).backgroundColor;
          const parts = paint.match(/[\d.]+/g);
          if (parts && (parts.length < 4 || Number(parts[3]) > 0)) return paint;
          node = node.parentElement;
        }
        return "";
      };
      return controls.map((input) => {
        const own = centre(input);
        const label = input.closest("label");
        const labelBox = label?.getBoundingClientRect();
        const style = getComputedStyle(input);
        // elementsFromPoint, e não elementFromPoint: o rótulo cobre o controle na
        // pilha, e o que importa é o controle RECEBER o ponto, não estar no topo.
        const reach = (dx: number, dy: number) =>
          document.elementsFromPoint(own.x + dx, own.y + dy).includes(input);
        // Exceção de espaçamento: nenhum outro controle dentro de 24px de centro a centro.
        const crowded = controls.some((other) => {
          if (other === input) return false;
          const neighbour = centre(other);
          return Math.hypot(neighbour.x - own.x, neighbour.y - own.y) < 24;
        });
        return {
          name: input.getAttribute("aria-label") ?? label?.textContent?.trim().slice(0, 28) ?? input.type,
          appearance: style.appearance,
          around: around(input),
          boundary: style.borderTopColor,
          box: [Math.round(own.box.width), Math.round(own.box.height)],
          label: labelBox ? [Math.round(labelBox.width), Math.round(labelBox.height)] : null,
          switch: input.classList.contains("hw-switch"),
          hit24: reach(-11, -11) && reach(11, 11) && reach(-11, 11) && reach(11, -11),
          spaced: !crowded,
          labelMeets: labelBox ? labelBox.height >= floor : false,
        };
      });
    }, minimum);
    console.log(`selection targets ${width}: ${JSON.stringify(measured)}`);
    expect(measured.length).toBeGreaterThan(0);
    for (const control of measured) {
      const detail = JSON.stringify(control);
      // Agora o alvo é do PRÓPRIO controle, nos três. A exceção de espaçamento
      // segue medida, porque ela é o que impede um alvo de roubar o vizinho.
      expect(control.appearance, `controle desenhado pelo DS: ${detail}`).toBe("none");
      expect(control.hit24, `WCAG 2.5.8 no próprio controle: ${detail}`).toBe(true);
      expect(control.spaced, `alvos de 24px não se cruzam: ${detail}`).toBe(true);
      expect(control.labelMeets, `rótulo clicável: ${detail}`).toBe(true);
      // WCAG 1.4.11: o limite do controle contra a superfície realmente pintada.
      expect(
        contrastRatio(control.boundary, control.around) ?? 0,
        `limite do controle: ${detail}`,
      ).toBeGreaterThanOrEqual(3);
    }
    await page.screenshot({ path: testInfo.outputPath(`selection-targets-${width}.png`) });
  });
}

/* R13 — destrutiva em CONTORNO. O contrato do Storybook mede o repouso; aqui
   medem-se os estados que só existem com ponteiro e teclado reais: `userEvent`
   dispara evento sintético e NÃO acende `:hover` nem `:focus-visible` no CSS. */
for (const surface of ["admin", "portal"] as const) {
  test(`${surface}: destructive outline keeps its rust boundary through hover and focus`, async ({
    page,
  }, testInfo) => {
    await openStory(page, "contracts-core-families--destructive-choice", surface);
    const destructive = page.getByRole("button", { name: "Descartar 12 alterações" });
    const affirmative = page.getByRole("button", { name: "Continuar editando" });

    const read = () =>
      destructive.evaluate((element) => {
        const style = getComputedStyle(element);
        // Fundo translúcido = "este ancestral não pinta nada". Lido pela alfa do
        // valor computado, sem escrever uma cor literal no repositório.
        const opaque = (value: string) => {
          const parts = value.match(/[\d.]+/g);
          return Boolean(parts) && (parts!.length < 4 || Number(parts![3]) > 0);
        };
        let node: Element | null = element.parentElement;
        let around = "";
        while (node) {
          around = getComputedStyle(node).backgroundColor;
          if (opaque(around)) break;
          node = node.parentElement;
        }
        return {
          around,
          background: style.backgroundColor,
          border: style.borderTopColor,
          color: style.color,
          outlineColor: style.outlineColor,
          outlineWidth: parseFloat(style.outlineWidth),
          visible: element.matches(":focus-visible"),
        };
      });

    // Valor computado do papel, para esperar o campo CHEGAR nele.
    const resolved = (token: string) =>
      page.evaluate((name) => {
        const probe = document.createElement("span");
        probe.style.backgroundColor = `var(${name})`;
        document.body.append(probe);
        const value = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return value;
      }, token);

    const rest = await read();
    await destructive.hover();
    /* `background` está na lista de transição do botão: ler logo após o ponteiro
       devolve o valor INTERPOLADO, quase o de repouso — e "mudou de cor" como
       condição de parada aceita o primeiro passo da interpolação. O teste mediria
       um branco levemente sujo e chamaria isso de hover. A condição é chegar ao
       papel, não sair do repouso. */
    await expect(destructive).toHaveCSS("background-color", await resolved("--hw-danger-soft"));
    const hover = await read();
    await page.mouse.move(0, 0);
    await expect(destructive).toHaveCSS("background-color", rest.background);
    await affirmative.focus();
    await page.keyboard.press("Shift+Tab");
    await expect(destructive).toBeFocused();
    const focus = await read();
    console.log(
      `destructive outline ${surface}: ${JSON.stringify({ rest, hover, focus })}`,
    );

    // Repouso: contorno sobre a superfície, borda e tinta no mesmo papel.
    expect(rest.background).toBe(rest.around);
    expect(rest.border).toBe(rest.color);
    expect(contrastRatio(rest.color, rest.background) ?? 0).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(rest.border, rest.around) ?? 0).toBeGreaterThanOrEqual(3);

    // Hover: preenche com o par suave de erro; a tinta de erro permanece.
    expect(hover.background).not.toBe(rest.background);
    expect(hover.color).toBe(rest.color);
    expect(contrastRatio(hover.color, hover.background) ?? 0).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(hover.border, hover.background) ?? 0).toBeGreaterThanOrEqual(3);

    // Foco: anel do sistema, e a borda de erro continua desenhada por baixo.
    expect(focus.visible).toBe(true);
    expect(focus.outlineWidth).toBeGreaterThanOrEqual(2);
    expect(focus.border).toBe(rest.border);
    expect(contrastRatio(focus.outlineColor, focus.around) ?? 0).toBeGreaterThanOrEqual(3);

    await page.screenshot({ path: testInfo.outputPath(`destructive-outline-${surface}.png`) });
  });
}
