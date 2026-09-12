import { describe, expect, it } from 'vitest';
import { decodeShare, deriveCreature, deriveEncounter, deriveEnergy, deriveRecipe, encodeShare, normalizeGesture, presets, repairRecipe } from './core';

describe('ODDLING recipes', () => {
  const recipe = deriveRecipe({ seed: 42, shape: presets.Loop, energy: 120, warmth: 180 });
  it('derives an identical creature from an identical recipe', () => expect(deriveCreature(recipe)).toEqual(deriveCreature(recipe)));
  it('keeps all issued presets valid and round-trippable', () => Object.values(presets).forEach(shape => { expect(shape).toHaveLength(32); const next = deriveRecipe({ seed: 4, shape }); expect(decodeShare(`#s=${encodeShare({ v: 1, kind: 'single', creature: next })}`)).toEqual({ ok: true, payload: { v: 1, kind: 'single', creature: next } }); }));
  it('repairs exactly the historical Arc and rejects arbitrary oversized shapes', () => { const legacy = { ...recipe, shape: [...presets.Arc, 59, 181] }; expect(repairRecipe(legacy)?.shape).toEqual(presets.Arc); expect(repairRecipe({ ...recipe, shape: [...presets.Arc, 2, 3] })).toBeNull(); });
  it('round-trips pair links and rejects malformed payloads', () => { const pair = { v: 1 as const, kind: 'pair' as const, creatures: [recipe, { ...recipe, seed: 43 }] as [typeof recipe, typeof recipe] }; expect(decodeShare(`#s=${encodeShare(pair)}`)).toEqual({ ok: true, payload: pair }); expect(decodeShare('#s=not-a-payload')).toEqual({ ok: false }); });
  it('uses path length rather than event count when sampling a gesture', () => { const shape = normalizeGesture([{ x: 0, y: 0 }, { x: 250, y: 0 }, { x: 251, y: 0 }, { x: 252, y: 0 }]); expect(shape).toHaveLength(32); expect(shape[28]).toBeGreaterThan(220); });
  it('uses neutral rhythm for one tap, clamps a rapid rhythm, and chooses stable encounters', () => { expect(deriveEnergy([4])).toBe(128); expect(deriveEnergy([0, 1])).toBe(255); expect(deriveEncounter(recipe, { ...recipe, seed: 99 })).toBe(deriveEncounter({ ...recipe, seed: 99 }, recipe)); });
});
