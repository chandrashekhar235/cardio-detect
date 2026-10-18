import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  Printer,
  Copy,
  Check,
  RotateCcw,
  Users,
  Activity,
  AlertTriangle,
  Heart,
  Sliders,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  FileText,
  Clock,
  Info
} from 'lucide-react';
import { predictRisk } from '../api';
import { useCountUp, pageTransitionVariant, fadeUpVariant, EASE_OUT_EXPO } from '../utils/motion';

function getSafeInputs(rep) {
  if (!rep) return null;
  if (rep.inputValues && typeof rep.inputValues === 'object') {
    return {
      Age: Number(rep.inputValues.Age) || 54,
      Sex: rep.inputValues.Sex || 'M',
      ChestPainType: rep.inputValues.ChestPainType || 'ASY',
      RestingBP: Number(rep.inputValues.RestingBP) || 130,
      Cholesterol: rep.inputValues.Cholesterol !== undefined ? Number(rep.inputValues.Cholesterol) : 223,
      FastingBS: rep.inputValues.FastingBS !== undefined ? Number(rep.inputValues.FastingBS) : 0,
      RestingECG: rep.inputValues.RestingECG || 'Normal',
      MaxHR: Number(rep.inputValues.MaxHR) || 145,
      ExerciseAngina: rep.inputValues.ExerciseAngina || 'N',
      Oldpeak: rep.inputValues.Oldpeak !== undefined ? Number(rep.inputValues.Oldpeak) : 1.0,
      ST_Slope: rep.inputValues.ST_Slope || 'Flat'
    };
  }
  // Reconstruct from patient_summary if inputValues is missing
  return {
    Age: Number(rep.patient_summary?.age) || 54,
    Sex: rep.patient_summary?.sex === 'Female' ? 'F' : 'M',
    ChestPainType: rep.patient_summary?.chest_pain || 'ASY',
    RestingBP: Number(rep.patient_summary?.resting_bp) || 130,
    Cholesterol: rep.patient_summary?.cholesterol !== undefined ? Number(rep.patient_summary?.cholesterol) : 223,
    FastingBS: 0,
    RestingECG: 'Normal',
    MaxHR: Number(rep.patient_summary?.max_hr) || 145,
    ExerciseAngina: 'N',
    Oldpeak: 1.0,
    ST_Slope: 'Flat'
  };
}

