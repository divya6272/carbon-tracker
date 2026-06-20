import {
  calcFootprint,
  validateInputs,
  getRating,
  getPersonalizedTips,
  DIET_EMISSIONS,
  EMISSION_FACTORS,
  BENCHMARKS,
} from '../utils/carbonCalculator';

// ─── Constants ───────────────────────────────────────────────────────────────

describe('DIET_EMISSIONS constants', () => {
  test('vegan has lowest emissions', () => {
    expect(DIET_EMISSIONS.vegan).toBeLessThan(DIET_EMISSIONS.vegetarian);
  });
  test('meatHeavy has highest emissions', () => {
    expect(DIET_EMISSIONS.meatHeavy).toBeGreaterThan(DIET_EMISSIONS.omnivore);
  });
  test('all 5 diet types are defined', () => {
    expect(Object.keys(DIET_EMISSIONS)).toHaveLength(5);
  });
});

describe('EMISSION_FACTORS constants', () => {
  test('India electricity factor is within expected range', () => {
    expect(EMISSION_FACTORS.electricityPerKwh).toBeGreaterThan(0.7);
    expect(EMISSION_FACTORS.electricityPerKwh).toBeLessThan(1.0);
  });
  test('All factors are positive numbers', () => {
    Object.values(EMISSION_FACTORS).forEach(v => {
      expect(v).toBeGreaterThan(0);
    });
  });
});

describe('BENCHMARKS', () => {
  test('India average is less than global average', () => {
    expect(BENCHMARKS.india).toBeLessThan(BENCHMARKS.global);
  });
});

// ─── validateInputs ───────────────────────────────────────────────────────────

describe('validateInputs', () => {
  const validInputs = { carKm: 20, flights: 2, bike: 0, diet: 'omnivore', electricity: 150, gas: 2 };

  test('returns valid for correct inputs', () => {
    const { valid, errors } = validateInputs(validInputs);
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
  });
  test('fails for negative carKm', () => {
    const { valid } = validateInputs({ ...validInputs, carKm: -1 });
    expect(valid).toBe(false);
  });
  test('fails for invalid diet', () => {
    const { valid } = validateInputs({ ...validInputs, diet: 'carnivore' });
    expect(valid).toBe(false);
  });
  test('fails for bike days > 7', () => {
    const { valid } = validateInputs({ ...validInputs, bike: 8 });
    expect(valid).toBe(false);
  });
  test('fails for electricity > 2000', () => {
    const { valid } = validateInputs({ ...validInputs, electricity: 2001 });
    expect(valid).toBe(false);
  });
});

// ─── calcFootprint ────────────────────────────────────────────────────────────

describe('calcFootprint', () => {
  const base = { carKm: 20, flights: 2, bike: 0, diet: 'omnivore', electricity: 150, gas: 2 };

  test('total equals sum of transport + food + energy', () => {
    const { transport, food, energy, total } = calcFootprint(base);
    expect(total).toBe(transport + food + energy);
  });
  test('electricity emission factor is correctly applied', () => {
    const { energy } = calcFootprint({ ...base, electricity: 100, gas: 0 });
    expect(energy).toBe(Math.round(100 * 12 * EMISSION_FACTORS.electricityPerKwh));
  });
  test('vegan diet produces lowest food emissions', () => {
    const vegan = calcFootprint({ ...base, diet: 'vegan' });
    const meatHeavy = calcFootprint({ ...base, diet: 'meatHeavy' });
    expect(vegan.food).toBeLessThan(meatHeavy.food);
  });
  test('transport is never negative', () => {
    const { transport } = calcFootprint({ ...base, carKm: 0, flights: 0, bike: 7 });
    expect(transport).toBeGreaterThanOrEqual(0);
  });
  test('returns zeros for invalid inputs', () => {
    const { total } = calcFootprint({ ...base, diet: 'invalid' });
    expect(total).toBe(0);
  });
  test('zero inputs give minimal footprint', () => {
    const { transport, energy } = calcFootprint({ ...base, carKm: 0, flights: 0, electricity: 0, gas: 0 });
    expect(transport).toBe(0);
    expect(energy).toBe(0);
  });
});

// ─── getRating ────────────────────────────────────────────────────────────────

describe('getRating', () => {
  test('returns Excellent for very low footprint', () => {
    expect(getRating(1000).label).toContain('Excellent');
  });
  test('returns Good for below-average footprint', () => {
    expect(getRating(2000).label).toContain('Good');
  });
  test('returns Average for mid-range footprint', () => {
    expect(getRating(3000).label).toContain('Average');
  });
  test('returns High Impact for high footprint', () => {
    expect(getRating(6000).label).toContain('High Impact');
  });
  test('all ratings return a color', () => {
    [500, 2000, 3500, 6000].forEach(total => {
      expect(getRating(total).color).toMatch(/^#/);
    });
  });
});

// ─── getPersonalizedTips ──────────────────────────────────────────────────────

describe('getPersonalizedTips', () => {
  const base = { carKm: 20, flights: 2, bike: 0, diet: 'omnivore', transport: 2000, food: 2800, energy: 1500, total: 6300 };

  test('always returns exactly 3 tips', () => {
    expect(getPersonalizedTips(base)).toHaveLength(3);
    expect(getPersonalizedTips({ ...base, diet: 'vegan' })).toHaveLength(3);
    expect(getPersonalizedTips({ ...base, carKm: 50 })).toHaveLength(3);
  });
  test('each tip has title, desc, and saving', () => {
    getPersonalizedTips(base).forEach(tip => {
      expect(tip).toHaveProperty('title');
      expect(tip).toHaveProperty('desc');
      expect(tip).toHaveProperty('saving');
      expect(typeof tip.title).toBe('string');
      expect(typeof tip.desc).toBe('string');
      expect(typeof tip.saving).toBe('string');
    });
  });
  test('high driver gets transport reduction tip', () => {
    const tips = getPersonalizedTips({ ...base, carKm: 50 });
    expect(tips[0].title).toMatch(/transport|metro|bus/i);
  });
  test('vegan diet gets positive encouragement', () => {
    const tips = getPersonalizedTips({ ...base, diet: 'vegan' });
    expect(tips[1].title).toMatch(/outstanding|optimal/i);
  });
  test('high electricity gets LED tip', () => {
    const tips = getPersonalizedTips({ ...base, electricity: 300, energy: 3000 });
    expect(tips[2].title).toMatch(/LED|appliance/i);
  });
});
