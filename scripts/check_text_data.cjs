const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const { XMLParser, XMLValidator } = require("fast-xml-parser");

const root = path.resolve(__dirname, "..");
const source = ts.createSourceFile("constants.ts", fs.readFileSync(path.join(root, "constants.ts"), "utf8"), ts.ScriptTarget.Latest, true);
const readLiteralMap = (name) => {
  let result;
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === name) {
      assert(node.initializer && ts.isObjectLiteralExpression(node.initializer), `${name}: literal map expected`);
      result = Object.fromEntries(node.initializer.properties.map((property) => {
        assert(ts.isPropertyAssignment(property) && ts.isStringLiteral(property.initializer), `${name}: string values expected`);
        const key = ts.isIdentifier(property.name) ? property.name.text : property.name.text;
        assert(typeof key === "string", `${name}: literal keys expected`);
        return [key, property.initializer.text];
      }));
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  assert(result, `Missing ${name}`);
  return result;
};
const bookNames = readLiteralMap("BIBLE_BOOKS");
const filenames = readLiteralMap("BOOK_FILENAME_MAPPING");
assert.equal(filenames.Phlm, "Phlm.xml");
assert.equal(filenames.Philem, "Phlm.xml");
const mappedFiles = new Set(Object.values(filenames));
for (const filename of mappedFiles) {
  assert.equal(path.basename(filename), filename, "Book filenames must stay within assets");
  const contents = fs.readFileSync(path.join(root, "public/assets", filename), "utf8");
  assert.equal(XMLValidator.validate(contents), true, `${filename}: invalid XML`);
}
const parser = new XMLParser({ ignoreAttributes: false, trimValues: false });
const findReference = (value, reference) => {
  if (!value || typeof value !== "object") return null;
  if (value["@_osisID"] === reference) return value;
  for (const child of Object.values(value)) {
    const found = findReference(child, reference);
    if (found) return found;
  }
  return null;
};
for (const bookId of Object.keys(bookNames)) {
  assert(filenames[bookId], `${bookId}: missing filename mapping`);
  const doc = parser.parse(fs.readFileSync(path.join(root, "public/assets", filenames[bookId]), "utf8"));
  assert(findReference(doc, bookId) || doc.book?.["@_id"] === bookId,
    `${bookId}: missing canonical book node`);
}
for (const [fixture, bookId, reference] of [
  ["gen-1-1.xml", "Gen", "Gen.1.1"], ["matt-1-1.xml", "Matt", "Matt.1.1"],
]) {
  const full = parser.parse(fs.readFileSync(path.join(root, "public/assets", filenames[bookId]), "utf8"));
  const excerpt = parser.parse(fs.readFileSync(path.join(root, "tests/fixtures", fixture), "utf8"));
  const sourceVerse = findReference(full, reference);
  const fixtureVerse = findReference(excerpt, reference);
  assert(sourceVerse && fixtureVerse, `${fixture}: missing verse`);
  assert.deepEqual(fixtureVerse.w, sourceVerse.w, `${fixture}: differs from bundled source tokens`);
}
const sourceRows = fs.readFileSync(path.join(root, "sblgnt/61-Mt-morphgnt.txt"), "utf8")
  .split(/\r?\n/).filter((line) => line.startsWith("010101 "));
assert.equal(sourceRows.length, 8, "Matt 1:1 source token count changed; review fixture evidence");
for (const row of sourceRows) {
  const fields = row.trim().split(/\s+/);
  assert.equal(fields.length, 7, "MorphGNT field count");
  assert.equal(fields[2].length, 8, "MorphGNT parsing positions");
}
console.log(`Data: ${mappedFiles.size} mapped XML files, ${Object.keys(bookNames).length} canonical books, two authentic fixtures and MorphGNT sample passed.`);
console.log("Legacy XML structural checks only; check:nt verifies canonical NT source fidelity. Partial Hebrew decoding and unmapped masters remain outside this check.");