import { expect, test } from "@playwright/test";

test("warmed service-worker cache reloads the Hebrew reader offline", async ({ page, context }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText("Gen 1:1");
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller), { timeout: 90_000 }).toBe(true);
  await expect.poll(() => page.evaluate(async () => !!await caches.match("/assets/Gen.xml", { ignoreSearch: true }))).toBe(true);
  await expect.poll(() => page.evaluate(async () => !!await caches.match("/assets/strongs_hebrew.xml", { ignoreSearch: true }))).toBe(true);
  await context.setOffline(true);
  try {
    await page.reload();
    await expect(page.locator("h1")).toHaveText("Gen 1:1");
    await expect(page.locator("main [dir] button")).toHaveCount(7);
    await page.locator("main [dir] button").first().click();
    await expect(page.locator("h2")).toContainText("בְּ/רֵאשִׁ֖ית");
  } finally {
    await context.setOffline(false);
  }
});