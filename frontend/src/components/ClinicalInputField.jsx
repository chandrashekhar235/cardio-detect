import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Info,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { EASE_OUT_EXPO } from '../utils/motion';

export default function ClinicalInputField({
  feature,
  value,
  onChange,
  error,
  patientAge = 54
}) {
  const [infoExpanded, setInfoExpanded] = useState(false);
  const [unknownCholesterol, setUnknownCholesterol] = useState(feature.id === 'Cholesterol' && (value === 0 || value === null));

  // Handle cholesterol unknown toggle
  const handleCholesterolUnknownToggle = () => {
    if (!unknownCholesterol) {
      setUnknownCholesterol(true);
      onChange(0); // 0 maps to NaN in api.py pipeline for median imputation
    } else {
      setUnknownCholesterol(false);
      onChange(240); // default baseline
    }
  };

  // Mini-visualizer rendering based on feature.id
  const renderMiniVisualizer = () => {
    switch (feature.id) {
      case 'RestingBP': {
        const bp = Number(value) || 0;
        let zone = 'Normal';
        let zoneColor = 'text-[var(--medical-green)]';
        let barPercent = 25;

        if (bp >= 140) {
          zone = 'Stage 2 Hypertension (≥ 140)';
          zoneColor = 'text-[var(--coral-red)]';
          barPercent = 90;
        } else if (bp >= 130) {
          zone = 'Stage 1 Hypertension (130–139)';
          zoneColor = 'text-amber-500';
          barPercent = 65;
        } else if (bp >= 120) {
          zone = 'Elevated (120–129)';
          zoneColor = 'text-amber-400';
          barPercent = 42;
        } else {
          zone = 'Normal (< 120 mmHg)';
          zoneColor = 'text-[var(--medical-green)]';
          barPercent = 20;
        }

        return (
          <div className="mt-2.5 p-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs space-y-1.5">
            <div className="flex items-center justify-between font-mono">
              <span className="text-[var(--text-secondary)]">AHA BP Classification:</span>
              <span className={`font-semibold ${zoneColor}`}>{zone}</span>
            </div>
            {/* Multi-segment range meter */}
            <div className="h-1.5 w-full rounded-full bg-[var(--border-subtle)] overflow-hidden relative flex">
              <div className="w-1/4 h-full bg-[var(--medical-green)]/40" />
              <div className="w-1/4 h-full bg-amber-400/40" />
              <div className="w-1/4 h-full bg-amber-500/40" />
              <div className="w-1/4 h-full bg-[var(--coral-red)]/40" />
              {/* Dynamic pointer */}
              <div
                className="absolute top-0 bottom-0 w-2 -ml-1 rounded-full bg-[var(--text-main)] shadow-sm transition-all duration-300"
                style={{ left: `${Math.min(98, Math.max(2, barPercent))}%` }}
              />
            </div>
          </div>
        );
      }

      case 'Cholesterol': {
        if (unknownCholesterol) {
          return (
            <div className="mt-2.5 p-2 rounded-lg bg-[var(--accent-cyan-subtle)] border border-[var(--accent-cyan)]/30 text-xs text-[var(--accent-cyan)] flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Median imputation active: standard training cohort baseline (~223 mg/dL) applied by pipeline.</span>
            </div>
          );
        }
        const chol = Number(value) || 0;
        let status = 'Desirable (< 200)';
        let statusColor = 'text-[var(--medical-green)]';
        if (chol >= 240) {
          status = 'High Risk (≥ 240 mg/dL)';
          statusColor = 'text-[var(--coral-red)]';
        } else if (chol >= 200) {
          status = 'Borderline Elevated (200–239)';
          statusColor = 'text-amber-500';
        }

        return (
          <div className="mt-2.5 p-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs space-y-1.5">
            <div className="flex items-center justify-between font-mono">
              <span className="text-[var(--text-secondary)]">Lipid Reference:</span>
              <span className={`font-semibold ${statusColor}`}>{status}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[var(--border-subtle)] overflow-hidden relative flex">
              <div className="w-1/3 h-full bg-[var(--medical-green)]/40" />
              <div className="w-1/3 h-full bg-amber-400/40" />
              <div className="w-1/3 h-full bg-[var(--coral-red)]/40" />
              <div
                className="absolute top-0 bottom-0 w-2 -ml-1 rounded-full bg-[var(--text-main)] shadow-sm transition-all duration-300"
                style={{
                  left: `${Math.min(98, Math.max(2, (chol / 350) * 100))}%`
                }}
              />
            </div>
          </div>
        );
      }

      case 'MaxHR': {
        const hr = Number(value) || 0;
        const predictedMax = Math.max(140, 220 - (patientAge || 54));
        const pctOfMax = Math.round((hr / predictedMax) * 100);
        const isGoodStress = pctOfMax >= 85;

        return (
          <div className="mt-2.5 p-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs space-y-1.5">
            <div className="flex items-center justify-between font-mono">
              <span className="text-[var(--text-secondary)]">
                Age Target (220 − {patientAge} = {predictedMax} BPM):
              </span>
              <span
                className={`font-semibold ${
                  isGoodStress ? 'text-[var(--medical-green)]' : 'text-amber-500'
                }`}
              >
                {pctOfMax}% of predicted max
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[var(--border-subtle)] overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isGoodStress ? 'bg-[var(--medical-green)]' : 'bg-amber-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(10, pctOfMax))}%` }}
              />
            </div>
          </div>
        );
      }

      case 'Oldpeak': {
        const val = Number(value) || 0;
        let severity = 'Minimal Shift (< 1.0 mm)';
        let sevColor = 'text-[var(--medical-green)]';
        if (val >= 2.0) {
          severity = 'Marked ST Depression (≥ 2.0 mm)';
          sevColor = 'text-[var(--coral-red)]';
        } else if (val >= 1.0) {
          severity = 'Mild / Moderate (1.0–1.9 mm)';
          sevColor = 'text-amber-500';
        }

        return (
          <div className="mt-2.5 p-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs flex items-center justify-between font-mono">
            <div className="flex items-center gap-2">
              {/* Mini SVG ST Depression Dip Graphic */}
              <svg viewBox="0 0 40 16" className="w-10 h-4 stroke-current fill-none text-[var(--accent-cyan)]">
                <path
                  d={`M 0,8 L 12,8 L 16,${8 + Math.min(7, val * 2.2)} L 28,${8 + Math.min(7, val * 2.2)} L 32,8 L 40,8`}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-[var(--text-secondary)]">ECG Ischemic Shift:</span>
            </div>
            <span className={`font-semibold ${sevColor}`}>{severity}</span>
          </div>
        );
      }

      case 'ST_Slope': {
        return (
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[
              { key: 'Up', label: 'Upsloping', icon: TrendingUp, note: 'Benign exertion' },
              { key: 'Flat', label: 'Flat', icon: Minus, note: 'Ischemic sign' },
              { key: 'Down', label: 'Downsloping', icon: TrendingDown, note: 'Severe CAD' },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = value === item.key;
              return (
                <div
                  key={item.key}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    isSelected
                      ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan-subtle)] text-[var(--text-main)]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                  }`}
                >
                  <Icon className={`w-4 h-4 mx-auto mb-1 ${isSelected ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-muted)]'}`} />
                  <div className="text-[11px] font-semibold">{item.label}</div>
                  <div className="text-[9px] text-[var(--text-muted)]">{item.note}</div>
                </div>
              );
            })}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="product-card-glass p-4 sm:p-5 space-y-3 transition-colors duration-200">
      
      {/* Top Header: Label, Unit Badge, and Animated Info Trigger */}
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={`field-${feature.id}`}
          className="text-xs sm:text-sm font-semibold text-[var(--text-main)] flex items-center gap-2"
        >
          <span>{feature.name}</span>
          <span className="input-unit-badge">{feature.unit}</span>
        </label>

        <button
          type="button"
          onClick={() => setInfoExpanded(!infoExpanded)}
          aria-expanded={infoExpanded}
          aria-label={`Clinical information for ${feature.name}`}
          className={`flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md transition-all ${
            infoExpanded
              ? 'bg-[var(--accent-cyan-subtle)] text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-elevated)]'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clinical Guide</span>
          {infoExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Primary Input Control (Numeric with slider or Categorical Option Cards) */}
      {feature.type === 'categorical' ? (
        <div
          role="radiogroup"
          aria-label={feature.name}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1"
        >
          {feature.options.map((opt) => {
            const isSelected = value === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => onChange(opt.key)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-[var(--coral-red)] bg-[var(--coral-red-subtle)] text-[var(--text-main)] shadow-sm'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold ${isSelected ? 'text-[var(--coral-red)]' : 'text-[var(--text-main)]'}`}>
                    {opt.label}
                  </span>
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-[var(--coral-red)] bg-[var(--coral-red)]'
                        : 'border-[var(--border-strong)]'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-tight">
                  {opt.desc}
                </p>
              </button>
            );
          })}
        </div>
      ) : (
        /* Numeric Input with Synchronized Range Slider or Unknown Toggle */
        <div className="space-y-2 pt-1">
          {feature.id === 'Cholesterol' && (
            <div className="flex items-center justify-between pb-1 text-xs">
              <span className="text-[var(--text-muted)]">Don't have your lab report?</span>
              <button
                type="button"
                onClick={handleCholesterolUnknownToggle}
                className={`text-[11px] font-mono px-2.5 py-1 rounded-md transition-colors ${
                  unknownCholesterol
                    ? 'bg-[var(--accent-cyan)] text-white font-semibold'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
                }`}
              >
                {unknownCholesterol ? '✓ "I don’t know" (Using Median)' : 'Select "I don’t know"'}
              </button>
            </div>
          )}

          {!unknownCholesterol && (
            <div className="flex items-center gap-3">
              <input
                id={`field-${feature.id}`}
                type="range"
                min={feature.min}
                max={feature.max}
                step={feature.step}
                value={value || feature.min}
                onChange={(e) => onChange(feature.step === 1 ? parseInt(e.target.value) : parseFloat(e.target.value))}
                className="flex-1"
                aria-label={`${feature.name} slider`}
              />
              <input
                type="number"
                min={feature.min}
                max={feature.max}
                step={feature.step}
                value={value !== null && value !== undefined ? value : ''}
                onChange={(e) => {
                  const val = feature.step === 1 ? parseInt(e.target.value) : parseFloat(e.target.value);
                  onChange(isNaN(val) ? '' : val);
                }}
                className="form-input w-24 text-center font-mono font-semibold"
                aria-label={`${feature.name} number`}
              />
            </div>
          )}
        </div>
      )}

      {/* Mini Reactive Visualizer (Reacts dynamically to current value) */}
      {renderMiniVisualizer()}

      {/* Always Visible Guidelines (Short 'What it is' and 'What to enter') */}
      <div className="pt-1 text-[11px] space-y-0.5 border-t border-[var(--border-subtle)]/60">
        <div className="text-[var(--text-secondary)] flex items-baseline gap-1.5">
          <span className="font-mono text-[10px] uppercase text-[var(--accent-cyan)] font-semibold shrink-0">What it is:</span>
          <span>{feature.whatItIs}</span>
        </div>
        <div className="text-[var(--text-muted)] flex items-baseline gap-1.5">
          <span className="font-mono text-[10px] uppercase text-[var(--medical-green)] font-semibold shrink-0">What to enter:</span>
          <span>{feature.whatToEnter}</span>
        </div>
      </div>

      {/* Inline Validation Error */}
      {error && (
        <div className="text-xs text-[var(--coral-red)] flex items-center gap-1.5 pt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Expandable Animated Clinical Drawer */}
      <AnimatePresence>
        {infoExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs space-y-2.5">
              <div>
                <span className="font-mono font-semibold text-[10px] uppercase tracking-wider text-[var(--text-muted)] block mb-0.5">
                  Where to find this in your medical records
                </span>
                <p className="text-[var(--text-main)] leading-relaxed">
                  {feature.whereToFind}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-[var(--border-subtle)]">
                <div>
                  <span className="font-mono font-semibold text-[10px] uppercase tracking-wider text-[var(--medical-green)] block mb-0.5">
                    Standard Reference
                  </span>
                  <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed">
                    {feature.normalRange}
                  </p>
                </div>
                <div>
                  <span className="font-mono font-semibold text-[10px] uppercase tracking-wider text-[var(--coral-red)] block mb-0.5">
                    Clinical Watch Boundary
                  </span>
                  <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed">
                    {feature.concerningRange}
                  </p>
                </div>
              </div>

              <div className="pt-1 border-t border-[var(--border-subtle)]">
                <span className="font-mono font-semibold text-[10px] uppercase tracking-wider text-[var(--accent-cyan)] block mb-0.5">
                  Why the K-Nearest Neighbors Pipeline Uses It
                </span>
                <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed">
                  {feature.whyModelUsesIt}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
