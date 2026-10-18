import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  Printer,
  RotateCcw,
  Users,
  Activity,
  AlertTriangle,
  Heart,
  CheckCircle2
} from 'lucide-react';
import { useCountUp, fadeUpVariant, staggerContainer } from '../utils/motion';

export default function CaseReport({ report, onReset }) {
  const isHighRisk = Boolean(report?.is_high_risk);
  // For k=5: risk percentage (0, 20, 40, 60, 80, 100)
  const riskPct = report?.risk_percentage ?? (report?.prediction === 1 ? 80 : 20);
  const positiveNeighbors = Math.round((riskPct / 100) * 5);

  // Animated count up for risk percentage (Called unconditionally before early return)
  const animatedPct = useCountUp(riskPct, 1000, 0);

  if (!report) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      id="case-report"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6 pt-4"
    >
      {/* Top Banner: Verdict First (Icon + Text, never color alone) */}
      <motion.div
        variants={fadeUpVariant}
        className={`p-6 sm:p-8 rounded-2xl border-2 transition-all ${
          isHighRisk
            ? 'border-[var(--coral-red)] bg-[var(--coral-red-subtle)] text-[var(--text-main)] shadow-lg shadow-[var(--coral-red-subtle)]'
            : 'border-[var(--medical-green)] bg-[var(--medical-green-subtle)] text-[var(--text-main)] shadow-lg shadow-[var(--medical-green-subtle)]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                isHighRisk ? 'bg-[var(--coral-red)] text-white' : 'bg-[var(--medical-green)] text-white'
              }`}
            >
              {isHighRisk ? (
                <ShieldAlert className="w-8 h-8" />
              ) : (
                <ShieldCheck className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  Classification Verdict
                </span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[var(--bg-canvas)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                  {report.caseId || 'CD-VERDICT'}
                </span>
              </div>
              <h3 className="font-display font-bold text-2xl sm:text-3xl tracking-tight">
                {isHighRisk ? 'Elevated Cardiovascular Risk' : 'Low Cardiovascular Risk'}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl leading-relaxed">
                {report.status_description}
              </p>
            </div>
          </div>

          {/* Quick Actions (Print / Re-assess) */}
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0 no-print">
            <button
              type="button"
              onClick={handlePrint}
              className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
              title="Print Clinical Case Summary"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Summary</span>
            </button>
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-main)] p-2 rounded-lg hover:bg-[var(--bg-elevated)] flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Assessment</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Honest KNN Evidence Section */}
      <motion.div variants={fadeUpVariant} className="product-card-glass p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-[var(--accent-cyan)] font-semibold mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>Honest K-Nearest Neighbors Evidence (k=5)</span>
            </div>
            <h4 className="font-display font-semibold text-lg text-[var(--text-main)]">
              Cohort Consensus: {positiveNeighbors} of 5 similar clinical cases
            </h4>
          </div>
          <div className="text-left sm:text-right">
            <div className="font-mono text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
              {animatedPct}%
            </div>
            <div className="text-[11px] font-mono text-[var(--text-muted)]">
              Discrete Consensus ({positiveNeighbors}/5 Neighbors)
            </div>
          </div>
        </div>

        {/* 5 Animated Neighbor Patient Dots */}
        <div className="space-y-3">
          <div className="text-xs text-[var(--text-secondary)]">
            In our 15-dimensional Euclidean space, the 5 closest matched historical patients in the training registry voted as follows:
          </div>
          
          <div className="grid grid-cols-5 gap-3 max-w-lg">
            {[1, 2, 3, 4, 5].map((idx) => {
              const hasDisease = idx <= positiveNeighbors;
              return (
                <motion.div
                  key={idx}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 * idx, duration: 0.3 }}
                  className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all ${
                    hasDisease
                      ? 'border-[var(--coral-red)]/50 bg-[var(--coral-red-subtle)] text-[var(--coral-red)]'
                      : 'border-[var(--medical-green)]/50 bg-[var(--medical-green-subtle)] text-[var(--medical-green)]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      hasDisease ? 'bg-[var(--coral-red)] text-white' : 'bg-[var(--medical-green)] text-white'
                    }`}
                  >
                    {idx}
                  </div>
                  <span className="font-mono text-[10px] font-semibold">
                    {hasDisease ? 'CAD (+)' : 'Normal (-)'}
                  </span>
                </motion.div>
              );
            })}
          </div>

          <p className="text-[11px] text-[var(--text-muted)] font-mono">
            * Note: Because k=5, possible probabilistic outputs are strictly 0%, 20%, 40%, 60%, 80%, or 100%. We report the exact integer consensus rather than an artificially granular percentage.
          </p>
        </div>

        {/* Contributing Factors & Physiological Risks */}
        <div className="space-y-3 pt-2">
          <h5 className="font-display font-semibold text-sm text-[var(--text-main)] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--coral-red)]" />
            <span>Observed Physiological Contributing Indicators</span>
          </h5>

          {report.contributing_factors && report.contributing_factors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {report.contributing_factors.map((factor, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-start gap-2.5 text-xs text-[var(--text-main)]"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{factor}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-[var(--medical-green-subtle)] border border-[var(--medical-green)]/30 text-xs text-[var(--medical-green)] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>All 11 clinical indicators are within expected normal physiological thresholds.</span>
            </div>
          )}
        </div>

        {/* Clinical Next Steps & Recommendations */}
        <div className="space-y-3 pt-2 border-t border-[var(--border-subtle)]">
          <h5 className="font-display font-semibold text-sm text-[var(--text-main)] flex items-center gap-2">
            <Heart className="w-4 h-4 text-[var(--accent-cyan)]" />
            <span>Clinical Lifestyle & Diagnostic Recommendations</span>
          </h5>

          <div className="space-y-2">
            {report.recommendations?.map((rec, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] flex items-start gap-2 leading-relaxed"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)] shrink-0 mt-1.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Persistent Calm Medical Disclaimer */}
        <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] space-y-1">
          <span className="font-mono font-semibold uppercase tracking-wider text-[var(--text-secondary)] block">
            Institutional Medical Disclaimer:
          </span>
          <p>
            CardioDetect is an educational cardiovascular research and machine-learning demonstration tool. It does not provide medical diagnoses, treatment plans, or formal clinical judgments. Always consult a board-certified physician or cardiologist regarding cardiovascular health concerns or abnormal vitals.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
