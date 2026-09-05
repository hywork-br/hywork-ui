import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  forbidOnly: !!process.env.CI,
  updateSnapshots: "none",
  snapshotPathTemplate: "{testDir}/../visual/deterministic/{projectName}/{arg}{ext}",
  outputDir: `test-results/${process.env.PW_GATE ?? "browser"}`,
  reporter: [["list"], ["html", { outputFolder: `playwright-report/${process.env.PW_GATE ?? "browser"}`, open: "never" }]],
  expect: { timeout: 5000, toHaveScreenshot: { animations: "allow", caret: "hide", maxDiffPixels: 0 } },
  use: {
    baseURL: "http://127.0.0.1:6007", viewport: { width: 1440, height: 1000 },
    locale: "pt-BR", timezoneId: "America/Sao_Paulo", colorScheme: "light",
    deviceScaleFactor: 1, reducedMotion: "no-preference", trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", testMatch: "**/interactions.spec.ts", use: { browserName: "chromium" } },
    { name: "firefox", testMatch: "**/interactions.spec.ts", use: { browserName: "firefox" } },
    { name: "linux-visual", testMatch: "**/visual.spec.ts", use: { browserName: "chromium" } },
    { name: "comparator-proof", testMatch: "**/comparator-proof.spec.ts", snapshotPathTemplate: "{testDir}/../../test-results/comparator-baselines/{arg}{ext}", use: { browserName: "chromium" } },
  ],
  webServer: { command: "node scripts/serve-storybook.mjs", url: "http://127.0.0.1:6007/index.json", reuseExistingServer: false },
});
