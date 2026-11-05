import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseGreekMorphology, parseMorphology } from '../utils/morphologyParser';

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.restoreAllMocks());

describe('supported morphology labels', () => {
  it('reads a source-format Greek noun', () => {
    expect(parseMorphology('----NSF-')).toEqual(['Nominative', 'Singular', 'Feminine']);
  });

  it('reads a finite Greek verb', () => {
    expect(parseMorphology('3AAI-S--')).toEqual([
      '3rd Person', 'Aorist', 'Active', 'Indicative', 'Singular',
    ]);
  });

  it('reads a Greek participle', () => {
    expect(parseMorphology('-PAPNSM-')).toEqual([
      'Present', 'Active', 'Participle', 'Nominative', 'Singular', 'Masculine',
    ]);
  });

  it('decodes imperative D from an authentic Romans source row without changing its code', () => {
    const row = readFileSync(resolve('sblgnt/66-Ro-morphgnt.txt'), 'utf8')
      .split('\n').find(line => line.split(/\s+/u)[2]?.[3] === 'D')!;
    const fields = row.split(/\s+/u);
    expect(fields).toEqual(['060304', 'V-', '3PMD-S--', 'γινέσθω', 'γινέσθω', 'γινέσθω', 'γίνομαι']);
    expect(parseMorphology(fields[2])).toEqual([
      '3rd Person', 'Present', 'Middle', 'Imperative', 'Singular',
    ]);
    expect(fields[2]).toBe('3PMD-S--');
    expect(parseGreekMorphology('3PMM-S--')).not.toContain('Imperative');
  });

  it.each([
    ['----NSMC', ['Nominative', 'Singular', 'Masculine', 'Comparative']],
    ['-------S', ['Superlative']],
    ['-PAPNSMC', ['Present', 'Active', 'Participle', 'Nominative', 'Singular', 'Masculine', 'Comparative']],
    ['-PAPNSMS', ['Present', 'Active', 'Participle', 'Nominative', 'Singular', 'Masculine', 'Superlative']],
  ])('decodes degree at index 7 in synthetic positional code %s', (code, labels) => {
    expect(parseGreekMorphology(code)).toEqual(labels);
    expect(parseMorphology(code)).toEqual(labels);
  });

  it.each(['', '   ', '--------'])('returns no labels for %j', (code) => {
    expect(parseMorphology(code)).toEqual([]);
  });

  it('reads a supported Hebrew verb', () => {
    expect(parseMorphology('HVqp3ms')).toEqual([
      'Verb', 'Qal', 'Perfect', '3rd Person', 'Masculine', 'Singular',
    ]);
  });

  it('retains conjunction and verb labels for compound Hebrew', () => {
    expect(parseMorphology('HC/Vqp3ms')).toEqual([
      'Conjunction', 'Verb', 'Qal', 'Perfect', '3rd Person', 'Masculine', 'Singular',
    ]);
  });

  it('routes an Aramaic marker to supported nominal labels', () => {
    expect(parseMorphology('ANcmsa')).toEqual([
      'Noun', 'Common', 'Masculine', 'Singular', 'Absolute',
    ]);
  });
});