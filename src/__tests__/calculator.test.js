import { calcFootprint, validateInputs, DIET_EMISSIONS } from '../utils/carbonCalculator';

describe('calcFootprint (integration)', () => {
  test('total equals sum of all categories', () => {
    const result = calcFootprint({ carKm: 20, flights: 2, bike: 0, diet: 'omnivore', electricity: 150, gas: 2 });
    expect(result.total).toBe(result.transport + result.food + result.energy);
  });

  test('vegan with no driving has minimal footprint', () => {
    const result = calcFootprint({ carKm: 0, flights: 0, bike: 7, diet: 'vegan', electricity: 0, gas: 0 });
    expect(result.food).toBe(DIET_EMISSIONS.vegan);
    expect(result.energy).toBe(0);
    expect(result.transport).toBe(0);
  });

  test('high driver + meat-heavy produces large footprint', () => {
    const result = calcFootprint({ carKm: 100, flights: 10, bike: 0, diet: 'meatHeavy', electricity: 500, gas: 5 });
    expect(result.total).toBeGreaterThan(12000);
  });

  test('invalid inputs return zero', () => {
    const result = calcFootprint({ carKm: -1, flights: 0, bike: 0, diet: 'omnivore', electricity: 0, gas: 0 });
    expect(result.total).toBe(0);
  });
});

describe('validateInputs (integration)', () => {
  test('valid inputs pass validation', () => {
    const { valid } = validateInputs({ carKm: 20, flights: 2, bike: 0, diet: 'omnivore', electricity: 150, gas: 2 });
    expect(valid).toBe(true);
  });
  test('invalid diet fails validation', () => {
    const { valid, errors } = validateInputs({ carKm: 20, flights: 2, bike: 0, diet: 'unknown', electricity: 150, gas: 2 });
    expect(valid).toBe(false);
    expect(errors.length).toBeGreaterThan(0);
  });
});
