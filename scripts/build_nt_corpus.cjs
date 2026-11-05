const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');

const root = path.resolve(__dirname, '..');
const pinPath = path.join(root, 'data/nt-source.json');
const output = path.join(root, 'public/assets/nt');
const books = ['Matt', 'Mark', 'Luke', 'John', 'Acts', 'Rom', '1Cor', '2Cor', 'Gal', 'Eph', 'Phil', 'Col', '1Thess', '2Thess', '1Tim', '2Tim', 'Titus', 'Phlm', 'Heb', 'Jas', '1Pet', '2Pet', '1John', '2John', '3John', 'Jude', 'Rev'];
const names = ['Mt', 'Mk', 'Lk', 'Jn', 'Ac', 'Ro', '1Co', '2Co', 'Ga', 'Eph', 'Php', 'Col', '1Th', '2Th', '1Ti', '2Ti', 'Tit', 'Phm', 'Heb', 'Jas', '1Pe', '2Pe', '1Jn', '2Jn', '3Jn', 'Jud', 'Re'];
const revision = 'aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d';
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const serialize = value => `${JSON.stringify(value)}\n`;
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function parseSource(bytes, book, index, corpusId) {
  const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  const lines = text.split('\n');
  if (lines.at(-1) === '') lines.pop();
  const tokens = [];
  const chapters = new Map();
  let previous = 0;
  let ordinal = 0;
  for (const [lineIndex, line] of lines.entries()) {
    const fields = line.trim().split(/\s+/u);
    const [sourceReference, pos, morph, display, word, normalizedWord, lexicalLemma] = fields;
    assert(fields.length === 7, `${book}:${lineIndex + 1}: expected seven fields`);
    assert(/^\d{6}$/.test(sourceReference) && Number(sourceReference.slice(0, 2)) === index + 1, `${book}: invalid source book/reference`);
    assert(/^(A-|C-|D-|I-|N-|P-|RA|RD|RI|RP|RR|V-|X-)$/.test(pos), `${book}: invalid POS`);
    assert(/^[123-][PIFAXY-][AMP-][IDSONP-][NGDAV-][SP-][MFN-][CS-]$/.test(morph), `${book}: invalid morphology ${morph}`);
    const chapter = Number(sourceReference.slice(2, 4));
    const verse = Number(sourceReference.slice(4, 6));
    const numericReference = chapter * 100 + verse;
    assert(chapter > 0 && verse > 0 && numericReference >= previous, `${book}: nonpositive or unordered reference`);
    ordinal = numericReference === previous ? ordinal + 1 : 1;
    previous = numericReference;
    const reference = `${book}.${chapter}.${verse}`;
    if (!chapters.has(chapter)) chapters.set(chapter, new Set());
    chapters.get(chapter).add(verse);
    tokens.push({ text: display, word, normalizedWord, lexicalLemma, pos, morph, lemma: '', strongs: '', id: `${corpusId}/${reference}/${ordinal}`, language: 'grc', corpusId, reference, sourceReference, book, chapter, verse, ordinal, sourceLine: lineIndex + 1 });
  }
  assert(tokens.length > 0, `${book}: empty source`);
  const coverage = [...chapters].map(([chapter, verses]) => ({
    chapter,
    references: [...verses].map(verse => `${book}.${chapter}.${verse}`),
    missingReferences: Array.from({ length: Math.max(...verses) }, (_, offset) => offset + 1).filter(verse => !verses.has(verse)).map(verse => `${book}.${chapter}.${verse}`),
  }));
  return { artifact: { schemaVersion: 1, corpusId, book, tokens }, coverage, verseCount: coverage.reduce((count, chapter) => count + chapter.references.length, 0) };
}

