import { test, expect } from "@playwright/test";

test("controlled comparator fixture", async ({ page }) => {
  // Disposable harness fixture: never updates or approves a product baseline.
  await page.setContent('<main><h1>Contract proof</h1><p>Deterministic comparator fixture</p></main>');
  if (process.env.PW_PROOF_MUTATION === "1") {
    await page.locator("main").evaluate((element) => { (element as HTMLElement).style.paddingTop = "40px"; });
  }
  await expect(page).toHaveScreenshot("controlled.png");
});
