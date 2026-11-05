import { expect, test } from "@playwright/test";

test.describe("production reader smoke", () => {
  test.use({ serviceWorkers: "block" });

  test.beforeEach(async ({ page }) => {
    await page.route("https://formspree.io/**", (route) => route.abort());
  });

  test("Hebrew/Greek selection, keyboard access, navigation and viewport", async ({ page }, testInfo) => {
    await page.goto("/#ref=Gen.1.1");
    await expect(page.locator("h1")).toHaveText("Gen 1:1");
    const words = page.locator("main [dir]");
    await expect(words).toHaveAttribute("dir", "rtl");
    await expect(words.locator("button")).toHaveCount(7);
    await expect(words.locator("button").first()).toContainText("בְּ/רֵאשִׁ֖ית");
    await expect.poll(() => page.locator("body").evaluate((element) => getComputedStyle(element).backgroundColor))
      .toBe("rgb(2, 6, 23)");
    await words.locator("button").first().focus();
    await expect(words.locator("button").first()).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("h2")).toContainText("בְּ/רֵאשִׁ֖ית");
    await expect(page.getByText("H7225", { exact: false }).first()).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("hebrew.png"), fullPage: true });

    const reference = page.getByPlaceholder("Enter Bible reference", { exact: false });
    await reference.fill("Matt 1:1");
    await reference.press("Enter");
    await expect(page.locator("h1")).toHaveText("Matt 1:1");
    const matthew = page.locator('[data-reference="Matt.1.1"]');
    await expect(matthew.locator("[dir]")).toHaveAttribute("dir", "ltr");
    await expect(matthew.locator("button")).toHaveCount(8);
    await matthew.locator("button").first().click();
    await expect(page.locator("h2")).toContainText("Βίβλος");
    await expect(page.getByText("Lemma: βίβλος", { exact: true })).toBeVisible();
    await page.getByText("Source and coverage", { exact: false }).click();
    await expect(page.locator("footer a").first()).toBeVisible();
    await expect(page.locator("footer a")).toHaveCount(5);
    await page.screenshot({ path: testInfo.outputPath("greek.png"), fullPage: true });
    await page.locator("h1").click();
    await expect(matthew.locator('[aria-pressed="true"]')).toHaveCount(0);
    await page.getByRole("navigation", { name: "Passage navigation" }).getByRole("button", { name: "Next verse", exact: true }).click();
    await expect(page.locator("h1")).toHaveText("Matt 1:2");
    await reference.fill("Jude 1:25");
    await reference.press("Enter");
    await expect(page.locator("h1")).toHaveText("Jude 1:25");
    await page.getByRole("navigation", { name: "Passage navigation" }).getByRole("button", { name: "Next verse", exact: true }).click();
    await expect(page.locator("h1")).toHaveText("Rev 1:1");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("missing lexical link and failed XML load preserve the reader", async ({ page }) => {
    await page.route(/\/assets\/nt\/John\.[^/]+\.json(?:\?.*)?$/, (route) => route.fulfill({ contentType: "text/html", body: "<html>Unavailable test response</html>" }));
    await page.goto("/#ref=Gen.1.1");
    await expect(page.locator("h1")).toHaveText("Gen 1:1");
    const reference = page.getByPlaceholder("Enter Bible reference", { exact: false });
    await reference.fill("Matt 1:1");
    await reference.press("Enter");
    await expect(page.locator("h1")).toHaveText("Matt 1:1");
    const matthew = page.locator('[data-reference="Matt.1.1"]');
    await expect(matthew.locator("button")).toHaveCount(8);
    await matthew.getByRole("button", { name: "Select Δαυὶδ", exact: true }).click();
    await expect(page.getByText("No verified dictionary linkage in this corpus.", { exact: true })).toBeVisible();
    await reference.fill("John 1:1");
    await reference.press("Enter");
    await expect(page.getByRole("alert")).toContainText(/HTML|JSON|content.type/i);
    await expect(page.getByRole("button", { name: "Retry passage" })).toBeVisible();
    await expect(page.locator("h1")).toHaveText("Matt 1:1");
  });
});