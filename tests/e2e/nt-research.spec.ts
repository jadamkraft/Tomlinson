import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test, type Locator } from "@playwright/test";

const sourceDirectory = resolve("sblgnt");
const sourceBooks = ["Matt", "Mark", "Luke", "John", "Acts", "Rom", "1Cor", "2Cor", "Gal", "Eph", "Phil", "Col", "1Thess", "2Thess", "1Tim", "2Tim", "Titus", "Phlm", "Heb", "Jas", "1Pet", "2Pet", "1John", "2John", "3John", "Jude", "Rev"];
const paul7 = ["Rom", "1Cor", "2Cor", "Gal", "Phil", "1Thess", "Phlm"];
const paul13 = [...paul7, "Eph", "Col", "2Thess", "1Tim", "2Tim", "Titus"];
const sourceFiles = readdirSync(sourceDirectory).filter(file => file.endsWith("-morphgnt.txt")).sort();
const source = sourceFiles.map((file, index) => ({
  book: sourceBooks[index],
  rows: readFileSync(resolve(sourceDirectory, file), "utf8").trim().split(/\r?\n/).map(line => {
    const [reference, , , , word, , lemma] = line.split(/\s+/);
    return { reference, word: word.normalize("NFC"), lemma: lemma.normalize("NFC") };
  }),
}));

function expectedScope(books: string[], mode: "lemma" | "form", companion = false) {
  const selected = source.filter(book => books.includes(book.book));
  const total = selected.reduce((count, book) => count + book.rows.filter((row, index) => {
    if (row[mode === "lemma" ? "lemma" : "word"] !== (mode === "lemma" ? "σάρξ" : "σαρκὶ")) return false;
    const preceding = book.rows[index - 1];
    return !companion || (preceding?.lemma === "ἐν" && preceding.reference.slice(0, 4) === row.reference.slice(0, 4));
  }).length, 0);
  return { total, tokens: selected.reduce((count, book) => count + book.rows.length, 0) };
}

async function complete(panel: Locator, books: string[], mode: "lemma" | "form", companion = false) {
  const expected = expectedScope(books, mode, companion);
  await expect(panel.getByText(`${expected.total} occurrences · ${expected.tokens} scope tokens`, { exact: true })).toBeVisible();
  await expect(panel.locator('[aria-busy="true"]')).toHaveCount(0);
  await expect(panel.getByRole("button", { name: /^Open H\d/ })).toHaveCount(0);
}

