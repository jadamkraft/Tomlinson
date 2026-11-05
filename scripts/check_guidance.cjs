const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const YAML = require("yaml");
const picomatch = require("picomatch");

const root = path.resolve(__dirname, "..");
const collect = (directory) => fs.readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? collect(filename) : [filename];
  });
const files = [path.join(root, "README.md"), path.join(root, "CONTRIBUTING.md"),
  ...collect(path.join(root, "docs")), ...collect(path.join(root, ".github"))];
let linkCount = 0;
let customizationCount = 0;

for (const filename of files) {
  const text = fs.readFileSync(filename, "utf8");
  if (filename.endsWith(".yml")) YAML.parse(text, { uniqueKeys: true });
  for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1];
    if (filename.includes(`${path.sep}ISSUE_TEMPLATE${path.sep}`) || filename.endsWith("pull_request_template.md")) {
      assert(/^https:\/\/github\.com\//.test(target), `${filename}: use hosted repository links in issue/PR templates`);
    }
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    const destination = path.resolve(path.dirname(filename), decodeURIComponent(target.split("#")[0]));
    assert(fs.existsSync(destination), `${path.relative(root, filename)}: missing ${target}`);
    linkCount += 1;
  }
  if (!filename.endsWith(".md")) continue;
  const isInstruction = filename.endsWith(".instructions.md");
  const isSkill = path.basename(filename) === "SKILL.md";
  const isAgent = filename.endsWith(".agent.md");
  if (!isInstruction && !isSkill && !isAgent) continue;
  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  assert(frontmatter, `${filename}: missing frontmatter`);
  const metadata = YAML.parse(frontmatter[1], { uniqueKeys: true });
  assert(typeof metadata.description === "string" && metadata.description.length > 20,
    `${filename}: actionable description required`);
  if (isInstruction) {
    assert(typeof metadata.applyTo === "string", `${filename}: applyTo required`);
    const patterns = metadata.applyTo.split(",").map((pattern) => pattern.trim());
    assert(!patterns.includes("**"), `${filename}: avoid global scoped instructions`);
    const matches = picomatch(patterns);
    const samples = filename.endsWith("text-data.instructions.md")
      ? ["services/BibleEngine.ts", "utils/morphologyParser.ts", "public/assets/Gen.xml", "scripts/check_text_data.cjs", "sblgnt/61-Mt-morphgnt.txt"]
      : ["App.tsx", "components/Reader.tsx", "hooks/useBibleNavigation.ts", "vite.config.ts"];
    for (const sample of samples) assert(matches(sample), `${filename}: misses ${sample}`);
    assert(!matches("README.md"), `${filename}: unexpectedly applies to README`);
  }
  if (isSkill) assert.equal(metadata.name, path.basename(path.dirname(filename)));
  if (isAgent) assert.deepEqual(metadata.tools, ["read", "search"]);
  customizationCount += 1;
}

assert(fs.statSync(path.join(root, ".github/copilot-instructions.md")).size < 5000,
  "Keep always-on guidance concise");
assert(!fs.existsSync(path.join(root, ".cursorrules")), "Stale Cursor rules must remain retired");
console.log(`Guidance: ${customizationCount} customizations, ${linkCount} relative links and YAML/glob checks passed.`);
console.log("Client discovery and permission enforcement still require actual VS Code/cloud verification.");