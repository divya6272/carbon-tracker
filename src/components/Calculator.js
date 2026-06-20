import React, { useState, useCallback } from 'react';
import { calcFootprint } from '../utils/carbonCalculator';

const s = {
  page: { minHeight: '100vh', padding: '40px 24px', maxWidth: '700px', margin: '0 auto' },
  header: { marginBottom: '40px' },
  step: { fontFamily: 'var(--mono)', fontSize: '12px', color: '#4ade80', letterSpacing: '0.1em', marginBottom: '8px' },
  title: { fontFamily: 'var(--serif)', fontSize: '36px', fontWeight: 300, color: '#e8f5e8' },
  progress: { display: 'flex', gap: '6px', marginTop: '20px' },
  progressDot: (active, done) => ({
    height: '3px', flex: 1, borderRadius: '2px',
    background: done ? '#4ade80' : active ? 'rgba(74,222,128,0.5)' : 'rgba(74,222,128,0.15)',
    transition: 'all 0.3s',
  }),
  card: { background: '#0f1c0f', border: '1px solid #1e3a1e', borderRadius: '16px', padding: '32px', marginBottom: '20px' },
  sectionTitle: { fontFamily: 'var(--serif)', fontSize: '22px', fontWeight: 300, color: '#e8f5e8', marginBottom: '6px' },
  sectionSub: { fontSize: '13px', color: '#5a8a5a', marginBottom: '28px' },
  field: { marginBottom: '24px' },
  label: { display: 'block', fontSize: '14px', color: '#9dbf9d', marginBottom: '10px', fontWeight: 500 },
  sublabel: { fontSize: '12px', color: '#5a8a5a', marginLeft: '8px', fontWeight: 400 },
  row: { display: 'flex', gap: '12px', alignItems: 'center' },
  slider: { width: '100%', accentColor: '#4ade80', cursor: 'pointer' },
  sliderVal: { fontFamily: 'var(--mono)', fontSize: '20px', color: '#4ade80', minWidth: '48px', textAlign: 'right' },
  dietGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' },
  dietBtn: (sel) => ({
    padding: '12px 10px', borderRadius: '10px', border: `1px solid ${sel ? '#4ade80' : '#1e3a1e'}`,
    background: sel ? 'rgba(74,222,128,0.1)' : '#111f11', color: sel ? '#4ade80' : '#9dbf9d',
    cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--sans)', fontWeight: sel ? 600 : 400,
    transition: 'all 0.15s', textAlign: 'center',
  }),
  navRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' },
  btnPrimary: {
    padding: '14px 28px', background: '#4ade80', color: '#060d06', border: 'none',
    borderRadius: '100px', fontSize: '15px', fontFamily: 'var(--sans)', fontWeight: 600,
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
  },
  btnSecondary: {
    padding: '14px 24px', background: 'none', color: '#9dbf9d', border: '1px solid #1e3a1e',
    borderRadius: '100px', fontSize: '15px', fontFamily: 'var(--sans)', cursor: 'pointer',
  },
  liveScore: {
    background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)',
    borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '20px',
  },
  liveLabel: { fontSize: '13px', color: '#5a8a5a' },
  liveNum: { fontFamily: 'var(--mono)', fontSize: '24px', color: '#4ade80', fontWeight: 500 },
  srOnly: { position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 },
};

const DIETS = [
  { key: 'vegan', label: '🌱 Vegan' },
  { key: 'vegetarian', label: '🥗 Vegetarian' },
  { key: 'flexitarian', label: '🐟 Flexitarian' },
  { key: 'omnivore', label: '🍖 Omnivore' },
  { key: 'meatHeavy', label: '🥩 Meat-heavy' },
];

const DEFAULT_INPUTS = {
  carKm: 20, flights: 2, bike: 0,
  diet: 'omnivore',
  electricity: 150, gas: 2,
};

