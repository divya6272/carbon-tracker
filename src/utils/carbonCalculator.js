/**
 * Carbon Footprint Calculator Utility
 * Uses real-world emission factors specific to India and global averages.
 * Sources: IPCC AR6, India Ministry of Power (2024), EPA
 */

/** @type {Object.<string, number>} kg CO2 per year by diet type */
export const DIET_EMISSIONS = {
  vegan: 1500,
  vegetarian: 1700,
  flexitarian: 2200,
  omnivore: 2800,
  meatHeavy: 3300,
};

/** Emission factors used in calculations */
export const EMISSION_FACTORS = {
  carKmPerKm: 0.21,       // kg CO2/km (avg petrol car, India)
  flightPerFlight: 255,   // kg CO2/short-haul flight (~2hr)
  bikePerDay: 0.003,      // kg CO2/day (cycling — minimal but real)
  electricityPerKwh: 0.82, // kg CO2/kWh (India grid emission factor 2024)
  lpgPerCylinder: 2.04,   // kg CO2/14.2kg LPG cylinder
};

/** Benchmark values for comparison */
export const BENCHMARKS = {
  india: 1900,   // kg CO2/person/year (India avg)
  global: 4700,  // kg CO2/person/year (global avg)
};

/**
 * Validates calculator inputs before processing
 * @param {Object} inputs - User lifestyle inputs
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validateInputs = (inputs) => {
  const errors = [];
  if (typeof inputs.carKm !== 'number' || inputs.carKm < 0 || inputs.carKm > 500)
    errors.push('carKm must be a number between 0 and 500');
  if (typeof inputs.flights !== 'number' || inputs.flights < 0 || inputs.flights > 100)
    errors.push('flights must be a number between 0 and 100');
  if (typeof inputs.bike !== 'number' || inputs.bike < 0 || inputs.bike > 7)
    errors.push('bike days must be a number between 0 and 7');
  if (!Object.keys(DIET_EMISSIONS).includes(inputs.diet))
    errors.push(`diet must be one of: ${Object.keys(DIET_EMISSIONS).join(', ')}`);
  if (typeof inputs.electricity !== 'number' || inputs.electricity < 0 || inputs.electricity > 2000)
    errors.push('electricity must be a number between 0 and 2000');
  if (typeof inputs.gas !== 'number' || inputs.gas < 0 || inputs.gas > 20)
    errors.push('gas must be a number between 0 and 20');
  return { valid: errors.length === 0, errors };
};

/**
 * Calculates annual carbon footprint from lifestyle inputs
 * @param {Object} inputs - User lifestyle inputs
 * @param {number} inputs.carKm - km driven per day
 * @param {number} inputs.flights - short-haul flights per year
 * @param {number} inputs.bike - cycling/walking days per week
 * @param {string} inputs.diet - diet type key
 * @param {number} inputs.electricity - monthly electricity usage in kWh
 * @param {number} inputs.gas - LPG cylinders per month
 * @returns {{ transport: number, food: number, energy: number, total: number }}
 */
export const calcFootprint = (inputs) => {
  const { valid } = validateInputs(inputs);
  if (!valid) return { transport: 0, food: 0, energy: 0, total: 0 };

  const transport = Math.max(0, Math.round(
    (inputs.carKm * 365 * EMISSION_FACTORS.carKmPerKm) +
    (inputs.flights * EMISSION_FACTORS.flightPerFlight) -
    (inputs.bike * 365 * EMISSION_FACTORS.bikePerDay)
  ));

  const food = Math.round(DIET_EMISSIONS[inputs.diet] || DIET_EMISSIONS.omnivore);

  const energy = Math.round(
    (inputs.electricity * 12 * EMISSION_FACTORS.electricityPerKwh) +
    (inputs.gas * 12 * EMISSION_FACTORS.lpgPerCylinder)
  );

  return { transport, food, energy, total: transport + food + energy };
};

/**
 * Returns a rating based on total annual footprint
 * @param {number} total - Total CO2 in kg/year
 * @returns {{ label: string, color: string }}
 */
