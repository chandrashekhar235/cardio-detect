import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Layers,
  RefreshCw
} from 'lucide-react';
import { CLINICAL_FEATURES } from '../data/clinicalFeatures';
import ClinicalInputField from './ClinicalInputField';
import CompactHeartWidget from './CompactHeartWidget';
import CaseReport from './CaseReport';
import { predictRisk } from '../api';
import { fadeUpVariant, staggerContainer, EASE_OUT_EXPO } from '../utils/motion';

const DEFAULT_FORM = {
  Age: 54,
  Sex: 'M',
  ChestPainType: 'ASY',
  RestingBP: 130,
  Cholesterol: 240,
  FastingBS: 0,
  RestingECG: 'Normal',
  MaxHR: 145,
  ExerciseAngina: 'N',
  Oldpeak: 1.0,
  ST_Slope: 'Flat'
};

const STEPS = [
  { id: 1, name: 'Patient Profile', fields: ['Age', 'Sex'] },
  { id: 2, name: 'Resting Vitals & Chemistry', fields: ['RestingBP', 'Cholesterol', 'FastingBS', 'RestingECG'] },
  { id: 3, name: 'Exercise Stress Markers', fields: ['MaxHR', 'ExerciseAngina', 'Oldpeak', 'ST_Slope'] },
  { id: 4, name: 'Review & Run Pipeline', fields: [] },
];

