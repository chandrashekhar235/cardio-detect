import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
  Legend,
  Cell
} from 'recharts';
import {
  BarChart3,
  Database,
  FileText,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { fetchMetrics, fetchRocCurve, fetchDatasetStats } from '../api';
import { useTheme } from '../context/ThemeContext';
import { useCountUp, pageTransitionVariant } from '../utils/motion';

export default function InsightsPage({ sessionCases = [] }) {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState(null);
  const [rocData, setRocData] = useState([]);
  const [datasetStats, setDatasetStats] = useState(null);
  const [activeTab, setActiveTab] = useState('distributions'); // 'distributions', 'scatter', 'categorical', 'correlation'

  useEffect(() => {
    document.title = 'Model & Dataset Insights | CardioDetect';

    async function loadData() {
      try {
        const [m, r, d] = await Promise.all([
          fetchMetrics(),
          fetchRocCurve(),
          fetchDatasetStats()
        ]);
        setMetrics(m);
        setRocData(r.points || []);
        setDatasetStats(d);
      } catch (err) {
        console.warn('Using cached metrics fallback:', err);
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
  const accVal = useCountUp(metrics ? metrics.accuracy * 100 : 86.41, 1100, 2);
  const aucVal = useCountUp(metrics ? metrics.roc_auc : 0.9269, 1100, 4);
  const precVal = useCountUp(metrics ? metrics.precision * 100 : 88.12, 1100, 2);
  const recVal = useCountUp(metrics ? metrics.recall * 100 : 87.25, 1100, 2);

  const chartStroke = theme === 'dark' ? '#45D9E8' : '#007D8F';
  const gridStroke = theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)';
  const textFill = theme === 'dark' ? '#94A3B8' : '#64748B';

  const handleOpenRecord = (record) => {
    navigate('/report', { state: { report: record } });
  };

  return (
    <motion.div
      variants={pageTransitionVariant}
      initial="initial"
      animate="animate"
      exit="exit"
      className="py-8 sm:py-14 bg-[var(--bg-canvas)] text-[var(--text-main)] min-h-[calc(100vh-4rem)] transition-colors duration-200"
    >
      <div className="site-container-wide space-y-12">
        
        {/* =========================================================================
            SECTION HEADER & INTRO
            ========================================================================= */}
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-cyan-subtle)] text-[var(--accent-cyan)] text-xs font-mono uppercase tracking-wider font-semibold">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Empirical Model Rigor & Registry Analytics</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-bold text-[var(--text-main)] tracking-tight">
            Statistical Validation & Dataset Insights
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            Transparent validation metrics computed from a stratified 80/20 holdout test cohort (184 unseen patients) alongside comprehensive multi-variate statistical distributions from the complete 918-patient clinical registry.
          </p>
        </div>

        {/* =========================================================================
            4 CORE METRIC CARDS WITH COUNT-UP & PLAIN-ENGLISH MEANINGS
            ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Accuracy */}
          <div className="product-card-glass p-5 sm:p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)] font-mono uppercase font-semibold">Overall Accuracy</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--medical-green)]" />
            </div>
            <div className="font-mono font-bold text-3xl sm:text-4xl text-[var(--text-main)]">
              {accVal}%
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-2">
              Correctly categorized 159 of the 184 holdout validation patients.
            </p>
          </div>

          {/* ROC-AUC */}
          <div className="product-card-glass p-5 sm:p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)] font-mono uppercase font-semibold">ROC-AUC Area</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-cyan)]" />
            </div>
            <div className="font-mono font-bold text-3xl sm:text-4xl text-[var(--accent-cyan)]">
              {aucVal}
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-2">
              Exceptional discriminative separation between healthy and ischemic profiles.
            </p>
          </div>

          {/* Precision */}
          <div className="product-card-glass p-5 sm:p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)] font-mono uppercase font-semibold">Precision (PPV)</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--medical-green)]" />
            </div>
            <div className="font-mono font-bold text-3xl sm:text-4xl text-[var(--text-main)]">
              {precVal}%
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-2">
              When flagging positive disease risk, the algorithm is accurate 88.1% of the time.
            </p>
          </div>

          {/* Recall / Sensitivity */}
          <div className="product-card-glass p-5 sm:p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)] font-mono uppercase font-semibold">Recall / Sensitivity</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--coral-red)]" />
            </div>
            <div className="font-mono font-bold text-3xl sm:text-4xl text-[var(--coral-red)]">
              {recVal}%
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-2">
              Successfully identified 89 of 102 true ischemic patients, minimizing false negatives.
            </p>
          </div>

        </div>

        {/* =========================================================================
            ROC CURVE (LEFT 7) + 2x2 CONFUSION MATRIX (RIGHT 5)
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 7 COLS: Authentic ROC Curve */}
          <div className="lg:col-span-7 product-card-glass p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
              <div>
                <h2 className="font-display font-semibold text-lg text-[var(--text-main)]">
                  Receiver Operating Characteristic (ROC)
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  True Positive Rate (Sensitivity) vs. False Positive Rate (1 − Specificity)
                </p>
              </div>
              <div className="font-mono text-xs text-[var(--accent-cyan)] font-bold bg-[var(--accent-cyan-subtle)] px-3 py-1 rounded-md border border-[var(--accent-cyan)]/30 self-start sm:self-auto">
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

                  {/* Random guess diagonal baseline */}
                  <Area
                    type="linear"
                    dataKey="baseline"
                    stroke={textFill}
                    strokeDasharray="4 4"
                    fill="none"
                    strokeWidth={1.5}
                  />

                  {/* Model ROC Curve */}
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

            <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-2">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5267]" />
                <span>Operating Threshold Point (k=5 majority vote)</span>
              </span>
              <span>184 Holdout Instances</span>
            </div>
          </div>

          {/* RIGHT 5 COLS: Sequential Fill Confusion Matrix */}
          <div className="lg:col-span-5 product-card-glass p-6 sm:p-8 space-y-4">
            <div className="border-b border-[var(--border-subtle)] pb-3">
              <h2 className="font-display font-semibold text-lg text-[var(--text-main)]">
                Confusion Matrix
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                184 Holdout Test Patients (82 Healthy, 102 Heart Disease)
              </p>
            </div>

            {/* Matrix 2x2 Grid with Sequential Animation */}
            <div className="space-y-2 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                
                {/* True Negative (70) */}
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
                  <div className="text-3xl font-bold">70</div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    85.4% of actual healthy
                  </div>
                </motion.div>

                {/* False Positive (12) */}
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
                  <div className="text-3xl font-bold">12</div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    14.6% false alerts
                  </div>
                </motion.div>

                {/* False Negative (13) */}
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
                  <div className="text-3xl font-bold">13</div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    12.7% missed disease
                  </div>
                </motion.div>

                {/* True Positive (89) */}
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
                  <div className="text-3xl font-bold">89</div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    87.3% detected disease
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
                The pipeline successfully identified <span className="font-semibold text-[var(--text-main)]">89 of 102 heart-disease cases</span> (87.3% sensitivity), maintaining a low false-positive count of only 12 across 82 healthy records.
              </p>
            </div>
          </div>

        </div>

        {/* =========================================================================
            DATASET EXPLORER (FROM REAL DATA VIA /api/dataset-stats)
            ========================================================================= */}
        <div className="product-card-glass p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-[var(--accent-cyan)] font-semibold">
                <Database className="w-3.5 h-3.5" />
                <span>Empirical Training Registry Explorer</span>
              </div>
              <h2 className="font-display font-semibold text-xl text-[var(--text-main)]">
                Cohort Demographics & Biomarker Distributions
              </h2>
            </div>

            {/* Segmented Control to Switch Feature Perspectives */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] self-start md:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('distributions')}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'distributions'
                    ? 'bg-[var(--accent-cyan)] text-black font-semibold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                }`}
              >
                Distributions
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('scatter')}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'scatter'
                    ? 'bg-[var(--accent-cyan)] text-black font-semibold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                }`}
              >
                Age vs MaxHR Scatter
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('categorical')}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'categorical'
                    ? 'bg-[var(--accent-cyan)] text-black font-semibold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                }`}
              >
                Categorical Signs
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('correlation')}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'correlation'
                    ? 'bg-[var(--accent-cyan)] text-black font-semibold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                }`}
              >
                Correlation Heatmap
              </button>
            </div>
          </div>

          {/* TAB 1: DISTRIBUTIONS (AGE & MAX HR BINNED BY OUTCOME) */}
          {activeTab === 'distributions' && (
            <motion.div
              key="tab-distributions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Class Balance Summary Strip */}
              {datasetStats?.class_balance && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-1">
                    <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase">Total Cohort Records</span>
                    <div className="text-2xl font-bold font-mono text-[var(--text-main)]">
                      {datasetStats.total_records} Cases
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] block">From Cleveland, Hungarian, Swiss & Long Beach registries</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--medical-green-subtle)] border border-[var(--medical-green)]/30 space-y-1">
                    <span className="text-[11px] font-mono text-[var(--medical-green)] uppercase font-semibold">Normal / Healthy</span>
                    <div className="text-2xl font-bold font-mono text-[var(--text-main)]">
                      {datasetStats.class_balance.healthy} ({datasetStats.class_balance.healthy_pct}%)
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] block">Negative for coronary angiographic stenosis</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--coral-red-subtle)] border border-[var(--coral-red)]/30 space-y-1">
                    <span className="text-[11px] font-mono text-[var(--coral-red)] uppercase font-semibold">Heart Disease Positive</span>
                    <div className="text-2xl font-bold font-mono text-[var(--text-main)]">
                      {datasetStats.class_balance.heart_disease} ({datasetStats.class_balance.heart_disease_pct}%)
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] block">&gt; 50% diameter narrowing in &gt;= 1 coronary vessel</span>
                  </div>
                </div>
              )}

              {/* Age & MaxHR Side-by-Side Distribution Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Age Distribution */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--text-main)]">Age Distribution Binned by Outcome</span>
                    <span className="font-mono text-[var(--text-muted)]">Healthy vs Disease</span>
                  </div>
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={datasetStats?.age_distribution || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                        <XAxis dataKey="range" stroke={textFill} fontSize={10} />
                        <YAxis stroke={textFill} fontSize={10} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--bg-surface)',
                            borderColor: 'var(--border-subtle)',
                            borderRadius: '8px',
                            fontSize: '11px'
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Bar dataKey="healthy" name="Healthy" fill="#48D597" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="heart_disease" name="Heart Disease" fill="#FF5267" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Max HR Distribution */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--text-main)]">Peak Max Heart Rate (MaxHR) by Outcome</span>
                    <span className="font-mono text-[var(--text-muted)]">Exercise Stress Reserve</span>
                  </div>
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={datasetStats?.max_hr_distribution || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                        <XAxis dataKey="range" stroke={textFill} fontSize={10} />
                        <YAxis stroke={textFill} fontSize={10} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--bg-surface)',
                            borderColor: 'var(--border-subtle)',
                            borderRadius: '8px',
                            fontSize: '11px'
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Bar dataKey="healthy" name="Healthy" fill="#48D597" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="heart_disease" name="Heart Disease" fill="#FF5267" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: SCATTER PLOT (AGE VS MAX HR COLORED BY OUTCOME) */}
          {activeTab === 'scatter' && (
            <motion.div
              key="tab-scatter"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[var(--text-secondary)] gap-2">
                <span>
                  120 representative cohort patients plotting patient age against peak exercise heart rate (MaxHR).
                </span>
                <div className="flex items-center gap-4 font-mono text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#48D597]" />
                    <span>Healthy (CAD -)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5267]" />
                    <span>Heart Disease (CAD +)</span>
                  </span>
                </div>
              </div>

              <div className="h-72 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis
                      type="number"
                      dataKey="age"
                      name="Age"
                      unit=" yrs"
                      domain={[25, 80]}
                      stroke={textFill}
                      fontSize={11}
                      label={{ value: 'Patient Age (years)', position: 'insideBottom', offset: -12, fill: textFill, fontSize: 11 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="max_hr"
                      name="MaxHR"
                      unit=" bpm"
                      domain={[60, 210]}
                      stroke={textFill}
                      fontSize={11}
                      label={{ value: 'Peak Heart Rate (MaxHR)', angle: -90, position: 'insideLeft', offset: 15, fill: textFill, fontSize: 11 }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-mono space-y-1 shadow-lg">
                            <div className="font-bold text-[var(--text-main)]">
                              Age: {data.age} yrs • MaxHR: {data.max_hr} bpm
                            </div>
                            <div className={data.label === 1 ? 'text-[var(--coral-red)] font-semibold' : 'text-[var(--medical-green)] font-semibold'}>
                              Outcome: {data.label === 1 ? 'Heart Disease (+)' : 'Healthy (-)'}
                            </div>
                            <div className="text-[10px] text-[var(--text-muted)]">
                              BP: {data.resting_bp} mmHg • Chol: {data.cholesterol} mg/dL • CP: {data.chest_pain}
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Scatter
                      name="Cohort Patients"
                      data={datasetStats?.scatter_sample || []}
                    >
                      {(datasetStats?.scatter_sample || []).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.label === 1 ? '#FF5267' : '#48D597'}
                          fillOpacity={0.8}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <p className="text-[11px] font-mono text-[var(--text-muted)]">
                Key Trend: Healthy patients consistently sustain higher peak heart rates (&gt;150 bpm) even at older ages, whereas ischemic cases manifest chronotropic incompetence (inability to attain age-predicted peak heart rate).
              </p>
            </motion.div>
          )}

          {/* TAB 3: CATEGORICAL BREAKDOWNS (CHEST PAIN TYPE & ST SLOPE) */}
          {activeTab === 'categorical' && (
            <motion.div
              key="tab-categorical"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Chest Pain Type */}
              <div className="space-y-3">
                <div className="border-b border-[var(--border-subtle)] pb-2">
                  <h3 className="font-semibold text-sm text-[var(--text-main)]">
                    Chest Pain Subtype Breakdown
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    ASY (Asymptomatic), NAP (Non-Anginal), ATA (Atypical), TA (Typical)
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  {datasetStats?.chest_pain_breakdown?.map((item) => {
                    const total = item.healthy + item.heart_disease;
                    const cadPct = Math.round((item.heart_disease / total) * 100);
                    return (
                      <div key={item.category} className="space-y-1 text-xs">
                        <div className="flex justify-between font-mono">
                          <span className="font-bold text-[var(--text-main)]">{item.category}</span>
                          <span className={cadPct > 50 ? 'text-[var(--coral-red)] font-semibold' : 'text-[var(--medical-green)] font-semibold'}>
                            {cadPct}% CAD Positive ({item.heart_disease}/{total})
                          </span>
                        </div>
                        <div className="h-2 w-full bg-[var(--bg-elevated)] rounded-full overflow-hidden flex">
                          <div
                            className="bg-[var(--medical-green)] h-full"
                            style={{ width: `${100 - cadPct}%` }}
                            title={`Healthy: ${item.healthy}`}
                          />
                          <div
                            className="bg-[var(--coral-red)] h-full"
                            style={{ width: `${cadPct}%` }}
                            title={`Heart Disease: ${item.heart_disease}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ST Slope Breakdown */}
              <div className="space-y-3">
                <div className="border-b border-[var(--border-subtle)] pb-2">
                  <h3 className="font-semibold text-sm text-[var(--text-main)]">
                    Exercise ST Segment Slope Breakdown
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Up (Upsloping: Healthy indicator), Flat (Ischemia), Down (Severe Ischemia)
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  {datasetStats?.st_slope_breakdown?.map((item) => {
                    const total = item.healthy + item.heart_disease;
                    const cadPct = Math.round((item.heart_disease / total) * 100);
                    return (
                      <div key={item.category} className="space-y-1 text-xs">
                        <div className="flex justify-between font-mono">
                          <span className="font-bold text-[var(--text-main)]">{item.category}sloping</span>
                          <span className={cadPct > 50 ? 'text-[var(--coral-red)] font-semibold' : 'text-[var(--medical-green)] font-semibold'}>
                            {cadPct}% CAD Positive ({item.heart_disease}/{total})
                          </span>
                        </div>
                        <div className="h-2 w-full bg-[var(--bg-elevated)] rounded-full overflow-hidden flex">
                          <div
                            className="bg-[var(--medical-green)] h-full"
                            style={{ width: `${100 - cadPct}%` }}
                          />
                          <div
                            className="bg-[var(--coral-red)] h-full"
                            style={{ width: `${cadPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: CORRELATION MATRIX HEATMAP */}
          {activeTab === 'correlation' && (
            <motion.div
              key="tab-correlation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 overflow-x-auto"
            >
              <p className="text-xs text-[var(--text-secondary)]">
                Pearson correlation coefficients across continuous physiological markers. Strongest positive correlation with heart disease: <strong>Oldpeak (+0.40)</strong>. Strongest protective inverse correlation: <strong>MaxHR (-0.40)</strong>.
              </p>

              {datasetStats?.correlation_matrix ? (
                <div className="min-w-[600px] border border-[var(--border-subtle)] rounded-xl overflow-hidden font-mono text-xs">
                  <table className="w-full text-center border-collapse">
                    <thead>
                      <tr className="bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)]">
                        <th className="p-3 text-left font-semibold text-[var(--text-muted)]">Feature</th>
                        {datasetStats.correlation_matrix.columns.map((col) => (
                          <th key={col} className="p-3 font-semibold text-[var(--text-main)]">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {datasetStats.correlation_matrix.columns.map((rowName, rIdx) => (
                        <tr key={rowName} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]/50">
                          <td className="p-3 text-left font-bold text-[var(--text-main)] bg-[var(--bg-elevated)]/30">
                            {rowName}
                          </td>
                          {datasetStats.correlation_matrix.values[rIdx].map((val, cIdx) => {
                            const isPositive = val > 0;
                            const absVal = Math.abs(val);
                            return (
                              <td
                                key={cIdx}
                                className="p-3 transition-colors"
                                style={{
                                  backgroundColor: val === 1
                                    ? 'transparent'
                                    : isPositive
                                    ? `rgba(255, 82, 103, ${Math.min(0.65, absVal * 1.2)})`
                                    : `rgba(69, 217, 232, ${Math.min(0.65, absVal * 1.2)})`,
                                  color: absVal > 0.3 ? '#FFFFFF' : 'var(--text-main)'
                                }}
                              >
                                {val.toFixed(2)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-xs font-mono text-[var(--text-muted)]">
                  Loading empirical correlation matrix...
                </div>
              )}
            </motion.div>
          )}

        </div>

        {/* =========================================================================
            SESSION RECORDS LOG WITH DESIGNED EMPTY STATE
            ========================================================================= */}
        <div className="product-card-glass p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--accent-cyan)]" />
              <h2 className="font-display font-semibold text-lg text-[var(--text-main)]">
                Session Assessment History Log
              </h2>
            </div>
            <span className="font-mono text-xs text-[var(--text-muted)]">
              {sessionCases.length} {sessionCases.length === 1 ? 'Record' : 'Records'} Generated
            </span>
          </div>

          {sessionCases.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--bg-elevated)] text-[var(--text-muted)] mx-auto flex items-center justify-center border border-[var(--border-subtle)]">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-semibold text-base text-[var(--text-main)]">
                  No Patient Assessments in Current Session
                </h4>
                <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                  Run an assessment via the clinical console to record real-time classification vectors and nearest neighbors here.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/assess')}
                className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 cursor-pointer mt-2"
              >
                <span>Launch New Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <p className="text-xs text-[var(--text-muted)]">
                Click any record to reopen its complete interactive clinical dossier and sensitivity simulator.
              </p>
              {sessionCases.map((c, i) => (
                <div
                  key={c.caseId || i}
                  onClick={() => handleOpenRecord(c)}
                  className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent-cyan)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-3 h-3 rounded-full shrink-0 ${
                        c.is_high_risk ? 'bg-[var(--coral-red)]' : 'bg-[var(--medical-green)]'
                      }`}
                    />
                    <div>
                      <div className="font-bold text-[var(--text-main)] group-hover:text-[var(--accent-cyan)] transition-colors flex items-center gap-2">
                        <span>{c.caseId}</span>
                        <span className="text-[10px] font-normal text-[var(--text-muted)]">• {c.timestamp}</span>
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)]">
                        Age: {c.inputValues?.Age || c.patient_summary?.age} • BP: {c.inputValues?.RestingBP || c.patient_summary?.resting_bp} mmHg • MaxHR: {c.inputValues?.MaxHR || c.patient_summary?.max_hr} bpm
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span
                      className={`px-2.5 py-1 rounded font-bold uppercase text-[11px] ${
                        c.is_high_risk
                          ? 'bg-[var(--coral-red-subtle)] text-[var(--coral-red)] border border-[var(--coral-red)]/30'
                          : 'bg-[var(--medical-green-subtle)] text-[var(--medical-green)] border border-[var(--medical-green)]/30'
                      }`}
                    >
                      {c.is_high_risk ? 'Elevated Risk' : 'Low Risk'} ({c.risk_percentage}%)
                    </span>
                    <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-cyan)] transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