export const getRating = (total) => {
  if (total < 1500) return { label: 'Excellent 🌿', color: '#4ade80' };
  if (total < 2500) return { label: 'Good 🌱', color: '#86efac' };
  if (total < 4000) return { label: 'Average ⚡', color: '#fbbf24' };
  return { label: 'High Impact 🔥', color: '#f87171' };
};

/**
 * Generates 3 personalized, data-driven reduction tips
 * @param {Object} data - Combined user inputs + calculated footprint
 * @returns {Array<{ title: string, desc: string, saving: string }>}
 */
export const getPersonalizedTips = (data) => {
  const tips = [];

  if (data.carKm > 30) {
    tips.push({
      title: 'Switch to public transport 3 days/week',
      desc: `You drive ${data.carKm} km/day — that's ${data.transport.toLocaleString()} kg CO₂/year from transport alone. Taking bus or metro 3 days a week saves up to 400 kg CO₂ annually.`,
      saving: '~400 kg CO₂/yr',
    });
  } else if (data.flights > 3) {
    tips.push({
      title: 'Reduce short-haul flights',
      desc: `Your ${data.flights} flights/year contribute significantly. Trains for distances under 500km emit 90% less CO₂ than the same flight.`,
      saving: '~510 kg CO₂/yr',
    });
  } else {
    tips.push({
      title: 'Great job on low transport emissions!',
      desc: `At ${data.transport.toLocaleString()} kg/year, you're already below India's average. Try cycling for trips under 3km to reduce even further.`,
      saving: '~50 kg CO₂/yr',
    });
  }

  const dietTips = {
    meatHeavy: { title: 'Try Meatless Mondays', desc: 'A meat-heavy diet produces up to 3,300 kg CO₂/year. Cutting meat one day a week saves 300+ kg — equivalent to driving 1,200 km less.', saving: '~300 kg CO₂/yr' },
    omnivore: { title: 'Reduce red meat to twice a week', desc: 'Beef produces 20x more emissions than vegetables. Swapping red meat for chicken or fish twice a week cuts your food footprint by 15–20%.', saving: '~400 kg CO₂/yr' },
    flexitarian: { title: 'Go vegetarian 4 days a week', desc: "You're already doing great! Pushing to vegetarian 4 days a week could save an additional 200 kg CO₂ annually.", saving: '~200 kg CO₂/yr' },
    vegetarian: { title: 'Excellent diet choice!', desc: 'Your vegetarian diet saves ~1,100 kg CO₂/year vs a meat-heavy diet. Buying local and seasonal produce reduces it further.', saving: '~100 kg CO₂/yr' },
    vegan: { title: 'Outstanding — lowest food footprint!', desc: 'Your vegan diet saves up to 1,800 kg CO₂/year. The single most impactful dietary choice for the planet.', saving: 'Already optimal!' },
  };
  tips.push(dietTips[data.diet] || dietTips.omnivore);

  if (data.electricity > 200) {
    tips.push({
      title: 'Switch to LED bulbs and smart appliances',
      desc: `Your ${data.electricity} kWh/month generates ${data.energy.toLocaleString()} kg CO₂/year. LEDs + smart power strips reduce consumption by up to 20%.`,
      saving: `~${Math.round(data.energy * 0.2)} kg CO₂/yr`,
    });
  } else if (data.gas > 3) {
    tips.push({
      title: 'Optimize your LPG cooking habits',
      desc: `Using ${data.gas} cylinders/month is above average. Pressure cookers and covering pots while cooking reduce LPG usage by up to 25%.`,
      saving: '~125 kg CO₂/yr',
    });
  } else {
    tips.push({
      title: 'Your home energy use is efficient!',
      desc: `At ${data.electricity} kWh/month, you're below India's average of 250 kWh. A 1kW rooftop solar system offsets 1,500 kg CO₂/year.`,
      saving: 'Up to 1,500 kg CO₂/yr',
    });
  }

  return tips;
};
