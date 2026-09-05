import { test, expect } from "@playwright/test";
import { openStory, expectSettled } from "./helpers";

for (const scene of [
  { name: "quality-admin", id: "lab-interface-details--workspace", width: 1440, height: 1000, surface: "admin" },
  { name: "collection-admin", id: "patterns-coleções-operacionais--baseline", width: 1440, height: 1000, surface: "admin" },
  { name: "quality-mobile", id: "lab-interface-details--workspace", width: 390, height: 844, surface: "portal" },
]) {
  test(scene.name, async ({ page }) => {
    expect(process.platform, "Linux pixels require the pinned Playwright Noble CI container").toBe("linux");
    await page.setViewportSize({ width: scene.width, height: scene.height });
    await openStory(page, scene.id, scene.surface);
    await expect(page.getByRole("searchbox")).toHaveValue("");
    await expect(page.getByText("1–5 de 12")).toBeVisible();
    await expectSettled(page);
    await expect(page).toHaveScreenshot(`${scene.name}.png`, { fullPage: true });
  });
}
