import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DictionaryService } from '../services/DictionaryService';

const syntheticGreekDictionary = `<strongsdictionary><entries>
  <entry strongs="00012"><greek unicode="TEST-G" translit="test-g"/>
    <strongs_def>Greek <latin>test definition</latin></strongs_def></entry>
  <entry strongs="04561"><greek unicode="σάρξ" translit="sárx"/>
    <strongs_def>Flesh definition</strongs_def></entry>
  <entry strongs="04151"><greek unicode="πνεῦμα" translit="pneûma"/>
    <strongs_def>Spirit definition</strongs_def></entry>
  <entry strongs="05547"><greek unicode="Χριστός" translit="Christós"/>
    <strongs_def>Anointed definition</strongs_def></entry>
  <entry strongs="09001"><greek unicode="DUP" translit="dup"/>
    <strongs_def>First duplicate</strongs_def></entry>
  <entry strongs="09002"><greek unicode="DUP" translit="dup"/>
    <strongs_def>Second duplicate</strongs_def></entry>
</entries></strongsdictionary>`;
const syntheticHebrewDictionary = `<osis xmlns="http://www.bibletechnologies.net/2003/OSIS/namespace">
  <osisText><div type="glossary"><div type="entry" n="00012">
    <w ID="H12" xml:lang="heb">TEST-H</w>
    <note type="explanation">Hebrew <hi>test definition</hi></note>
  </div></div></osisText></osis>`;

let dictionary: DictionaryService;
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  dictionary = new DictionaryService();
  fetchMock = vi.fn(async (path: string) => {
    const fixtures: Record<string, string> = {
      '/assets/strongs_greek.xml': syntheticGreekDictionary,
      '/assets/strongs_hebrew.xml': syntheticHebrewDictionary,
    };
    if (!(path in fixtures)) throw new Error(`Unexpected dictionary request: ${path}`);
    return { ok: true, text: async () => fixtures[path] };
  });
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('dictionary lookup with synthetic vocabulary in bundled entry formats', () => {
  it('reads Greek strongs_def and Hebrew explanation text, including nested markup', async () => {
    await dictionary.initialize();
    expect(dictionary.getDefinition('G12')?.def).toBe('Greek test definition');
    expect(dictionary.getDefinition('H12')).toEqual({ word: 'TEST-H', def: 'Hebrew test definition' });
  });

  it.each(['12', '00012', 'G12', 'G00012', 'strong:G00012'])('normalizes Greek numeric/prefixed ID %s', async (id) => {
    await dictionary.initialize();
    expect(dictionary.getDefinition(id)?.def).toBe('Greek test definition');
  });

  it.each(['H12', 'H00012', 'strong:H00012'])('normalizes Hebrew prefix/zeroes %s without selecting Greek', async (id) => {
    await dictionary.initialize();
    expect(dictionary.getDefinition(id)).toEqual({ word: 'TEST-H', def: 'Hebrew test definition' });
  });

  it.each(['', 'no-link', 'G99999', 'H99999'])('returns null for absent/unresolved linkage %j', async (id) => {
    await dictionary.initialize();
    expect(dictionary.getDefinition(id)).toBeNull();
  });

  it('loads each dictionary once across repeated initialization and lookups', async () => {
    await dictionary.initialize();
    await dictionary.initialize();
    dictionary.getDefinition('G12');
    dictionary.getDefinition('H12');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith('/assets/strongs_greek.xml');
    expect(fetchMock).toHaveBeenCalledWith('/assets/strongs_hebrew.xml');
  });

  it('looks up Greek entries by exact NFC lemma without loading Hebrew', async () => {
    await dictionary.initializeGreek();

    expect(dictionary.getGreekDefinitionByLemma('σάρξ')).toEqual({
      status: 'found',
      entry: { word: 'σάρξ', def: 'Flesh definition' },
    });
    expect(dictionary.getGreekDefinitionByLemma('πνεῦμα')).toMatchObject({
      status: 'found',
      entry: { word: 'πνεῦμα', def: 'Spirit definition' },
    });
    expect(dictionary.getGreekDefinitionByLemma('Χριστός')).toMatchObject({
      status: 'found',
      entry: { word: 'Χριστός', def: 'Anointed definition' },
    });
    expect(dictionary.getGreekDefinitionByLemma('Σάρξ')).toEqual({ status: 'missing' });
    expect(dictionary.getGreekDefinitionByLemma('ἄγνωστος')).toEqual({ status: 'missing' });
    expect(dictionary.getGreekDefinitionByLemma('DUP')).toEqual({ status: 'ambiguous' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/assets/strongs_greek.xml');
  });

  it('reports Greek lexicon request failures and allows retry', async () => {
    fetchMock.mockImplementationOnce(async () => ({
      ok: false,
      status: 503,
      text: async () => '',
    }));

    await expect(dictionary.initializeGreek()).rejects.toThrow(
      'Greek lexicon request failed with HTTP 503.'
    );
    await dictionary.initializeGreek();
    expect(dictionary.getGreekDefinitionByLemma('σάρξ').status).toBe('found');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});