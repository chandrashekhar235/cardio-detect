import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Activity,
  RefreshCw
} from 'lucide-react';
import { predictRisk } from '../api';

const PRESET_DATA = {
  healthy: {
    name: 'Healthy Baseline (Athletic)',
    desc: 'Age 28, female athlete, normal BP & cholesterol, upsloping ST',
    vitals: {
      Age: 28,
      Sex: 'F',
      ChestPainType: 'ATA',
      RestingBP: 115,
      Cholesterol: 180,
      FastingBS: 0,
      RestingECG: 'Normal',
      MaxHR: 178,
      ExerciseAngina: 'N',
      Oldpeak: 0.0,
      ST_Slope: 'Up'
    }
  },
  moderate: {
    name: 'Moderate Vitals (Stage 1 HTN)',
    desc: 'Age 54, male, BP 138, cholesterol 245, flat ST slope',
    vitals: {
      Age: 54,
      Sex: 'M',
      ChestPainType: 'NAP',
      RestingBP: 138,
      Cholesterol: 245,
      FastingBS: 0,
      RestingECG: 'Normal',
      MaxHR: 142,
      ExerciseAngina: 'N',
      Oldpeak: 1.2,
      ST_Slope: 'Flat'
    }
  },
  acute: {
    name: 'Acute Ischemia / Watchlist',
    desc: 'Age 64, male, BP 160, cholesterol 288, exertional angina, 2.8mm ST dip',
    vitals: {
      Age: 64,
      Sex: 'M',
      ChestPainType: 'ASY',
      RestingBP: 160,
      Cholesterol: 288,
      FastingBS: 1,
      RestingECG: 'ST',
      MaxHR: 115,
      ExerciseAngina: 'Y',
      Oldpeak: 2.8,
      ST_Slope: 'Flat'
    }
  }
};

export default function LandingPageMiniDemo() {
  const [selectedPreset, setSelectedPreset] = useState('healthy');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleRunDemo = async () => {
    setLoading(true);
    setResult(null);

    try {
      const data = await predictRisk(PRESET_DATA[selectedPreset].vitals);
      // Brief animated delay for telemetry feel
      setTimeout(() => {
        setResult(data);
        setLoading(false);
      }, 600);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="product-card-glass p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent-cyan)] font-semibold uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Live Simulation</span>
          </div>
          <h3 className="font-display font-semibold text-xl text-[var(--text-main)] mt-0.5">
            Test the K-NN Classifier in Real Time
          </h3>
        </div>

        <button
          onClick={() => navigate('/assess')}
          className="text-xs font-mono text-[var(--accent-cyan)] hover:text-[var(--text-main)] flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Open Full Clinical Console</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Object.entries(PRESET_DATA).map(([key, item]) => {
          const isSelected = selectedPreset === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                setSelectedPreset(key);
                setResult(null);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan-subtle)] text-[var(--text-main)] shadow-sm'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
              }`}
            >
              <div className="text-xs font-bold mb-1">{item.name}</div>
              <div className="text-[11px] text-[var(--text-muted)] line-clamp-2">{item.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="text-xs font-mono text-[var(--text-muted)]">
          Payload: 11 standardized UCI features → /api/predict
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleRunDemo}
          className="btn-primary text-xs py-2.5 px-6 shadow-sm flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          {loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Matching 5 Neighbors...</span>
            </>
          ) : (
            <>
              <Activity className="w-3.5 h-3.5" />
              <span>Run Live Simulation</span>
            </>
          )}
        </button>
      </div>

      {/* Results Box */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 sm:p-5 rounded-2xl border ${
            result.is_high_risk
              ? 'border-[var(--coral-red)]/40 bg-[var(--coral-red-subtle)]'
              : 'border-[var(--medical-green)]/40 bg-[var(--medical-green-subtle)]'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                  result.is_high_risk ? 'bg-[var(--coral-red)]' : 'bg-[var(--medical-green)]'
                }`}
              >
                {result.is_high_risk ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase text-[var(--text-muted)]">
                  Simulated Output:
                </span>
                <div className="font-display font-bold text-base sm:text-lg text-[var(--text-main)]">
                  {result.risk_level} ({result.risk_percentage}% Consensus)
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/assess')}
              className="text-xs font-mono font-semibold underline text-[var(--text-main)] hover:text-[var(--accent-cyan)] self-start sm:self-auto cursor-pointer flex items-center gap-1"
            >
              <span>Analyze in full clinical console</span>
              <ArrowRight className="w-3.5 h-3.5 inline" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
