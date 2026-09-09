import { setPreVisit, setPostVisit, waitForPageReady } from "@storybook/test-runner";

// Official runner hooks registered through Jest's own setup extension point.
// Storybook 10's TypeScript config loader registers Node module hooks, which
// Jest cannot apply inside its sandbox. Keep application configuration unchanged.
setPreVisit(async (page) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => sessionStorage.clear());
});
setPostVisit(async (page) => { await waitForPageReady(page); });
