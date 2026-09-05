import { expect, type Page } from "@playwright/test";

export async function openStory(page: Page, id: string, surface = "admin") {
  await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=surface:${surface}`);
  await expect(page.locator("#storybook-root")).not.toBeEmpty();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await document.fonts.load('400 16px "Montserrat"');
  });
  await expect(page.locator("html")).toHaveAttribute("data-surface", surface);
}

export async function expectSettled(page: Page) {
  await page.waitForFunction(() => document.getAnimations().every((animation) => animation.playState !== "running"));
  expect(await page.evaluate(() => [...document.fonts].some((font) => font.family.includes("Montserrat") && font.status === "loaded"))).toBe(true);
}
