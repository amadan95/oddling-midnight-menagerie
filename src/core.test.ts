import { describe, expect, it } from 'vitest';
import { decodeShare, deriveCreature, deriveRecipe, encodeShare, presets } from './core';

describe('ODDLING recipes', () => {
  const recipe = deriveRecipe({ seed: 42, shape: presets.Loop, energy: 120, warmth: 180 });
  it('derives an identical creature from an identical recipe', () => {
    expect(deriveCreature(recipe)).toEqual(deriveCreature(recipe));
  });
  it('round-trips a single share payload', () => {
    const value = encodeShare({ v: 1, kind: 'single', creature: recipe });
    expect(decodeShare(`#s=${value}`)).toEqual({ ok: true, payload: { v: 1, kind: 'single', creature: recipe } });
  });
  it('rejects malformed recipes', () => expect(decodeShare('#s=not-a-payload')).toEqual({ ok: false }));
});
