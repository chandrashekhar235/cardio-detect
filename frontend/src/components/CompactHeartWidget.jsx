import React from 'react';

export default function CompactHeartWidget({ restingBP, maxHR, oldpeak }) {
  // Dynamically calculate pulse rate indicator based on entered MaxHR
  const hr = maxHR || 75;
  const bp = restingBP || 120;
  const isHighBP = bp >= 140;

  return (
    <div className="product-card p-4 space-y-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 text-[11px] font-mono">
        <span className="text-[var(--text-secondary)]">Vitals Rhythm Monitor</span>
        <span className={isHighBP ? 'text-[var(--coral-red)] font-semibold' : 'text-[var(--medical-green)] font-semibold'}>
          {hr} BPM • {bp} mmHg
        </span>
      </div>

      <div className="h-20 w-full flex items-center justify-center relative">
        <svg
          viewBox="0 0 240 60"
          className="w-full h-16 stroke-current fill-none"
          style={{ strokeWidth: 1.75, strokeLinecap: 'round' }}
        >
          {/* Subtle baseline */}
          <line x1="0" y1="30" x2="240" y2="30" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="3 3" />
          
          {/* Waveform tailored to Oldpeak (ST depression) */}
          <path
            d={`M 0,30 L 40,30 L 52,30 L 58,24 L 64,36 L 70,30 L 80,30 L 85,10 L 92,${oldpeak > 1.5 ? 52 : 46} L 99,22 L 105,${30 + Math.min(oldpeak * 3, 15)} L 115,30 L 130,30 L 142,26 L 154,30 L 240,30`}
            stroke="var(--coral-red)"
            className="ecg-animated-line"
          />
        </svg>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)] pt-1 border-t border-[var(--border-subtle)]">
        <span>ST Delta: {oldpeak || 0.0} mm</span>
        <span className="text-[var(--accent-cyan)]">Live Parameter Feedback</span>
      </div>
    </div>
  );
}