export default function AssessmentSection({ onCaseLogged }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formValues, setFormValues] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [activePreset, setActivePreset] = useState(null);
  
  // Pipeline submission states
  const [loading, setLoading] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('');
  const [report, setReport] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Mobile bottom-sheet drawer state
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Field change handler
  const handleFieldChange = (field, val) => {
    setFormValues((prev) => ({ ...prev, [field]: val }));
    setActivePreset(null);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Validation
  const validateCurrentStep = () => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formValues.Age || formValues.Age < 18 || formValues.Age > 100) {
        newErrors.Age = 'Enter an age between 18 and 100.';
      }
    } else if (currentStep === 2) {
      if (!formValues.RestingBP || formValues.RestingBP < 60 || formValues.RestingBP > 240) {
        newErrors.RestingBP = 'Resting BP must be between 60 and 240 mmHg.';
      }
      if (formValues.Cholesterol !== 0 && (formValues.Cholesterol < 80 || formValues.Cholesterol > 650)) {
        newErrors.Cholesterol = 'Cholesterol must be between 80 and 650 mg/dL (or select "I don’t know").';
      }
    } else if (currentStep === 3) {
      if (!formValues.MaxHR || formValues.MaxHR < 50 || formValues.MaxHR > 230) {
        newErrors.MaxHR = 'Maximum heart rate must be between 50 and 230 BPM.';
      }
      if (formValues.Oldpeak < 0 || formValues.Oldpeak > 8) {
        newErrors.Oldpeak = 'ST depression must be between 0.0 and 8.0 mm.';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(STEPS.length, prev + 1));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // Preset Handlers
  const handleLoadPreset = (type) => {
    setActivePreset(type);
    if (type === 'healthy') {
      setFormValues({
        Age: 32,
        Sex: 'F',
        ChestPainType: 'ATA',
        RestingBP: 112,
        Cholesterol: 175,
        FastingBS: 0,
        RestingECG: 'Normal',
        MaxHR: 176,
        ExerciseAngina: 'N',
        Oldpeak: 0.0,
        ST_Slope: 'Up'
      });
    } else if (type === 'moderate') {
      setFormValues({
        Age: 52,
        Sex: 'M',
        ChestPainType: 'NAP',
        RestingBP: 136,
        Cholesterol: 238,
        FastingBS: 0,
        RestingECG: 'Normal',
        MaxHR: 142,
        ExerciseAngina: 'N',
        Oldpeak: 1.2,
        ST_Slope: 'Flat'
      });
    } else if (type === 'acute') {
      setFormValues({
        Age: 64,
        Sex: 'M',
        ChestPainType: 'ASY',
        RestingBP: 158,
        Cholesterol: 286,
        FastingBS: 1,
        RestingECG: 'ST',
        MaxHR: 114,
        ExerciseAngina: 'Y',
        Oldpeak: 2.6,
        ST_Slope: 'Flat'
      });
    }
    setErrors({});
    setSubmitError(null);
  };

  const handleReset = () => {
    setFormValues(DEFAULT_FORM);
    setErrors({});
    setReport(null);
    setSubmitError(null);
    setActivePreset(null);
    setCurrentStep(1);
  };

  // Pipeline Execution Submit
  const handleExecutePipeline = async () => {
    setLoading(true);
    setSubmitError(null);
    setReport(null);

    setLoadingStepText('Standardizing 11 clinical features with StandardScaler...');
    const t1 = setTimeout(() => {
      setLoadingStepText('Projecting vector into 15D Euclidean feature space...');
    }, 400);
    const t2 = setTimeout(() => {
      setLoadingStepText('Isolating 5 most similar cohort patients...');
    }, 850);
    const t3 = setTimeout(() => {
      setLoadingStepText('Synthesizing nearest-neighbor majority consensus...');
    }, 1300);

    try {
      const response = await predictRisk(formValues);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);

      setTimeout(() => {
        const caseRecord = {
          ...response,
          caseId: `CD-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          inputValues: { ...formValues }
        };
        setReport(caseRecord);
        if (onCaseLogged) {
          onCaseLogged(caseRecord);
        }
        setLoading(false);

        // Smooth scroll to report
        setTimeout(() => {
          const el = document.getElementById('case-report');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }, 1500);
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setLoading(false);
      setSubmitError(err.message || 'API connection failed. Please ensure the backend is running.');
    }
  };

  return (
    <section id="assessment" className="py-20 sm:py-28 border-b border-[var(--border-subtle)] relative">
      <div className="site-container">
        
        {/* Section Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mb-10 space-y-3"
        >
          <motion.div
            variants={fadeUpVariant}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--coral-red-subtle)] text-[var(--coral-red)] text-xs font-mono uppercase tracking-wider"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Interactive Assessment Protocol</span>
          </motion.div>

          <motion.h2
            variants={fadeUpVariant}
            className="text-3xl sm:text-4xl font-display font-bold text-[var(--text-main)] tracking-tight"
          >
            Cardiovascular Assessment
          </motion.h2>

          <motion.p variants={fadeUpVariant} className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            Follow the guided four-phase clinical entry. Each indicator features contextual guidelines, laboratory reference ranges, and real-time visualization of its physiological impact.
          </motion.p>
        </motion.div>

        {/* Preset Chips Toolbar */}
        <div className="mb-8 p-3 sm:p-4 rounded-xl product-card-glass flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-main)]">
            <Sparkles className="w-4 h-4 text-[var(--accent-cyan)]" />
            <span className="font-mono uppercase text-[11px] text-[var(--text-muted)]">Preset Scenarios:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleLoadPreset('healthy')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                activePreset === 'healthy'
                  ? 'bg-[var(--medical-green)] text-white shadow-xs'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
              }`}
            >
              Healthy Baseline
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset('moderate')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                activePreset === 'moderate'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
              }`}
            >
              Moderate Risk
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset('acute')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                activePreset === 'acute'
                  ? 'bg-[var(--coral-red)] text-white shadow-xs'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
              }`}
            >
              Acute Ischemia
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs px-2.5 py-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-elevated)] flex items-center gap-1 border border-transparent"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Guided Step Navigation Progress Bar */}
        <div className="mb-8">
          <div className="grid grid-cols-4 gap-2 mb-3">
            {STEPS.map((step) => {
              const isPast = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    if (step.id < currentStep || validateCurrentStep()) {
                      setCurrentStep(step.id);
                    }
                  }}
                  className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan-subtle)] text-[var(--text-main)] shadow-xs'
                      : isPast
                      ? 'border-[var(--medical-green)]/40 bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold">
                      0{step.id}
                    </span>
                    {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--medical-green)]" />}
                  </div>
                  <div className="text-xs font-semibold truncate hidden sm:block">
                    {step.name}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Continuous progress track */}
          <div className="h-1 w-full bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[var(--accent-cyan)] via-[var(--medical-green)] to-[var(--coral-red)]"
              animate={{ width: `${(currentStep / STEPS.length) * 100}%` }}
              transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
            />
          </div>
        </div>

        {/* Two-Column Layout: Form Workspace (Left 7) + Live Case Summary (Right 5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 7 COLS: Current Step Inputs or Review */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Patient Profile */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="border-b border-[var(--border-subtle)] pb-2">
                  <h3 className="font-display font-semibold text-lg text-[var(--text-main)]">
                    Phase 01 — Patient Profile
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Demographic indicators influencing baseline vascular elasticity and coronary caliber.
                  </p>
                </div>

                <ClinicalInputField
                  feature={CLINICAL_FEATURES.Age}
                  value={formValues.Age}
                  onChange={(v) => handleFieldChange('Age', v)}
                  error={errors.Age}
                  patientAge={formValues.Age}
                />

                <ClinicalInputField
                  feature={CLINICAL_FEATURES.Sex}
                  value={formValues.Sex}
                  onChange={(v) => handleFieldChange('Sex', v)}
                  error={errors.Sex}
                  patientAge={formValues.Age}
                />
              </motion.div>
            )}

            {/* Step 2: Resting Vitals & Chemistry */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="border-b border-[var(--border-subtle)] pb-2">
                  <h3 className="font-display font-semibold text-lg text-[var(--text-main)]">
                    Phase 02 — Resting Vitals & Laboratory Chemistry
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Biomarkers measured in a resting, non-exertional clinical state.
                  </p>
                </div>

                <ClinicalInputField
                  feature={CLINICAL_FEATURES.ChestPainType}
                  value={formValues.ChestPainType}
                  onChange={(v) => handleFieldChange('ChestPainType', v)}
                  error={errors.ChestPainType}
                  patientAge={formValues.Age}
                />

                <ClinicalInputField
                  feature={CLINICAL_FEATURES.RestingBP}
                  value={formValues.RestingBP}
                  onChange={(v) => handleFieldChange('RestingBP', v)}
                  error={errors.RestingBP}
                  patientAge={formValues.Age}
                />

                <ClinicalInputField
                  feature={CLINICAL_FEATURES.Cholesterol}
                  value={formValues.Cholesterol}
                  onChange={(v) => handleFieldChange('Cholesterol', v)}
                  error={errors.Cholesterol}
                  patientAge={formValues.Age}
                />

                <ClinicalInputField
                  feature={CLINICAL_FEATURES.FastingBS}
                  value={formValues.FastingBS}
                  onChange={(v) => handleFieldChange('FastingBS', v)}
                  error={errors.FastingBS}
                  patientAge={formValues.Age}
                />

                <ClinicalInputField
                  feature={CLINICAL_FEATURES.RestingECG}
                  value={formValues.RestingECG}
                  onChange={(v) => handleFieldChange('RestingECG', v)}
                  error={errors.RestingECG}
                  patientAge={formValues.Age}
                />
              </motion.div>
            )}

            {/* Step 3: Exercise Stress Markers */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="border-b border-[var(--border-subtle)] pb-2">
                  <h3 className="font-display font-semibold text-lg text-[var(--text-main)]">
                    Phase 03 — Exercise Stress Testing Markers
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Treadmill Bruce-protocol markers evaluating cardiac oxygen supply under maximum exertion workload.
                  </p>
                </div>

                <ClinicalInputField
                  feature={CLINICAL_FEATURES.MaxHR}
                  value={formValues.MaxHR}
                  onChange={(v) => handleFieldChange('MaxHR', v)}
                  error={errors.MaxHR}
                  patientAge={formValues.Age}
                />

                <ClinicalInputField
                  feature={CLINICAL_FEATURES.ExerciseAngina}
                  value={formValues.ExerciseAngina}
                  onChange={(v) => handleFieldChange('ExerciseAngina', v)}
                  error={errors.ExerciseAngina}
                  patientAge={formValues.Age}
                />

                <ClinicalInputField
                  feature={CLINICAL_FEATURES.Oldpeak}
                  value={formValues.Oldpeak}
                  onChange={(v) => handleFieldChange('Oldpeak', v)}
                  error={errors.Oldpeak}
                  patientAge={formValues.Age}
                />

                <ClinicalInputField
                  feature={CLINICAL_FEATURES.ST_Slope}
                  value={formValues.ST_Slope}
                  onChange={(v) => handleFieldChange('ST_Slope', v)}
                  error={errors.ST_Slope}
                  patientAge={formValues.Age}
                />
              </motion.div>
            )}

            {/* Step 4: Review & Run Pipeline */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="border-b border-[var(--border-subtle)] pb-2">
                  <h3 className="font-display font-semibold text-lg text-[var(--text-main)]">
                    Phase 04 — Case Review & Pipeline Execution
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Confirm all 11 standardized clinical indicators before projecting into the KNN feature space.
                  </p>
                </div>

                {/* Summary Grid of All 11 Features */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="product-card p-3 space-y-1">
                    <span className="font-mono text-[10px] uppercase text-[var(--text-muted)]">Age & Sex</span>
                    <div className="font-mono font-semibold text-sm">{formValues.Age} yrs • {formValues.Sex === 'M' ? 'Male' : 'Female'}</div>
                  </div>
                  <div className="product-card p-3 space-y-1">
                    <span className="font-mono text-[10px] uppercase text-[var(--text-muted)]">Resting BP</span>
                    <div className="font-mono font-semibold text-sm">{formValues.RestingBP} mmHg</div>
                  </div>
                  <div className="product-card p-3 space-y-1">
                    <span className="font-mono text-[10px] uppercase text-[var(--text-muted)]">Cholesterol</span>
                    <div className="font-mono font-semibold text-sm">
                      {formValues.Cholesterol === 0 ? 'Median Imputed' : `${formValues.Cholesterol} mg/dL`}
                    </div>
                  </div>
                  <div className="product-card p-3 space-y-1">
                    <span className="font-mono text-[10px] uppercase text-[var(--text-muted)]">Fasting Glucose</span>
                    <div className="font-mono font-semibold text-sm">
                      {formValues.FastingBS === 1 ? '> 120 mg/dL' : '≤ 120 mg/dL'}
                    </div>
                  </div>
                  <div className="product-card p-3 space-y-1">
                    <span className="font-mono text-[10px] uppercase text-[var(--text-muted)]">Chest Pain Pattern</span>
                    <div className="font-mono font-semibold text-sm">{formValues.ChestPainType}</div>
                  </div>
                  <div className="product-card p-3 space-y-1">
                    <span className="font-mono text-[10px] uppercase text-[var(--text-muted)]">Resting ECG</span>
                    <div className="font-mono font-semibold text-sm">{formValues.RestingECG}</div>
                  </div>
                  <div className="product-card p-3 space-y-1">
                    <span className="font-mono text-[10px] uppercase text-[var(--text-muted)]">Peak Heart Rate</span>
                    <div className="font-mono font-semibold text-sm">{formValues.MaxHR} BPM</div>
                  </div>
                  <div className="product-card p-3 space-y-1">
                    <span className="font-mono text-[10px] uppercase text-[var(--text-muted)]">Exercise Angina</span>
                    <div className="font-mono font-semibold text-sm">{formValues.ExerciseAngina === 'Y' ? 'Provoked' : 'No Angina'}</div>
                  </div>
                  <div className="product-card p-3 space-y-1">
                    <span className="font-mono text-[10px] uppercase text-[var(--text-muted)]">ST Depression</span>
                    <div className="font-mono font-semibold text-sm">{formValues.Oldpeak} mm ({formValues.ST_Slope})</div>
                  </div>
                </div>

                {/* Submit Error Banner */}
                {submitError && (
                  <div className="p-4 rounded-xl bg-[var(--coral-red-subtle)] border border-[var(--coral-red)]/30 text-[var(--coral-red)] text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleExecutePipeline}
                      className="px-2.5 py-1 rounded bg-[var(--coral-red)] text-white font-mono text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retry</span>
                    </button>
                  </div>
                )}

                {/* Primary Execute CTA */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleExecutePipeline}
                  className="btn-primary w-full py-4 text-base font-semibold shadow-lg shadow-[var(--coral-red-subtle)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Activity className="w-5 h-5" />
                  <span>{loading ? 'Evaluating Nearest Neighbors...' : 'Execute Case Classification'}</span>
                </button>
              </motion.div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous Phase</span>
                </button>
              ) : <div />}

              {currentStep < 4 && (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn-primary text-xs py-2.5 px-5 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Next Phase</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Multi-stage Animated Loading Sequence */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="product-card-glass p-8 text-center space-y-5"
              >
                <div className="w-12 h-12 rounded-2xl bg-[var(--coral-red-subtle)] text-[var(--coral-red)] mx-auto flex items-center justify-center shadow-sm">
                  <Activity className="w-6 h-6 animate-pulse" />
                </div>

                {/* Animated ECG Heartbeat Trace */}
                <div className="w-full h-10 flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 300 40" className="w-64 h-10 stroke-current fill-none text-[var(--coral-red)]">
                    <line x1="0" y1="20" x2="300" y2="20" stroke="var(--border-subtle)" strokeWidth="1" />
                    <path
                      d="M 0,20 L 70,20 L 90,20 L 100,10 L 110,30 L 120,20 L 135,20 L 142,4 L 152,36 L 160,14 L 168,22 L 176,20 L 200,20 L 215,16 L 230,20 L 300,20"
                      className="ecg-animated-line"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div className="space-y-1">
                  <h4 className="font-display font-semibold text-base text-[var(--text-main)]">
                    Evaluating Scikit-Learn Pipeline
                  </h4>
                  <p className="text-xs font-mono text-[var(--accent-cyan)]">
                    {loadingStepText}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Generated Case Report Display */}
            {report && !loading && (
              <CaseReport
                report={report}
                onReset={handleReset}
              />
            )}
          </div>

          {/* RIGHT 5 COLS: Desktop Live Case Summary & Heart Waveform Panel */}
          <div className="hidden lg:block lg:col-span-5 sticky top-24 space-y-4">
            {/* Live Compact Heart Waveform Widget */}
            <CompactHeartWidget
              restingBP={formValues.RestingBP}
              maxHR={formValues.MaxHR}
              oldpeak={formValues.Oldpeak}
            />

            {/* Live Case Telemetry Card */}
            <div className="product-card-glass p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
                <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
                  <span>Live Case Vector</span>
                </span>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  Step {currentStep} of 4
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]/50">
                  <span className="text-[var(--text-secondary)]">Age / Sex</span>
                  <span className="font-semibold text-[var(--text-main)]">{formValues.Age}y • {formValues.Sex}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]/50">
                  <span className="text-[var(--text-secondary)]">Resting BP</span>
                  <span className="font-semibold text-[var(--text-main)]">{formValues.RestingBP} mmHg</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]/50">
                  <span className="text-[var(--text-secondary)]">Cholesterol</span>
                  <span className="font-semibold text-[var(--text-main)]">
                    {formValues.Cholesterol === 0 ? 'Imputed (Median)' : `${formValues.Cholesterol} mg/dL`}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]/50">
                  <span className="text-[var(--text-secondary)]">Fasting Glucose</span>
                  <span className="font-semibold text-[var(--text-main)]">
                    {formValues.FastingBS === 1 ? '> 120 mg/dL' : '≤ 120 mg/dL'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]/50">
                  <span className="text-[var(--text-secondary)]">Chest Pain Pattern</span>
                  <span className="font-semibold text-[var(--text-main)]">{formValues.ChestPainType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]/50">
                  <span className="text-[var(--text-secondary)]">Peak Stress HR</span>
                  <span className="font-semibold text-[var(--text-main)]">{formValues.MaxHR} BPM</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[var(--text-secondary)]">ST Segment Depression</span>
                  <span className="font-semibold text-[var(--text-main)]">{formValues.Oldpeak} mm ({formValues.ST_Slope})</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[var(--bg-elevated)] text-[11px] text-[var(--text-muted)] space-y-1">
                <span className="font-semibold text-[var(--text-secondary)] block">K-Nearest Neighbors Mechanism:</span>
                <p>
                  These 11 indicators will be converted into 15 normalized dimensions to calculate Euclidean distance across 734 training cases.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Floating Bottom Sheet Drawer */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--bg-surface-glass)] backdrop-blur-xl border-t border-[var(--border-glass)] p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
              <span className="text-[var(--text-secondary)]">Vitals:</span>
              <span className="font-semibold text-[var(--text-main)]">
                {formValues.RestingBP} mmHg • {formValues.MaxHR} BPM • {formValues.Oldpeak}mm
              </span>
            </div>

            <button
              type="button"
              onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
              className="text-xs font-mono text-[var(--accent-cyan)] flex items-center gap-1 p-1"
            >
              <span>{mobileSummaryOpen ? 'Hide' : 'Review'}</span>
              {mobileSummaryOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>

          <AnimatePresence>
            {mobileSummaryOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-[var(--border-subtle)] space-y-2 text-xs font-mono"
              >
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>Age/Sex: {formValues.Age}y / {formValues.Sex}</div>
                  <div>BP: {formValues.RestingBP} mmHg</div>
                  <div>Chol: {formValues.Cholesterol || 'Median'} mg/dL</div>
                  <div>Glucose: {formValues.FastingBS === 1 ? '>120' : '≤120'}</div>
                  <div>ECG: {formValues.RestingECG}</div>
                  <div>ST: {formValues.Oldpeak}mm ({formValues.ST_Slope})</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
