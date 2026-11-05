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
    await expect(page.getByText(/^No exact Greek lexicon entry found for /)).toBeVisible();
    await reference.fill("John 1:1");
    await reference.press("Enter");
    await expect(page.getByRole("alert")).toContainText(/HTML|JSON|content.type/i);
    await expect(page.getByRole("button", { name: "Retry passage" })).toBeVisible();
    await expect(page.locator("h1")).toHaveText("Matt 1:1");
  });

  test("canonical Greek lemmas resolve to attributed lexicon entries", async ({ page }) => {
    await page.goto("/#ref=Rom.8.9");
    const verse = page.locator('[data-reference="Rom.8.9"]');
    const lexicon = page.locator("main > section section").first();

    await verse.getByRole("button", { name: "Select σαρκὶ", exact: true }).click();
    await expect(page.getByText("Lemma: σάρξ", { exact: true })).toBeVisible();
    await expect(lexicon).toContainText("σάρξ");
    await expect(lexicon).toContainText("flesh (as stripped of the skin)");

    await verse.getByRole("button", { name: "Select πνεύματι,", exact: true }).click();
    await expect(page.getByText("Lemma: πνεῦμα", { exact: true })).toBeVisible();
    await expect(lexicon).toContainText("πνεῦμα");
    await expect(lexicon).toContainText("a current of air");

    await verse.getByRole("button", { name: "Select Χριστοῦ", exact: true }).click();
    await expect(page.getByText("Lemma: Χριστός", { exact: true })).toBeVisible();
    await expect(lexicon).toContainText("Χριστός");
    await expect(lexicon).toContainText("the Messiah");
    await expect(lexicon).toContainText("James Strong (1890)");
    await expect(lexicon).toContainText("Historical gloss, not a contextual interpretation.");
    await expect(lexicon).toContainText("proofreading is incomplete");
    await expect(page.getByText("#N/A", { exact: true })).toBeVisible();
  });

  test("Greek lexicon failures are distinct and retryable", async ({ page }) => {
    let attempts = 0;
    await page.route("**/assets/strongs_greek.xml", async (route) => {
      attempts += 1;
      if (attempts === 1) {
        await route.fulfill({ status: 503, body: "Unavailable" });
      } else {
        await route.continue();
      }
    });

    await page.goto("/#ref=Rom.8.9");
    await page.locator('[data-reference="Rom.8.9"]')
      .getByRole("button", { name: "Select σαρκὶ", exact: true })
      .click();
    const lexicon = page.locator("main > section section").first();
    await expect(lexicon.getByRole("alert")).toContainText("Unable to load the Greek lexicon.");
    await lexicon.getByRole("button", { name: "Retry lexicon" }).click();
    await expect(lexicon).toContainText("flesh (as stripped of the skin)");
    expect(attempts).toBe(2);
  });
});