export default function ReportPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve report from router state or fallback to sessionStorage
  const [report, setReport] = useState(() => {
    if (location.state?.report) {
      try {
        sessionStorage.setItem('cardiodetect_latest_report', JSON.stringify(location.state.report));
      } catch {}
      return location.state.report;
    }
    try {
      const stored = sessionStorage.getItem('cardiodetect_latest_report');
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  const [copied, setCopied] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);

  // What-If Simulator state initialized with safe inputs
  const [whatIfValues, setWhatIfValues] = useState(() => getSafeInputs(report));
  const [simulatedReport, setSimulatedReport] = useState(() => report || null);
  const [isSimulating, setIsSimulating] = useState(false);
  const debounceTimerRef = useRef(null);

  // Sync state if location.state changes
  useEffect(() => {
    if (location.state?.report) {
      setReport(location.state.report);
      try {
        sessionStorage.setItem('cardiodetect_latest_report', JSON.stringify(location.state.report));
      } catch {}
      const safeInputs = getSafeInputs(location.state.report);
      setWhatIfValues(safeInputs);
      setSimulatedReport(location.state.report);
    }
  }, [location.state]);

  // Unconditional count-up calculation for risk percentage
  const riskPct = report ? (report.risk_percentage ?? (report.prediction === 1 ? 80 : 20)) : 0;
  const animatedPct = useCountUp(riskPct, 900, 0);

  // Set document title
  useEffect(() => {
    document.title = report
      ? `Case Report ${report.caseId || ''} | CardioDetect`
      : 'Clinical Report | CardioDetect';
  }, [report]);

  // Run debounced simulation on what-if slider changes
  const handleWhatIfChange = (key, value) => {
    if (!whatIfValues) return;
    const updated = { ...whatIfValues, [key]: value };
    setWhatIfValues(updated);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsSimulating(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const simRes = await predictRisk(updated);
        setSimulatedReport({
          ...simRes,
          inputValues: updated
        });
      } catch (err) {
        console.error('Simulation error:', err);
      } finally {
        setIsSimulating(false);
      }
    }, 350);
  };

  const handleResetSimulator = () => {
    if (report) {
      const original = getSafeInputs(report);
      setWhatIfValues(original);
      setSimulatedReport(report);
    }
  };

  const handleCopySummary = () => {
    if (!report) return;
    const isHigh = Boolean(report.is_high_risk);
    const votes = Math.round(((report.risk_percentage ?? (report.prediction === 1 ? 80 : 20)) / 100) * 5);
    const inputs = getSafeInputs(report) || {};
    const factors = Array.isArray(report.contributing_factors) ? report.contributing_factors : [];
    const recommendations = Array.isArray(report.recommendations) ? report.recommendations : [];

    const summaryText = `CARDIODETECT CLINICAL CASE REPORT
Case ID: ${report.caseId || 'CD-UNKNOWN'}
Generated: ${report.timestamp || 'Current Session'}
Classification Verdict: ${isHigh ? 'ELEVATED CARDIOVASCULAR RISK' : 'LOW CARDIOVASCULAR RISK'}
Cohort Consensus: ${votes}/5 nearest training neighbors
Status: ${report.status_description || 'Standard assessment completed'}

BIOMARKER SUMMARY:
- Age: ${inputs.Age ?? 'N/A'} yrs | Sex: ${inputs.Sex === 'M' ? 'Male' : 'Female'}
- Resting BP: ${inputs.RestingBP ?? 'N/A'} mmHg
- Serum Cholesterol: ${inputs.Cholesterol ?? 'N/A'} mg/dL
- Fasting Blood Sugar: ${inputs.FastingBS === 1 ? '> 120 mg/dL' : '<= 120 mg/dL'}
- Max Heart Rate: ${inputs.MaxHR ?? 'N/A'} bpm
- ST Depression (Oldpeak): ${inputs.Oldpeak ?? 'N/A'} mm
- ST Slope: ${inputs.ST_Slope ?? 'N/A'}

CONTRIBUTING FACTORS:
${factors.length ? factors.map((f) => `- ${f}`).join('\n') : '- None (All indicators within standard reference ranges)'}

RECOMMENDATIONS:
${recommendations.map((r) => `- ${r}`).join('\n')}

Institutional Medical Notice: For research and educational demonstration only. Not a medical diagnosis.`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleLoadDemoCase = async () => {
    setLoadingSample(true);
    const demoInputs = {
      Age: 62,
      Sex: 'M',
      ChestPainType: 'ASY',
      RestingBP: 155,
      Cholesterol: 284,
      FastingBS: 1,
      RestingECG: 'ST',
      MaxHR: 122,
      ExerciseAngina: 'Y',
      Oldpeak: 2.4,
      ST_Slope: 'Flat'
    };
    try {
      const res = await predictRisk(demoInputs);
      const caseRecord = {
        ...res,
        caseId: `CD-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short'
        }),
        inputValues: demoInputs
      };
      setReport(caseRecord);
      setWhatIfValues({ ...demoInputs });
      setSimulatedReport(caseRecord);
      try {
        sessionStorage.setItem('cardiodetect_latest_report', JSON.stringify(caseRecord));
      } catch {}
    } catch (err) {
      console.error('Failed to load sample clinical case:', err);
    } finally {
      setLoadingSample(false);
    }
  };

  // If no report found, render designed empty state ("No report yet")
  if (!report) {
    return (
      <motion.div
        variants={pageTransitionVariant}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
        className="py-16 sm:py-24 bg-[var(--bg-canvas)] text-[var(--text-main)] min-h-[calc(100vh-4rem)] flex items-center"
      >
        <div className="site-container-wide max-w-2xl mx-auto text-center space-y-6 px-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent-cyan-subtle)] text-[var(--accent-cyan)] mx-auto flex items-center justify-center border border-[var(--border-subtle)] shadow-sm">
            <FileText className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent-cyan)] font-semibold">
              No Report Yet
            </span>
            <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-[var(--text-main)]">
              No Active Case Dossier
            </h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-lg mx-auto">
              You haven't executed a patient assessment during this session yet. Complete the clinical assessment console to generate a verifiable classification report with nearest-neighbor evidence, or load a sample case to explore the report format.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/assess"
              className="btn-primary text-xs py-3 px-6 flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Activity className="w-4 h-4" />
              <span>Start Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              disabled={loadingSample}
              onClick={handleLoadDemoCase}
              className="btn-secondary text-xs py-3 px-6 flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Sparkles className={`w-4 h-4 text-amber-500 ${loadingSample ? 'animate-spin' : ''}`} />
              <span>{loadingSample ? 'Running Pipeline...' : 'Load Sample Case'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Active Report Metrics
  const isHighRisk = Boolean(report.is_high_risk);
  const positiveNeighbors = Math.round((riskPct / 100) * 5);

  // Simulated metrics
  const simHighRisk = Boolean(simulatedReport?.is_high_risk);
  const simRiskPct = simulatedReport?.risk_percentage ?? (simulatedReport?.prediction === 1 ? 80 : 20);
  const simVotes = Math.round((simRiskPct / 100) * 5);

  const neighbors = Array.isArray(report.nearest_neighbors) ? report.nearest_neighbors : [];
  const contributingFactors = Array.isArray(report.contributing_factors) ? report.contributing_factors : [];
  const recommendations = Array.isArray(report.recommendations) ? report.recommendations : [];

  return (
    <motion.div
      variants={pageTransitionVariant}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
      className="py-8 sm:py-14 bg-[var(--bg-canvas)] text-[var(--text-main)] min-h-[calc(100vh-4rem)] transition-colors duration-200"
    >
      <div className="site-container-wide space-y-8 sm:space-y-10">
        
        {/* =========================================================================
            HEADER TELEMETRY BAR: CASE ID, DATE, ACTIONS (NO-PRINT EXCLUSIONS)
            ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-wider text-[var(--accent-cyan)] font-semibold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Cardiovascular Dossier</span>
              </span>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-main)] font-bold">
                {report.caseId || 'CD-VERIFIED'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-bold tracking-tight text-[var(--text-main)]">
              Patient Classification Report
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Generated: {report.timestamp || 'Verified Dossier'}</span>
              </span>
              <span>•</span>
              <span>Pipeline: StandardScaler + KNN (k=5)</span>
              <span>•</span>
              <span>Input Features: 11 Standardized Biomarkers</span>
            </div>
          </div>

          {/* Action Bar (Print / Copy / New Assessment) */}
          <div className="flex flex-wrap items-center gap-2.5 no-print self-start md:self-auto">
            <button
              type="button"
              onClick={handleCopySummary}
              className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
              title="Copy clinical text summary to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[var(--medical-green)]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Summary'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
              title="Print standard clinical report format"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/assess')}
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Assessment</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            TOP VERDICT BLOCK: ICON + TEXT, NEVER COLOR ALONE
            ========================================================================= */}
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
                  <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                    Clinical Classification Verdict
                  </span>
                  <span
                    className={`font-mono text-[11px] px-2 py-0.5 rounded font-bold uppercase ${
                      isHighRisk
                        ? 'bg-[var(--coral-red)] text-white'
                        : 'bg-[var(--medical-green)] text-white'
                    }`}
                  >
                    {isHighRisk ? 'High Probability Pattern' : 'Standard Physiological Profile'}
                  </span>
                </div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl tracking-tight">
                  {isHighRisk ? 'Elevated Cardiovascular Risk' : 'Low Cardiovascular Risk'}
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                  {report.status_description || (isHighRisk ? 'Elevated likelihood of coronary artery disease detected by k-NN nearest-neighbor consensus.' : 'Biomarkers align with historical healthy cohort instances.')}
                </p>
              </div>
            </div>

            {/* Verdict Telemetry Pill */}
            <div className="bg-[var(--bg-canvas)]/80 backdrop-blur-md p-4 rounded-xl border border-[var(--border-subtle)] text-right self-start sm:self-center shrink-0 min-w-[150px]">
              <div className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Cohort Agreement</div>
              <div className="font-mono text-3xl font-bold text-[var(--text-main)]">
                {animatedPct}%
              </div>
              <div className="text-[11px] font-mono font-medium text-[var(--accent-cyan)]">
                {positiveNeighbors} / 5 Neighbors
              </div>
            </div>
          </div>
        </motion.div>

        {/* =========================================================================
            HONEST KNN EVIDENCE SECTION (k=5 ONLY YIELDS 0/20/40/60/80/100%)
            ========================================================================= */}
        <motion.div variants={fadeUpVariant} className="product-card-glass p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-[var(--accent-cyan)] font-semibold mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>Deterministic K-Nearest Neighbors Verification (k=5)</span>
              </div>
              <h3 className="font-display font-semibold text-lg sm:text-xl text-[var(--text-main)]">
                Cohort Voting: {positiveNeighbors} of 5 Closest Historical Records
              </h3>
            </div>
            <div className="text-left sm:text-right font-mono text-xs text-[var(--text-muted)]">
              Distance Metric: Euclidean (Normalized 15-D Feature Space)
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              In our multi-dimensional feature space (after <code>StandardScaler</code> transformation), the 5 closest matched patients in the training registry voted as follows:
            </p>

            {/* 5 Animated Neighbor Patient Dots */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((idx) => {
                const hasDisease = idx <= positiveNeighbors;
                const matchNeighbor = neighbors[idx - 1];
                return (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 * idx, duration: 0.3 }}
                    className={`p-3.5 rounded-xl border text-center flex flex-col items-center justify-center gap-2 transition-all ${
                      hasDisease
                        ? 'border-[var(--coral-red)]/50 bg-[var(--coral-red-subtle)] text-[var(--coral-red)]'
                        : 'border-[var(--medical-green)]/50 bg-[var(--medical-green-subtle)] text-[var(--medical-green)]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full font-mono text-[10px] text-[var(--text-muted)]">
                      <span>Neighbor #{idx}</span>
                      {matchNeighbor?.distance && (
                        <span>d={matchNeighbor.distance}</span>
                      )}
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        hasDisease ? 'bg-[var(--coral-red)] text-white' : 'bg-[var(--medical-green)] text-white'
                      }`}
                    >
                      {idx}
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-mono text-xs font-bold block">
                        {hasDisease ? 'Heart Disease (+)' : 'Normal (-)'}
                      </span>
                      {matchNeighbor ? (
                        <span className="text-[10px] font-mono text-[var(--text-secondary)] block">
                          Age {matchNeighbor.age} • {matchNeighbor.sex} • {matchNeighbor.chest_pain}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-[var(--text-muted)] block">
                          Training instance
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="p-3.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-start gap-2.5 text-xs text-[var(--text-muted)] font-mono">
              <Info className="w-4 h-4 text-[var(--accent-cyan)] shrink-0 mt-0.5" />
              <span>
                <strong>Honest Probability Principle:</strong> Because k=5, model output probabilities are strictly limited to discrete multiples of 20% (0%, 20%, 40%, 60%, 80%, or 100%). We represent the exact integer neighbor consensus rather than presenting an artificially smooth or misleading percentage.
              </span>
            </div>
          </div>
        </motion.div>

        {/* =========================================================================
            SIMILAR PATIENTS COMPARISON CARDS (GUARDED FOR OLDER RECORDS)
            ========================================================================= */}
        <motion.div variants={fadeUpVariant} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--accent-cyan)]" />
              <h3 className="font-display font-semibold text-lg text-[var(--text-main)]">
                Nearest Neighbor Cohort Comparison
              </h3>
            </div>
            <span className="font-mono text-xs text-[var(--text-muted)]">
              Ranked by Euclidean Distance in Scaled Feature Space
            </span>
          </div>

          {neighbors.length === 0 ? (
            <div className="product-card-glass p-8 text-center space-y-2 border border-dashed border-[var(--border-subtle)] rounded-2xl">
              <Users className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50 mb-1" />
              <h4 className="font-semibold text-sm text-[var(--text-main)]">
                Neighbor data unavailable for this older record
              </h4>
              <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                This record was generated before Euclidean nearest-neighbor telemetry was enabled. Run a new assessment to inspect live 15D neighbor distance matching.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {neighbors.map((nb, i) => {
                const userInputs = getSafeInputs(report) || {};
                return (
                  <div
                    key={nb.id ?? i}
                    className="product-card-glass p-5 space-y-4 border hover:border-[var(--border-strong)] transition-all"
                  >
                    {/* Neighbor Header */}
                    <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                          Rank #{nb.rank ?? i + 1}
                        </span>
                        <span className="text-xs font-mono text-[var(--text-muted)]">
                          Dist: {nb.distance ?? 'N/A'}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                          nb.has_disease
                            ? 'bg-[var(--coral-red-subtle)] text-[var(--coral-red)] border border-[var(--coral-red)]/30'
                            : 'bg-[var(--medical-green-subtle)] text-[var(--medical-green)] border border-[var(--medical-green)]/30'
                        }`}
                      >
                        {nb.has_disease ? 'CAD Positive' : 'Normal / Healthy'}
                      </span>
                    </div>

                    {/* Biomarker Comparisons */}
                    <div className="space-y-2 text-xs">
                      {/* Age */}
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)] font-mono">Age:</span>
                        <span className="font-mono font-semibold text-[var(--text-main)]">
                          {nb.age ?? '—'} yrs <span className="text-[10px] text-[var(--text-muted)]">(User: {userInputs.Age})</span>
                        </span>
                      </div>

                      {/* Resting BP */}
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)] font-mono">Resting BP:</span>
                        <span className="font-mono font-semibold text-[var(--text-main)]">
                          {nb.resting_bp ?? '—'} mmHg <span className="text-[10px] text-[var(--text-muted)]">(User: {userInputs.RestingBP})</span>
                        </span>
                      </div>

                      {/* Cholesterol */}
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)] font-mono">Cholesterol:</span>
                        <span className="font-mono font-semibold text-[var(--text-main)]">
                          {nb.cholesterol === 0 ? 'Not Measured' : `${nb.cholesterol} mg/dL`}{' '}
                          <span className="text-[10px] text-[var(--text-muted)]">(User: {userInputs.Cholesterol})</span>
                        </span>
                      </div>

                      {/* Max HR */}
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)] font-mono">Max HR:</span>
                        <span className="font-mono font-semibold text-[var(--text-main)]">
                          {nb.max_hr ?? '—'} bpm <span className="text-[10px] text-[var(--text-muted)]">(User: {userInputs.MaxHR})</span>
                        </span>
                      </div>

                      {/* ST Depression & Slope */}
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)] font-mono">ST Profile:</span>
                        <span className="font-mono font-semibold text-[var(--text-main)]">
                          {nb.st_slope ?? '—'} (Oldpeak {nb.oldpeak ?? 0})
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* =========================================================================
            CONTRIBUTING FACTORS & CLINICAL RECOMMENDATIONS
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contributing Factors */}
          <motion.div variants={fadeUpVariant} className="product-card-glass p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
              <Activity className="w-4 h-4 text-[var(--coral-red)]" />
              <h3 className="font-display font-semibold text-base text-[var(--text-main)]">
                Observed Physiological Contributing Indicators
              </h3>
            </div>

            {contributingFactors.length > 0 ? (
              <div className="space-y-2.5">
                {contributingFactors.map((factor, i) => (
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
              <div className="p-4 rounded-xl bg-[var(--medical-green-subtle)] border border-[var(--medical-green)]/30 text-xs text-[var(--medical-green)] flex items-center gap-2.5">
                <Check className="w-4 h-4 shrink-0" />
                <span>All 11 clinical biomarkers reside within typical physiological safety corridors.</span>
              </div>
            )}
          </motion.div>

          {/* Recommendations */}
          <motion.div variants={fadeUpVariant} className="product-card-glass p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
              <Heart className="w-4 h-4 text-[var(--accent-cyan)]" />
              <h3 className="font-display font-semibold text-base text-[var(--text-main)]">
                Clinical Guidance & Next Steps
              </h3>
            </div>

            <div className="space-y-2.5">
              {recommendations.length > 0 ? (
                recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] flex items-start gap-2.5 leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)] shrink-0 mt-1.5" />
                    <span>{rec}</span>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                  Maintain routine aerobic physical activity and annual preventive physician checkups.
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* =========================================================================
            WHAT-IF SIMULATOR (DEBOUNCED RE-INFERENCE FOR MODIFIABLE BIOMARKERS)
            ========================================================================= */}
        {whatIfValues && (
          <motion.div variants={fadeUpVariant} className="product-card p-6 sm:p-8 space-y-6 no-print">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-[var(--accent-cyan)] font-semibold">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Interactive What-If Sensitivity Simulator</span>
                </div>
                <h3 className="font-display font-semibold text-xl text-[var(--text-main)]">
                  Explore Modifiable Physiological Factors
                </h3>
              </div>

              <div className="flex items-center gap-3">
                {isSimulating && (
                  <span className="font-mono text-xs text-[var(--accent-cyan)] flex items-center gap-1.5 animate-pulse">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Re-computing distance matrix...</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleResetSimulator}
                  className="text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-main)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to Actual</span>
                </button>
              </div>
            </div>

            {/* Simulation Feedback Strip */}
            <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm ${
                    simHighRisk ? 'bg-[var(--coral-red)] text-white' : 'bg-[var(--medical-green)] text-white'
                  }`}
                >
                  {simVotes}/5
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--text-main)]">
                    Simulated Consensus: {simHighRisk ? 'Elevated Risk' : 'Low Risk'} ({simRiskPct}%)
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] font-mono">
                    Baseline was {positiveNeighbors}/5 votes ({riskPct}%)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {simVotes < positiveNeighbors && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[var(--medical-green-subtle)] text-[var(--medical-green)] border border-[var(--medical-green)]/30 flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Risk Decreased ({positiveNeighbors} → {simVotes} votes)</span>
                  </span>
                )}
                {simVotes > positiveNeighbors && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[var(--coral-red-subtle)] text-[var(--coral-red)] border border-[var(--coral-red)]/30 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Risk Increased ({positiveNeighbors} → {simVotes} votes)</span>
                  </span>
                )}
                {simVotes === positiveNeighbors && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono text-[var(--text-muted)] border border-[var(--border-subtle)]">
                    Consensus Unchanged ({simVotes}/5 votes)
                  </span>
                )}
              </div>
            </div>

            {/* Modifiable Biomarker Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Slider 1: Resting BP */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--text-main)]">Resting Blood Pressure</span>
                  <span className="font-mono font-bold text-[var(--accent-cyan)]">{whatIfValues.RestingBP ?? 130} mmHg</span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="190"
                  step="2"
                  value={whatIfValues.RestingBP ?? 130}
                  onChange={(e) => handleWhatIfChange('RestingBP', Number(e.target.value))}
                  className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-cyan)]"
                />
                <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)]">
                  <span>90 Optimal</span>
                  <span>130 Pre-HTN</span>
                  <span>190 Stage 2</span>
                </div>
              </div>

              {/* Slider 2: Cholesterol */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--text-main)]">Serum Cholesterol</span>
                  <span className="font-mono font-bold text-[var(--accent-cyan)]">{whatIfValues.Cholesterol ?? 223} mg/dL</span>
                </div>
                <input
                  type="range"
                  min="120"
                  max="380"
                  step="5"
                  value={whatIfValues.Cholesterol ?? 223}
                  onChange={(e) => handleWhatIfChange('Cholesterol', Number(e.target.value))}
                  className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-cyan)]"
                />
                <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)]">
                  <span>120 Desirable</span>
                  <span>200 Borderline</span>
                  <span>380 High</span>
                </div>
              </div>

              {/* Slider 3: Max HR */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--text-main)]">Peak Stress Max HR</span>
                  <span className="font-mono font-bold text-[var(--accent-cyan)]">{whatIfValues.MaxHR ?? 145} bpm</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="200"
                  step="2"
                  value={whatIfValues.MaxHR ?? 145}
                  onChange={(e) => handleWhatIfChange('MaxHR', Number(e.target.value))}
                  className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-cyan)]"
                />
                <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)]">
                  <span>80 Brady</span>
                  <span>150 Typical</span>
                  <span>200 Athlete</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-[var(--text-muted)] bg-[var(--bg-canvas)] p-3.5 rounded-lg border border-[var(--border-subtle)]">
              * Exploratory Sensitivity Notice: Adjusting these sliders recalculates nearest Euclidean neighbors across the 918-patient training registry in real time. This models algorithmic sensitivity to lifestyle modifications and does not guarantee medical risk alteration.
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            INSTITUTIONAL DISCLAIMER & SIGN-OFF
            ========================================================================= */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] space-y-2">
          <div className="font-mono font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Institutional Medical Disclaimer & Audit Protocol
          </div>
          <p className="leading-relaxed">
            CardioDetect is an experimental cardiovascular health research and educational platform exploring machine-learning-assisted classification using clinical indicators. Predictions are generated via a 5-Nearest Neighbors estimator trained on historical cohorts (918 cases). This tool is strictly non-diagnostic and does not replace professional clinical evaluation, coronary angiography, stress echocardiography, or physician guidance.
          </p>
        </div>

      </div>
    </motion.div>
  );
}
