import { expect, test } from "@playwright/test";

import { expectSettled, openStory } from "./helpers";

const storyId = "navigation-administration--grouped-responsive";
const widths = [1440, 768, 390, 320] as const;

test('portal shell keeps touch density and focus in mobile navigation', async ({page}, testInfo) => {
  await page.setViewportSize({width:390,height:844}); await page.emulateMedia({reducedMotion:'reduce'});
  await openStory(page,'navigation-administration--employee-portal','admin');
  await expect(page.locator('.hw-admin-shell')).toHaveAttribute('data-surface','portal');
  const trigger = page.getByRole('button',{name:'Abrir navegação'}); await trigger.click();
  const dialog = page.getByRole('dialog',{name:'Navegação principal'}); await expect(dialog).toHaveAttribute('data-surface','portal');
  const link = dialog.getByRole('link',{name:'Meu dia',exact:true}); await expect(link).toBeFocused();
  expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await capture(page,testInfo.outputPath('portal-navigation-mobile.png')); await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
});

for (const variant of ["no-current-item", "unknown-current-item", "empty-navigation"]) {
  test(`mobile focus fallback: ${variant}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await openStory(page, `navigation-administration--${variant}`, "admin");
    const trigger = page.getByRole("button", { name: "Abrir navegação" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Navegação principal" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Fechar navegação" })).toBeFocused();
    await capture(page, testInfo.outputPath(`navigation-${variant}.png`));
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.setViewportSize({ width: 1440, height: 800 });
    await expect(dialog).not.toBeVisible();
    const destination = variant === "empty-navigation" ? page.locator(".hw-admin-shell__content") : page.locator('.hw-admin-shell__sidebar .hw-shell-navigation a').first();
    await expect(destination).toBeFocused();
    await expect(destination).toBeInViewport();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  });
}

async function capture(page: Parameters<typeof openStory>[0], path: string) {
  await expectSettled(page);
  await page.screenshot({
    animations: "allow",
    caret: "hide",
    fullPage: false,
    path,
  });
}

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test.describe(`motion: ${reducedMotion}`, () => {
    test.use({ reducedMotion });

    for (const width of widths) {
      test(`${width}px keeps administration navigation operable`, async ({
        page,
      }, testInfo) => {
        await page.setViewportSize({ width, height: 800 });
        await openStory(page, storyId, "admin");

        await expect(page.getByRole("main")).toBeVisible();
        await expect(page.getByRole("main")).toHaveCount(1);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth
          )
        ).toBe(true);

        const skipLink = page.getByRole("link", {
          name: "Pular para o conteúdo",
        });
        expect(
          (await page.locator(".hw-admin-shell__skip-link").boundingBox())?.y
        ).toBeLessThan(0);
        await page.keyboard.press("Tab");
        await expect(skipLink).toBeFocused();
        await expect(skipLink).toBeVisible();
        expect((await skipLink.boundingBox())?.y).toBeGreaterThanOrEqual(0);
        await page.keyboard.press("Enter");
        await expect(page.locator("#administration-content")).toBeFocused();

        if (width === 1440) {
          await expect(
            page.getByRole("link", { name: "Academy", exact: true })
          ).toHaveAttribute("aria-current", "page");
          const sidebar = page.locator(".hw-admin-shell__sidebar");
          await expect(sidebar).toBeVisible();
          await expect(sidebar).toHaveCSS("overflow-y", "auto");
          expect(
            await sidebar.evaluate(
              (element) => element.scrollHeight > element.clientHeight
            )
          ).toBe(true);
          await page
            .getByRole("button", { name: "Minha conta" })
            .scrollIntoViewIfNeeded();
          await expect(
            page.getByRole("button", { name: "Minha conta" })
          ).toBeVisible();
          const screenshot = testInfo.outputPath(
            `navigation-desktop-${reducedMotion}.png`
          );
          await capture(page, screenshot);
          await testInfo.attach(`desktop ${reducedMotion}`, {
            contentType: "image/png",
            path: screenshot,
          });
          return;
        }

        const trigger = page.getByRole("button", { name: "Abrir navegação" });
        await expect(page.locator(".hw-admin-shell__mobile-header")).toHaveCSS(
          "display",
          "flex"
        );
        await expect(trigger).toHaveAttribute("aria-expanded", "false");
        await trigger.focus();
        await page.keyboard.press("Enter");
        const dialog = page.getByRole("dialog", {
          name: "Navegação principal",
        });
        await expect(dialog).toBeVisible();
        await expectSettled(page);
        await expect(
          dialog.getByRole("link", { name: "Academy", exact: true })
        ).toHaveAttribute("aria-current", "page");
        await expect(dialog.locator('[aria-current="page"]')).toBeFocused();
        const modifiedDestination = dialog.getByRole("link", {
          name: "Visão geral",
          exact: true,
        });
        const newPagePromise = page.context().waitForEvent("page");
        await modifiedDestination.click({ button: "middle" });
        const newPage = await newPagePromise;
        await newPage.close();
        await expect(dialog).toBeVisible();
        const panelBounds = await dialog.boundingBox();
        expect(panelBounds?.y).toBe(0);
        expect(
          Math.round((panelBounds?.x ?? 0) + (panelBounds?.width ?? 0))
        ).toBe(width);
        expect(Math.round(panelBounds?.height ?? 0)).toBe(800);
        const inversePaint = await dialog.evaluate((element) => {
          const probe = document.createElement("div");
          probe.style.background = "var(--hw-surface-inverse)";
          element.append(probe);
          const result = {
            panel: getComputedStyle(element).backgroundColor,
            token: getComputedStyle(probe).backgroundColor,
          };
          probe.remove();
          return result;
        });
        expect(inversePaint.panel).toBe(inversePaint.token);
        expect(
          await dialog.evaluate((element) =>
            element.contains(document.activeElement)
          )
        ).toBe(true);
        await page.keyboard.press("Tab");
        expect(
          await dialog.evaluate((element) =>
            element.contains(document.activeElement)
          )
        ).toBe(true);
        await page.keyboard.press("Shift+Tab");
        expect(
          await dialog.evaluate((element) =>
            element.contains(document.activeElement)
          )
        ).toBe(true);
        if (reducedMotion === "reduce") {
          await expect(dialog).toHaveCSS("animation-name", "none");
        }

        const account = dialog.getByRole("button", { name: "Minha conta" });
        await account.scrollIntoViewIfNeeded();
        await expect(account).toBeVisible();
        await account.click();
        await expect(dialog.getByRole("status")).toContainText("Ana Lima");

        const lastItem = dialog.getByRole("link", {
          name: "Governança e configurações avançadas do workspace",
          exact: true,
        });
        await lastItem.scrollIntoViewIfNeeded();
        await expect(lastItem).toBeVisible();
        expect(
          (await page.locator(".hw-admin-shell__skip-link").boundingBox())?.y
        ).toBeLessThan(0);
        const openScreenshot = testInfo.outputPath(
          `navigation-mobile-open-${width}-${reducedMotion}.png`
        );
        await capture(page, openScreenshot);

        await page.keyboard.press("Escape");
        await expect(dialog).not.toBeVisible();
        await expect(trigger).toBeFocused();

        await trigger.click();
        await page
          .locator(".hw-dialog__overlay")
          .click({ position: { x: 2, y: 2 } });
        await expect(dialog).not.toBeVisible();
        await expect(trigger).toBeFocused();

        await trigger.click();
        await dialog.getByRole("button", { name: "Fechar navegação" }).click();
        await expect(dialog).not.toBeVisible();
        await expect(trigger).toBeFocused();

        await trigger.click();
        await lastItem.click();
        await expect(dialog).not.toBeVisible();
        await expect(page).toHaveURL(/#destination-governance$/);

        await trigger.click();
        await page.setViewportSize({ width: 1440, height: 800 });
        await expect(dialog).not.toBeVisible();
        await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
        const desktopCurrent = page.locator(
          '.hw-admin-shell__sidebar [aria-current="page"]'
        );
        await expect(desktopCurrent).toBeFocused();
        await expect(desktopCurrent).toBeInViewport();
        expect((await skipLink.boundingBox())?.y).toBeLessThan(0);

        const dismissedScreenshot = testInfo.outputPath(
          `navigation-post-dismiss-${width}-${reducedMotion}.png`
        );
        await capture(page, dismissedScreenshot);
        await testInfo.attach(`mobile open ${width} ${reducedMotion}`, {
          contentType: "image/png",
          path: openScreenshot,
        });
        await testInfo.attach(`post dismiss ${width} ${reducedMotion}`, {
          contentType: "image/png",
          path: dismissedScreenshot,
        });
      });
    }
  });
}
