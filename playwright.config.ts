import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: ["reader.spec.ts", "nt-research.spec.ts"],
  timeout: 90_000,
  expect: { timeout: 15_000 },
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4175",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "pixel7", use: { ...devices["Pixel 7"] } },
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
    { name: "narrow", use: { ...devices["Pixel 7"], viewport: { width: 360, height: 800 } } },
    { name: "mobileWebKit", use: { ...devices["iPhone 13"], viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4175 --strictPort",
    url: "http://127.0.0.1:4175",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});