function build() {
  const args = process.argv.slice(2);
  assert(args.every(arg => ['--check', '--pin'].includes(arg)) && !(args.includes('--check') && args.includes('--pin')), 'Usage: node scripts/build_nt_corpus.cjs [--check | --pin]');
  const checking = args.includes('--check');
  const metadata = JSON.parse(fs.readFileSync(pinPath, 'utf8'));
  assert(metadata.schemaVersion === 1 && metadata.sourceRevision === revision && metadata.sourceUrl === `https://github.com/morphgnt/sblgnt/tree/${revision}` && metadata.annotationSystem === 'MorphGNT', 'Source snapshot version mismatch');
  const sources = books.map((book, index) => {
    const file = `${index + 61}-${names[index]}-morphgnt.txt`;
    const bytes = fs.readFileSync(path.join(root, 'sblgnt', file));
    return { book, file, sha256: sha256(bytes), bytes };
  });
  const pins = sources.map(({ book, file, sha256: hash }) => ({ book, file, sha256: hash }));
  if (args.includes('--pin')) {
    assert(Array.isArray(metadata.sources) && metadata.sources.length === 0, 'Initial pin only: refusing to replace existing source pins');
    metadata.sources = pins;
  }
  assert(JSON.stringify(metadata.sources) === JSON.stringify(pins), 'Source hashes/order differ from pinned snapshot; review source changes explicitly');
  const transformSignature = sha256(fs.readFileSync(__filename));
  const corpusId = `morphgnt-sblgnt-${sha256(serialize({ schemaVersion: 1, transformSignature, metadata })).slice(0, 32)}`;
  const artifacts = new Map();
  const entries = [];
  const coverage = [];
  const observedReferences = new Set();
  let compressedBytes = 0;
  for (const [index, source] of sources.entries()) {
    const parsed = parseSource(source.bytes, source.book, index, corpusId);
    const bytes = serialize(parsed.artifact);
    assert(bytes === serialize(parseSource(source.bytes, source.book, index, corpusId).artifact), `${source.book}: nondeterministic transform`);
    const hash = sha256(bytes);
    const file = `${source.book}.${hash}.json`;
    artifacts.set(file, bytes);
    compressedBytes += zlib.gzipSync(bytes).length;
    entries.push({ book: source.book, file, sha256: hash, sourceSha256: source.sha256, tokenCount: parsed.artifact.tokens.length, verseCount: parsed.verseCount });
    coverage.push({ book: source.book, chapters: parsed.coverage });
    parsed.coverage.forEach(chapter => chapter.references.forEach(reference => observedReferences.add(reference)));
  }
  assert(Array.isArray(metadata.knownAbsentReferences) && metadata.knownAbsentReferences.every(reference => !observedReferences.has(reference)), 'Declared source omission is present in source snapshot');
  const { sources: ignored, ...provenance } = metadata;
  const manifest = { ...provenance, corpusId, transformSignature, books: entries, coverage };
  artifacts.set('manifest.json', serialize(manifest));
  if (checking) {
    const existing = fs.readdirSync(output).sort();
    assert(JSON.stringify(existing) === JSON.stringify([...artifacts.keys()].sort()), 'Generated file inventory mismatch');
    for (const [file, bytes] of artifacts) {
      assert(fs.readFileSync(path.join(output, file)).equals(Buffer.from(bytes)), `${file}: generated bytes/hash mismatch`);
    }
  } else {
    fs.mkdirSync(output, { recursive: true });
    for (const [file, bytes] of artifacts) fs.writeFileSync(path.join(output, file), bytes);
    for (const file of fs.readdirSync(output)) {
      if (!artifacts.has(file) && /^(?:[1-3]?[A-Za-z]+\.[a-f0-9]{64}\.json)$/.test(file)) fs.unlinkSync(path.join(output, file));
    }
    if (args.includes('--pin')) fs.writeFileSync(pinPath, `${JSON.stringify(metadata, null, 2)}\n`);
  }
  const gaps = coverage.flatMap(book => book.chapters.flatMap(chapter => chapter.missingReferences));
  console.log(`${checking ? 'Verified' : 'Generated'} ${entries.length} books, ${entries.reduce((sum, book) => sum + book.tokenCount, 0)} tokens, ${entries.reduce((sum, book) => sum + book.verseCount, 0)} verses; ${gaps.length} numeric coverage gaps; gzip books ${(compressedBytes / 1024 / 1024).toFixed(2)} MiB; ${corpusId}`);
}

try { build(); } catch (error) { console.error(error.message); process.exitCode = 1; }