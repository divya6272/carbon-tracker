import React, { useMemo, useCallback } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getRating, getPersonalizedTips, BENCHMARKS } from '../utils/carbonCalculator';

const COLORS = ['#4ade80', '#22c55e', '#86efac'];

const srOnly = { position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 };

const s = {
  page: { minHeight: '100vh', padding: '40px 24px', maxWidth: '800px', margin: '0 auto' },
  tag: { fontFamily: 'var(--mono)', fontSize: '12px', color: '#4ade80', letterSpacing: '0.1em', marginBottom: '8px' },
  title: { fontFamily: 'var(--serif)', fontSize: '38px', fontWeight: 300, color: '#e8f5e8', lineHeight: 1.2 },
  titleNum: { color: '#4ade80', fontStyle: 'italic' },
  badge: (color) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: '100px', fontSize: '12px', background: `${color}22`, color, border: `1px solid ${color}44`, marginTop: '8px' }),
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' },
  card: { background: '#0f1c0f', border: '1px solid #1e3a1e', borderRadius: '16px', padding: '24px' },
  cardTitle: { fontSize: '12px', color: '#5a8a5a', fontFamily: 'var(--mono)', letterSpacing: '0.08em', marginBottom: '12px' },
  bigNum: { fontFamily: 'var(--mono)', fontSize: '36px', color: '#4ade80', fontWeight: 500 },
  bigUnit: { fontSize: '14px', color: '#5a8a5a', marginLeft: '6px' },
  aiCard: {
    background: 'linear-gradient(135deg, rgba(74,222,128,0.08) 0%, rgba(74,222,128,0.03) 100%)',
    border: '1px solid rgba(74,222,128,0.25)', borderRadius: '16px', padding: '28px', marginBottom: '20px',
  },
  aiHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
  aiIcon: { width: '32px', height: '32px', background: 'rgba(74,222,128,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  aiTitle: { fontSize: '15px', fontWeight: 600, color: '#e8f5e8' },
  aiSub: { fontSize: '12px', color: '#5a8a5a' },
  tipItem: { display: 'flex', gap: '14px', padding: '14px 0' },
  tipNum: { fontFamily: 'var(--mono)', fontSize: '13px', color: '#4ade80', fontWeight: 600, minWidth: '24px', paddingTop: '2px' },
  tipTitle: { fontSize: '14px', fontWeight: 600, color: '#e8f5e8', marginBottom: '4px' },
  tipDesc: { fontSize: '13px', color: '#6b9f6b', lineHeight: 1.6 },
  tipSaving: { fontSize: '11px', color: '#4ade80', fontFamily: 'var(--mono)', marginTop: '4px', fontWeight: 600 },
  btnRow: { display: 'flex', gap: '12px', marginTop: '28px', flexWrap: 'wrap' },
  btnPrimary: { padding: '14px 28px', background: '#4ade80', color: '#060d06', border: 'none', borderRadius: '100px', fontSize: '15px', fontFamily: 'var(--sans)', fontWeight: 600, cursor: 'pointer' },
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f1c0f', border: '1px solid #1e3a1e', borderRadius: '8px', padding: '10px 14px' }}>
      <div style={{ color: '#4ade80', fontFamily: 'var(--mono)', fontSize: '14px' }}>
        {payload[0].name}: {payload[0].value.toLocaleString()} kg
      </div>
    </div>
  );
};

export default function Dashboard({ data, onRecalculate }) {
  const pieData = useMemo(() => [
    { name: 'Transport', value: data.transport },
    { name: 'Food', value: data.food },
    { name: 'Energy', value: data.energy },
  ], [data.transport, data.food, data.energy]);

  const barData = useMemo(() => [
    { name: 'You', value: data.total, fill: '#4ade80' },
    { name: 'India avg', value: BENCHMARKS.india, fill: '#1e3a1e' },
    { name: 'Global avg', value: BENCHMARKS.global, fill: '#2a4a2a' },
  ], [data.total]);

  const rating = useMemo(() => getRating(data.total), [data.total]);
  const tips = useMemo(() => getPersonalizedTips(data), [data]);
  const handleRecalculate = useCallback(() => onRecalculate(), [onRecalculate]);

  return (
    <main style={s.page} role="main" aria-label="Your carbon footprint report">
      <header style={{ marginBottom: '36px' }}>
        <div style={s.tag}>YOUR CARBON FOOTPRINT REPORT</div>
        <h1 style={s.title}>
          You emit <span style={s.titleNum}>{data.total.toLocaleString()} kg</span><br />
          of CO₂ per year
        </h1>
        <span style={s.badge(rating.color)} role="status" aria-label={`Rating: ${rating.label}`}>
          {rating.label}
        </span>
      </header>

      <section aria-label="Emissions by category" style={s.grid}>
        {[
          { label: 'TRANSPORT', val: data.transport },
          { label: 'FOOD', val: data.food },
          { label: 'ENERGY', val: data.energy },
        ].map(({ label, val }) => (
          <div key={label} style={s.card}>
            <div style={s.cardTitle}>{label}</div>
            <span style={s.bigNum}>{val.toLocaleString()}</span>
            <span style={s.bigUnit}>kg/yr</span>
            <span style={srOnly}>{label}: {val.toLocaleString()} kilograms per year</span>
          </div>
        ))}
      </section>

      <section aria-label="Visual charts" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px', marginBottom: '20px' }}>
        <div style={s.card}>
          <h2 style={s.cardTitle}>BREAKDOWN</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" strokeWidth={0} aria-label="Pie chart of emissions breakdown">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {pieData.map((d, i) => (
              <li key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#9dbf9d', marginBottom: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: COLORS[i], flexShrink: 0 }} aria-hidden="true" />
                {d.name}: {d.value.toLocaleString()} kg
              </li>
            ))}
          </ul>
        </div>

        <div style={s.card}>
          <h2 style={s.cardTitle}>VS BENCHMARKS</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} aria-label="Bar chart comparing your footprint to India and global averages">
              <XAxis dataKey="name" tick={{ fill: '#5a8a5a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5a8a5a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section style={s.aiCard} aria-labelledby="ai-heading">
        <div style={s.aiHeader}>
          <div style={s.aiIcon} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h2 id="ai-heading" style={s.aiTitle}>AI-Powered Insights</h2>
            <p style={s.aiSub}>Personalized recommendations based on your data</p>
          </div>
        </div>

        <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {tips.map((tip, i) => (
            <li key={i} style={{ ...s.tipItem, borderBottom: i < tips.length - 1 ? '1px solid rgba(74,222,128,0.08)' : 'none' }}>
              <div style={s.tipNum} aria-hidden="true">0{i + 1}</div>
              <div>
                <div style={s.tipTitle}>{tip.title}</div>
                <div style={s.tipDesc}>{tip.desc}</div>
                <div style={s.tipSaving}>Potential saving: {tip.saving}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div style={s.btnRow}>
        <button type="button" style={s.btnPrimary} onClick={handleRecalculate} aria-label="Recalculate your carbon footprint with new inputs">
          Recalculate
        </button>
      </div>
    </main>
  );
}
