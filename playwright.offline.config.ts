import { defineConfig } from "@playwright/test";
import readerConfig from "./playwright.config";

export default defineConfig({
  ...readerConfig,
  testMatch: "offline.spec.ts",
  outputDir: "test-results/offline",
});