export default function Calculator({ onDone }) {
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);

  const set = useCallback((key, val) => setInputs(p => ({ ...p, [key]: val })), []);
  const fp = calcFootprint(inputs);
  const sections = ['Transport', 'Food', 'Home Energy'];

  const nextStep = useCallback(() => setStep(s => Math.min(s + 1, 2)), []);
  const prevStep = useCallback(() => setStep(s => Math.max(s - 1, 0)), []);
  const handleDone = useCallback(() => onDone({ ...inputs, ...fp }), [inputs, fp, onDone]);

  const ArrowIcon = ({ dir = 'right' }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dir === 'right' ? <path d="M5 12h14M12 5l7 7-7 7" /> : <path d="M19 12H5M12 19l-7-7 7-7" />}
    </svg>
  );

  return (
    <main style={s.page} role="main" aria-label="Carbon footprint calculator">
      <header style={s.header}>
        <div style={s.step} aria-live="polite">STEP {step + 1} OF 3 · {sections[step].toUpperCase()}</div>
        <h2 style={s.title}>
          {step === 0 && 'How do you get around?'}
          {step === 1 && 'What do you eat?'}
          {step === 2 && 'Home energy use?'}
        </h2>
        <div style={s.progress} role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={3} aria-label={`Step ${step + 1} of 3`}>
          {[0, 1, 2].map(i => <div key={i} style={s.progressDot(i === step, i < step)} />)}
        </div>
      </header>

      <div style={s.liveScore} role="status" aria-live="polite" aria-label={`Current estimated footprint: ${fp.total.toLocaleString()} kg CO2 per year`}>
        <div>
          <div style={s.liveLabel}>Your footprint so far</div>
          <div style={{ fontSize: '12px', color: '#3a6a3a', marginTop: '2px' }}>
            India avg: ~1,900 kg · Global avg: ~4,700 kg
          </div>
        </div>
        <div>
          <span style={s.liveNum}>{fp.total.toLocaleString()}</span>
          <span style={{ fontSize: '13px', color: '#5a8a5a', marginLeft: '4px' }}>kg CO₂/yr</span>
        </div>
      </div>

      {step === 0 && (
        <section style={s.card} aria-labelledby="transport-heading">
          <h3 id="transport-heading" style={s.sectionTitle}>Transport</h3>
          <p style={s.sectionSub}>Your daily travel and flying habits</p>

          <div style={s.field}>
            <label style={s.label} htmlFor="carKm">
              Car / motorbike travel <span style={s.sublabel}>km per day</span>
            </label>
            <div style={s.row}>
              <input id="carKm" type="range" min={0} max={200} value={inputs.carKm}
                onChange={e => set('carKm', +e.target.value)} style={s.slider}
                aria-valuetext={`${inputs.carKm} kilometres per day`} />
              <span style={s.sliderVal} aria-hidden="true">{inputs.carKm}</span>
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label} htmlFor="flights">
              Flights per year <span style={s.sublabel}>short-haul ~2hr</span>
            </label>
            <div style={s.row}>
              <input id="flights" type="range" min={0} max={30} value={inputs.flights}
                onChange={e => set('flights', +e.target.value)} style={s.slider}
                aria-valuetext={`${inputs.flights} flights per year`} />
              <span style={s.sliderVal} aria-hidden="true">{inputs.flights}</span>
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label} htmlFor="bike">
              Walk / cycle days <span style={s.sublabel}>days per week</span>
            </label>
            <div style={s.row}>
              <input id="bike" type="range" min={0} max={7} value={inputs.bike}
                onChange={e => set('bike', +e.target.value)} style={s.slider}
                aria-valuetext={`${inputs.bike} days per week`} />
              <span style={s.sliderVal} aria-hidden="true">{inputs.bike}</span>
            </div>
          </div>
        </section>
      )}

      {step === 1 && (
        <section style={s.card} aria-labelledby="diet-heading">
          <h3 id="diet-heading" style={s.sectionTitle}>Diet</h3>
          <p style={s.sectionSub}>Food production accounts for ~25% of global emissions</p>
          <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend style={s.label}>What best describes your diet?</legend>
            <div style={s.dietGrid} role="radiogroup" aria-label="Select your diet type">
              {DIETS.map(d => (
                <button key={d.key} type="button" role="radio" aria-checked={inputs.diet === d.key}
                  style={s.dietBtn(inputs.diet === d.key)} onClick={() => set('diet', d.key)}>
                  {d.label}
                </button>
              ))}
            </div>
          </fieldset>
        </section>
      )}

      {step === 2 && (
        <section style={s.card} aria-labelledby="energy-heading">
          <h3 id="energy-heading" style={s.sectionTitle}>Home energy</h3>
          <p style={s.sectionSub}>Electricity and cooking gas usage at home</p>

          <div style={s.field}>
            <label style={s.label} htmlFor="electricity">
              Monthly electricity <span style={s.sublabel}>kWh/month</span>
            </label>
            <div style={s.row}>
              <input id="electricity" type="range" min={0} max={600} step={10} value={inputs.electricity}
                onChange={e => set('electricity', +e.target.value)} style={s.slider}
                aria-valuetext={`${inputs.electricity} kilowatt hours per month`} />
              <span style={s.sliderVal} aria-hidden="true">{inputs.electricity}</span>
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label} htmlFor="gas">
              LPG cylinders/month <span style={s.sublabel}>14.2 kg cylinders</span>
            </label>
            <div style={s.row}>
              <input id="gas" type="range" min={0} max={8} step={0.5} value={inputs.gas}
                onChange={e => set('gas', +e.target.value)} style={s.slider}
                aria-valuetext={`${inputs.gas} LPG cylinders per month`} />
              <span style={s.sliderVal} aria-hidden="true">{inputs.gas}</span>
            </div>
          </div>
        </section>
      )}

      <nav style={s.navRow} aria-label="Calculator navigation">
        {step > 0
          ? <button type="button" style={s.btnSecondary} onClick={prevStep} aria-label="Go to previous step">← Back</button>
          : <div />}
        {step < 2
          ? <button type="button" style={s.btnPrimary} onClick={nextStep} aria-label="Go to next step">
              Next <ArrowIcon />
            </button>
          : <button type="button" style={s.btnPrimary} onClick={handleDone} aria-label="View your carbon footprint results">
              See my results <ArrowIcon />
            </button>}
      </nav>
    </main>
  );
}
