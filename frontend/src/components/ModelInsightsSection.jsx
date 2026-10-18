import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot
} from 'recharts';
import {
  BarChart3,
  Database,
  FileText
} from 'lucide-react';
import { fetchMetrics, fetchRocCurve } from '../api';
import { useTheme } from '../context/ThemeContext';
import { useCountUp, fadeUpVariant, staggerContainer } from '../utils/motion';

export default function ModelInsightsSection({ sessionCases = [] }) {
  const { theme } = useTheme();
  const [metrics, setMetrics] = useState(null);
  const [rocData, setRocData] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [m, r] = await Promise.all([fetchMetrics(), fetchRocCurve()]);
        setMetrics(m);
        setRocData(r.points || []);
      } catch (err) {
        console.warn('Using cached metrics fallback:', err);
        // Fallback to exact values from api.py
        setMetrics({
          accuracy: 0.8641,
          roc_auc: 0.9269,
          precision: 0.8812,
          recall: 0.8725,
          confusion_matrix: {
            true_negative: 70,
            false_positive: 12,
            false_negative: 13,
            true_positive: 89
          }
        });
      }
    }
    loadData();
  }, []);

  // Count up animations
  const accVal = useCountUp(metrics ? metrics.accuracy * 100 : 86.41, 1200, 2);
  const aucVal = useCountUp(metrics ? metrics.roc_auc : 0.9269, 1200, 4);
  const precVal = useCountUp(metrics ? metrics.precision * 100 : 88.12, 1200, 2);
  const recVal = useCountUp(metrics ? metrics.recall * 100 : 87.25, 1200, 2);

  const chartStroke = theme === 'dark' ? '#45D9E8' : '#007D8F';
  const gridStroke = theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)';
  const textFill = theme === 'dark' ? '#94A3B8' : '#64748B';

  return (
    <section id="insights" className="py-20 sm:py-28 border-b border-[var(--border-subtle)] relative">
      <div className="site-container">
        
        {/* Section Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mb-12 space-y-3"
        >
          <motion.div
            variants={fadeUpVariant}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-cyan-subtle)] text-[var(--accent-cyan)] text-xs font-mono uppercase tracking-wider"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Statistical Validation & Metrics</span>
          </motion.div>

          <motion.h2
            variants={fadeUpVariant}
            className="text-3xl sm:text-4xl font-display font-bold text-[var(--text-main)] tracking-tight"
          >
            Model Insights & Evaluation
          </motion.h2>

          <motion.p variants={fadeUpVariant} className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            Performance metrics derived from a stratified 80/20 holdout test split (184 unseen patient cases) from the 918-record UCI cardiovascular cohort.
          </motion.p>
        </motion.div>

        {/* 4 Metric Cards with Count-Up and Plain-English Meaning */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          
          {/* Accuracy */}
          <div className="product-card-glass p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)] font-mono uppercase">Overall Accuracy</span>
              <span className="w-2 h-2 rounded-full bg-[var(--medical-green)]" />
            </div>
            <div className="font-mono font-bold text-2xl sm:text-3xl text-[var(--text-main)]">
              {accVal}%
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-1.5">
              Correctly categorized 159 of the 184 unseen holdout test cases.
            </p>
          </div>

          {/* ROC-AUC */}
          <div className="product-card-glass p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)] font-mono uppercase">ROC-AUC Area</span>
              <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)]" />
            </div>
            <div className="font-mono font-bold text-2xl sm:text-3xl text-[var(--accent-cyan)]">
              {aucVal}
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-1.5">
              High discriminative power separating healthy from ischemic cases.
            </p>
          </div>

          {/* Precision */}
          <div className="product-card-glass p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)] font-mono uppercase">Precision</span>
              <span className="w-2 h-2 rounded-full bg-[var(--medical-green)]" />
            </div>
            <div className="font-mono font-bold text-2xl sm:text-3xl text-[var(--text-main)]">
              {precVal}%
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-1.5">
              When predicting positive disease risk, the model was correct 88.1% of the time.
            </p>
          </div>

          {/* Recall / Sensitivity */}
          <div className="product-card-glass p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)] font-mono uppercase">Sensitivity / Recall</span>
              <span className="w-2 h-2 rounded-full bg-[var(--coral-red)]" />
            </div>
            <div className="font-mono font-bold text-2xl sm:text-3xl text-[var(--coral-red)]">
              {recVal}%
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-1.5">
              Caught 89 of 102 true heart-disease cases, minimizing missed diagnoses.
            </p>
          </div>

        </div>

        {/* Two-Column Deep Analytics: ROC Curve (Left 7) + Confusion Matrix (Right 5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          
          {/* LEFT 7 COLS: Authentic ROC Curve */}
          <div className="lg:col-span-7 product-card-glass p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
              <div>
                <h3 className="font-display font-semibold text-base text-[var(--text-main)]">
                  Receiver Operating Characteristic (ROC)
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  True Positive Rate (Sensitivity) vs. False Positive Rate (1 − Specificity)
                </p>
              </div>
              <div className="font-mono text-xs text-[var(--accent-cyan)] font-semibold bg-[var(--accent-cyan-subtle)] px-2.5 py-1 rounded-md border border-[var(--accent-cyan)]/30 self-start sm:self-auto">
                AUC = 0.9269
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={rocData.length > 0 ? rocData : [
                    { fpr: 0.0, tpr: 0.0, baseline: 0.0 },
                    { fpr: 0.037, tpr: 0.471, baseline: 0.037 },
                    { fpr: 0.085, tpr: 0.765, baseline: 0.085 },
                    { fpr: 0.146, tpr: 0.873, baseline: 0.146 },
                    { fpr: 0.244, tpr: 0.961, baseline: 0.244 },
                    { fpr: 0.427, tpr: 0.990, baseline: 0.427 },
                    { fpr: 1.0, tpr: 1.0, baseline: 1.0 }
                  ]}
                  margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="rocCurveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartStroke} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={chartStroke} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  
                  <XAxis
                    dataKey="fpr"
                    stroke={textFill}
                    fontSize={11}
                    tickFormatter={(v) => Number(v).toFixed(2)}
                    label={{ value: 'False Positive Rate (FPR)', position: 'insideBottom', offset: -12, fill: textFill, fontSize: 11 }}
                  />

                  <YAxis
                    dataKey="tpr"
                    stroke={textFill}
                    fontSize={11}
                    domain={[0, 1]}
                    tickFormatter={(v) => Number(v).toFixed(2)}
                    label={{ value: 'True Positive Rate (TPR)', angle: -90, position: 'insideLeft', offset: 15, fill: textFill, fontSize: 11 }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-subtle)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: 'var(--text-main)',
                      fontFamily: 'var(--font-mono)'
                    }}
                    formatter={(val, name) => [Number(val).toFixed(3), name === 'tpr' ? 'TPR (Recall)' : name]}
                  />

                  {/* Random baseline 45 deg line */}
                  <Area
                    type="linear"
                    dataKey="baseline"
                    stroke={textFill}
                    strokeDasharray="4 4"
                    fill="none"
                    strokeWidth={1.5}
                  />

                  {/* K-NN Model ROC Curve */}
                  <Area
                    type="monotone"
                    dataKey="tpr"
                    stroke={chartStroke}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#rocCurveGrad)"
                  />

                  {/* Operating Point Reference Dot */}
                  <ReferenceDot
                    x={0.146}
                    y={0.873}
                    r={5}
                    fill="#FF5267"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5267]" />
                <span>Operating Threshold Point (k=5 majority vote)</span>
              </span>
              <span>184 Test Instances</span>
            </div>
          </div>

          {/* RIGHT 5 COLS: Confusion Matrix */}
          <div className="lg:col-span-5 product-card-glass p-6 sm:p-7 space-y-4">
            <div className="border-b border-[var(--border-subtle)] pb-3">
              <h3 className="font-display font-semibold text-base text-[var(--text-main)]">
                Confusion Matrix
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                184 Holdout Test Patients (82 Healthy, 102 Heart Disease)
              </p>
            </div>

            {/* Matrix 2x2 Grid */}
            <div className="space-y-2 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2">
                
                {/* True Negative */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="p-4 rounded-xl border border-[var(--medical-green)]/40 bg-[var(--medical-green-subtle)] text-[var(--text-main)] space-y-1"
                >
                  <div className="text-[10px] uppercase text-[var(--medical-green)] font-bold">
                    True Negative (TN)
                  </div>
                  <div className="text-2xl font-bold">70</div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    85.4% of actual healthy
                  </div>
                </motion.div>

                {/* False Positive */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-[var(--text-main)] space-y-1"
                >
                  <div className="text-[10px] uppercase text-amber-500 font-bold">
                    False Positive (FP)
                  </div>
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    14.6% false alarms
                  </div>
                </motion.div>

                {/* False Negative */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="p-4 rounded-xl border border-[var(--coral-red)]/40 bg-[var(--coral-red-subtle)] text-[var(--text-main)] space-y-1"
                >
                  <div className="text-[10px] uppercase text-[var(--coral-red)] font-bold">
                    False Negative (FN)
                  </div>
                  <div className="text-2xl font-bold">13</div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    12.7% missed disease
                  </div>
                </motion.div>

                {/* True Positive */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="p-4 rounded-xl border border-[var(--medical-green)]/40 bg-[var(--medical-green-subtle)] text-[var(--text-main)] space-y-1"
                >
                  <div className="text-[10px] uppercase text-[var(--medical-green)] font-bold">
                    True Positive (TP)
                  </div>
                  <div className="text-2xl font-bold">89</div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    87.3% detected cases
                  </div>
                </motion.div>

              </div>
            </div>

            {/* Plain-English Takeaway */}
            <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] space-y-1">
              <div className="font-mono text-[10px] uppercase text-[var(--accent-cyan)] font-semibold">
                Clinical Takeaway:
              </div>
              <p className="leading-relaxed">
                The pipeline successfully caught <span className="font-semibold text-[var(--text-main)]">89 of 102 heart-disease cases</span> (87.3% sensitivity), maintaining a low false-positive count of only 12 across 82 healthy patient records.
              </p>
            </div>
          </div>

        </div>

        {/* Session Records Log with Designed Empty State */}
        <div className="product-card-glass p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[var(--accent-cyan)]" />
              <h3 className="font-display font-semibold text-base text-[var(--text-main)]">
                Session Assessment Records
              </h3>
            </div>
            <span className="font-mono text-xs text-[var(--text-muted)]">
              {sessionCases.length} {sessionCases.length === 1 ? 'Record' : 'Records'} Logged
            </span>
          </div>

          {sessionCases.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)] mx-auto flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                No patient evaluations run in this session yet.
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Complete an assessment above to log real-time classification vectors here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessionCases.map((c, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        c.is_high_risk ? 'bg-[var(--coral-red)]' : 'bg-[var(--medical-green)]'
                      }`}
                    />
                    <span className="font-bold text-[var(--text-main)]">{c.caseId}</span>
                    <span className="text-[var(--text-muted)]">• {c.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={c.is_high_risk ? 'text-[var(--coral-red)] font-semibold' : 'text-[var(--medical-green)] font-semibold'}>
                      {c.risk_level} ({c.risk_percentage}%)
                    </span>
                    <span className="text-[var(--text-muted)]">
                      Age: {c.patient_summary?.age} • BP: {c.patient_summary?.resting_bp} • HR: {c.patient_summary?.max_hr}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