test.describe("source-backed NT research", () => {
  test.use({ serviceWorkers: "block" });

  test("passage retry, out-of-order loads, drawer failure, and exact origin Back", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText("Rom 8:9");
    const reference = page.getByPlaceholder("Enter Bible reference", { exact: false });
    await page.route(/\/assets\/nt\/John\.[a-f0-9]+\.json$/, route => route.fulfill({ contentType: "text/html", body: "<html>Test load failure</html>" }));
    await reference.fill("John 1:1");
    await reference.press("Enter");
    await expect(page.getByRole("alert")).toContainText("non-JSON");
    await page.unroute(/\/assets\/nt\/John\.[a-f0-9]+\.json$/);
    await page.getByRole("button", { name: "Retry passage" }).click();
    await expect(page.locator("h1")).toHaveText("John 1:1");
    await expect(page).toHaveURL(/ref=John.1.1/);
    await page.reload();
    await expect(page.locator("h1")).toHaveText("John 1:1");
    let release!: () => void;
    const held = new Promise<void>(resolve => { release = resolve; });
    await page.route(/\/assets\/nt\/Matt\.[a-f0-9]+\.json$/, async route => { await held; await route.continue(); });
    const requested = page.waitForRequest(/\/assets\/nt\/Matt\.[a-f0-9]+\.json$/);
    await reference.fill("Matt 1:1");
    await reference.press("Enter");
    await requested;
    await reference.fill("Rom 8:9");
    await reference.press("Enter");
    await expect(page.locator("h1")).toHaveText("Rom 8:9");
    const resumed = page.waitForResponse(/\/assets\/nt\/Matt\.[a-f0-9]+\.json$/);
    release();
    await (await resumed).finished();
    await page.unroute(/\/assets\/nt\/Matt\.[a-f0-9]+\.json$/);
    const originWord = page.locator('[data-reference="Rom.8.10"]').getByRole("button", { name: "Select Χριστὸς", exact: true });
    await originWord.click();
    await page.getByRole("button", { name: "Research word", exact: true }).click();
    await expect(page.getByRole("region", { name: "Word research" })).toBeVisible();
    await page.goBack();
    await expect(page.locator("h1")).toHaveText("Rom 8:10");
    await expect(originWord).toHaveAttribute("aria-pressed", "true");
    await expect(originWord).toBeFocused();
    await page.route(/\/assets\/nt\/Mark\.[a-f0-9]+\.json$/, route => route.abort());
    await page.getByRole("button", { name: "Open book navigation" }).click();
    const drawer = page.getByRole("dialog", { name: "Book Navigation" });
    await drawer.getByRole("button", { name: "Mark", exact: true }).click();
    await drawer.getByRole("button", { name: "1", exact: true }).click();
    await expect(drawer.getByRole("alert")).toBeVisible();
    await expect(drawer.getByRole("button", { name: "1", exact: true })).toHaveCount(0);
    await page.unroute(/\/assets\/nt\/Mark\.[a-f0-9]+\.json$/);
    await drawer.getByRole("button", { name: "Retry book" }).click();
    await expect(drawer.getByRole("button", { name: "1", exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("frequent lemma queries remain bounded after complete NT loading", async ({ page, browserName }, testInfo) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText("Rom 8:9");
    const workerFile = readdirSync(resolve("dist/assets")).find(file => /^ntResearch\.worker-.*\.js$/.test(file))!;
    const session = browserName === "chromium" ? await page.context().newCDPSession(page) : null;
    if (session) await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    try {
      const metrics = await page.evaluate(async ({ file, books }) => {
        const worker = new Worker(`/assets/${file}`, { type: "module" });
        let nextId = 0;
        const run = (term: string) => new Promise<any>((resolve, reject) => {
          const id = ++nextId;
          worker.onmessage = event => event.data.error ? reject(new Error(event.data.error)) : resolve(event.data.result);
          worker.onerror = event => reject(new Error(event.message));
          worker.postMessage({ id, type: "search", query: { mode: "lemma", term, books, direction: "either", distance: 5, boundary: "chapter", page: 0 } });
        });
        try {
          const coldStart = performance.now();
          const initial = await run("ἐν");
          const coldMs = performance.now() - coldStart;
          const timings: number[] = [];
          for (let index = 0; index < 30; index++) {
            const start = performance.now();
            const result = await run(index % 2 ? "σάρξ" : "ἐν");
            if (result.hits.length > 25) throw new Error("Unbounded worker page");
            timings.push(performance.now() - start);
          }
          timings.sort((left, right) => left - right);
          return { coldMs, warmP95Ms: timings[Math.ceil(timings.length * 0.95) - 1], samples: timings.length, scopeTokens: initial.scopeTokens, hitsPerPage: initial.hits.length };
        } finally { worker.terminate(); }
      }, { file: workerFile, books: sourceBooks });
      expect(metrics.scopeTokens).toBe(137554);
      expect(metrics.warmP95Ms).toBeLessThanOrEqual(500);
      await testInfo.attach("research-performance", { body: JSON.stringify({ ...metrics, cpuThrottle: session ? "4x" : "unthrottled WebKit", viewport: page.viewportSize() }), contentType: "application/json" });
      console.log(`${testInfo.project.name}: ${JSON.stringify(metrics)}`);
    } finally { if (session) { await session.send("Emulation.setCPUThrottlingRate", { rate: 1 }); await session.detach(); } }
  });

  test("Romans chapter, exact Greek research, scope completion and history", async ({ page }, testInfo) => {
    const pageErrors: string[] = [];
    const failedExternal: string[] = [];
    page.on("pageerror", error => pageErrors.push(error.message));
    page.on("requestfailed", request => {
      if (/tailwind|fonts\.google/.test(request.url())) failedExternal.push(request.url());
    });
    await page.route("https://formspree.io/**", route => route.abort());
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText("Rom 8:9");
    await expect(page.locator("main [data-reference]")).toHaveCount(39);
    const origin = page.locator('[data-reference="Rom.8.9"]');
    const selected = origin.getByRole("button", { name: "Select σαρκὶ", exact: true });
    await selected.click();
    const tokenId = await selected.getAttribute("data-token-id");
    expect(tokenId).toBeTruthy();
    await expect(selected).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("Lemma: σάρξ", { exact: true })).toBeVisible();
    await expect(page.getByText("Normalized: σαρκί", { exact: true })).toBeVisible();
    await expect(page.getByText("Dative", { exact: true })).toBeVisible();
    await expect(page.getByText("Singular", { exact: true })).toBeVisible();
    await expect(page.getByText("Feminine", { exact: true })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("greek-initial-chapter.png"), fullPage: true });
    await page.getByRole("button", { name: "Research word", exact: true }).click();
    const panel = page.getByRole("region", { name: "Word research", exact: true });
    await expect(panel.getByRole("heading", { level: 2 })).toHaveText("Word research");
    await expect(panel.getByRole("combobox", { name: /^Scope/ })).toHaveValue("current");
    await expect(panel.getByRole("group", { name: "Search mode" })).toContainText("σάρξ");
    await complete(panel, ["Rom"], "lemma");
    await page.screenshot({ path: testInfo.outputPath("research-lemma.png"), fullPage: true });
    const resultsContainer = panel.locator("..");
    await resultsContainer.evaluate(element => { element.scrollTop = 500; });
    await expect.poll(() => resultsContainer.evaluate(element => element.scrollTop)).toBeGreaterThan(400);
    await panel.getByRole("button", { name: "Back", exact: true }).click();
    await page.getByRole("button", { name: "Back to results", exact: true }).click();
    await expect.poll(() => resultsContainer.evaluate(element => element.scrollTop)).toBeGreaterThan(400);

    await panel.getByRole("button", { name: "Next results", exact: true }).click();
    await expect(panel.getByText(/^Page 2 of /)).toBeVisible();
    const secondPageHit = panel.getByRole("button", { name: /^Open / }).first();
    const secondPageReference = (await secondPageHit.getAttribute("aria-label"))!.replace("Open ", "");
    await secondPageHit.click();
    await expect(page.locator("h1")).toHaveText(secondPageReference);
    await page.goBack();
    await expect(panel.getByText(/^Page 2 of /)).toBeVisible();
    await expect(panel.getByRole("combobox", { name: /^Scope/ })).toHaveValue("current");
    await expect(panel.getByRole("group", { name: "Search mode" })).toContainText("σάρξ");
    await complete(panel, ["Rom"], "lemma");
    await panel.getByRole("button", { name: "Previous results", exact: true }).click();

    await panel.getByRole("combobox", { name: /^Companion lemma/ }).selectOption("ἐν");
    await panel.getByLabel("Distance (tokens)", { exact: true }).fill("1");
    await panel.getByRole("combobox", { name: /^Direction/ }).selectOption("before");
    await complete(panel, ["Rom"], "lemma", true);
    const openHit = panel.getByRole("button", { name: "Open Rom 8:9", exact: true }).first();
    await openHit.click();
    await expect(page.locator("h1")).toHaveText("Rom 8:9");
    await expect(page.locator("main [data-reference]")).toHaveCount(39);
    await expect(selected).toHaveAttribute("data-token-id", tokenId!);
    await expect(selected).toHaveAttribute("aria-pressed", "true");
    await expect(selected).toBeFocused();
    await page.getByRole("button", { name: "Back to results", exact: true }).click();

    async function preserved() {
      await expect(panel.getByRole("button", { name: "Lemma", exact: true })).toHaveAttribute("aria-pressed", "true");
      await expect(panel.getByRole("group", { name: "Search mode" })).toContainText("σάρξ");
      await expect(panel.getByRole("combobox", { name: /^Scope/ })).toHaveValue("current");
      await expect(panel.getByRole("combobox", { name: /^Companion lemma/ })).toHaveValue("ἐν");
      await expect(panel.getByLabel("Distance (tokens)", { exact: true })).toHaveValue("1");
      await expect(panel.getByRole("combobox", { name: /^Direction/ })).toHaveValue("before");
      await expect(panel.getByText(/^Page 1 of /)).toBeVisible();
      await complete(panel, ["Rom"], "lemma", true);
    }
    await preserved();
    await openHit.click();
    await expect(selected).toHaveAttribute("aria-pressed", "true");
    await page.goBack();
    await preserved();
    await panel.getByRole("button", { name: "Back", exact: true }).click();
    await expect(page.locator("h1")).toHaveText("Rom 8:9");
    await expect(selected).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Back to results", exact: true }).click();

    await panel.getByRole("button", { name: "Form", exact: true }).click();
    await expect(panel.getByRole("group", { name: "Search mode" })).toContainText("σαρκὶ");
    await complete(panel, ["Rom"], "form", true);
    const targets = panel.locator("li mark.bg-sky-900");
    expect(await targets.count()).toBeGreaterThan(0);
    for (const text of await targets.allTextContents()) expect(text.replace(/[.,;··]/g, "").normalize("NFC")).toBe("σαρκὶ");
    expect(expectedScope(["Rom"], "form").total).toBeLessThan(expectedScope(["Rom"], "lemma").total);

    await panel.getByRole("button", { name: "Lemma", exact: true }).click();
    await panel.getByRole("combobox", { name: /^Scope/ }).selectOption("paul7");
    await complete(panel, paul7, "lemma", true);
    await panel.getByRole("combobox", { name: /^Scope/ }).selectOption("all");
    await complete(panel, sourceBooks, "lemma", true);
    await panel.getByRole("combobox", { name: /^Scope/ }).selectOption("other");
    await complete(panel, sourceBooks.filter(book => !paul13.includes(book)), "lemma", true);
    await panel.getByRole("button", { name: "Back", exact: true }).click();
    await page.locator('[data-reference="Rom.8.9"]').getByRole("button", { name: "Select πνεύματι,", exact: true }).click();
    await page.getByRole("button", { name: "Research word", exact: true }).click();
    await expect(panel.getByRole("group", { name: "Search mode" })).toContainText("πνεῦμα");
    await page.goBack();
    await expect(page.locator("h1")).toHaveText("Rom 8:9");
    await page.goBack();
    await expect(panel.getByRole("group", { name: "Search mode" })).toContainText("σάρξ");
    await expect(panel.getByRole("combobox", { name: /^Scope/ })).toHaveValue("other");
    await complete(panel, sourceBooks.filter(book => !paul13.includes(book)), "lemma", true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(pageErrors).toEqual([]);
    if (failedExternal.length) await testInfo.attach("external-resource-failures", { body: failedExternal.join("\n"), contentType: "text/plain" });
  });
});