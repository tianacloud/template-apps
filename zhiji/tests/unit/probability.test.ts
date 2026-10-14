import { expect, it } from 'vitest';
import references from '../fixtures/probability-reference.json';
import { cycleMass } from '../../src/domain/probability';
import { ovulationMass } from '../../src/domain/fertility';
it('matches independently generated 80-digit references across tails, short cycles, and late confirmations',() => {
  for (const row of references) {
    const actual = 'k' in row && row.k !== undefined ? cycleMass(row.k,row.model) : ovulationMass(row.o!,row.model);
    const expected = 'mass' in row && row.mass !== undefined ? row.mass : row.ovulationMass!;
    if (expected === 0) expect(actual).toBe(0);
    else expect(Math.abs(actual-expected)/expected,JSON.stringify(row)).toBeLessThan(1e-7);
  }
});
