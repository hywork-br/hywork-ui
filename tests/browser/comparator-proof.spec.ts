import { test, expect } from "@playwright/test";
import { captureVisualCandidate } from "./helpers";

test("controlled comparator fixture", async ({ page }, testInfo) => {
  // Disposable harness fixture: never updates or approves a product baseline.
  await page.setContent('<main><h1>Contract proof</h1><p>Deterministic comparator fixture</p></main>');
  if (process.env.PW_PROOF_MISSING === "1") await page.locator("main").evaluate((element) => { (element as HTMLElement).style.minHeight = "1400px"; });
  if (process.env.PW_PROOF_MUTATION === "1") {
    await page.locator("main").evaluate((element) => { (element as HTMLElement).style.paddingTop = "40px"; });
  }
  await captureVisualCandidate(page, testInfo, "controlled");
  await expect(page).toHaveScreenshot(process.env.PW_PROOF_MISSING === "1" ? "must-not-exist.png" : "controlled.png", { fullPage: true });
});
