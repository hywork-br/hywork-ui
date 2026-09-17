import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser", workers: 1, retries: 0, timeout: 60000,
  forbidOnly: !!process.env.CI, reporter: [["list"], ["html", {open:"never"}]],
  use: {baseURL: "http://127.0.0.1:6017", locale: "pt-BR", timezoneId: "America/Sao_Paulo", deviceScaleFactor:1, reducedMotion:"reduce", trace:"retain-on-failure"},
  projects: [{name:"chromium",use:{browserName:"chromium"}}, {name:"firefox",use:{browserName:"firefox"}}],
  webServer: {command:"npm run build:css && vite --host 127.0.0.1 --port 6017 --strictPort",url:"http://127.0.0.1:6017/tests/fixtures/parity.html",reuseExistingServer:false},
});
