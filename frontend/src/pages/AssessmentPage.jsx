import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  RefreshCw,
  Clock,
  CheckSquare
} from 'lucide-react';
import { CLINICAL_FEATURES } from '../data/clinicalFeatures';
import ClinicalInputField from '../components/ClinicalInputField';
import PatientMonitorPanel from '../components/PatientMonitorPanel';
import { predictRisk } from '../api';
import { pageTransitionVariant } from '../utils/motion';

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
  { id: 1, name: 'Intake', subtitle: 'Demographics & Cohort Baseline', est: '20s' },
  { id: 2, name: 'Vitals & Chemistry', subtitle: 'Resting Blood Pressure & Lipids', est: '30s' },
  { id: 3, name: 'Cardiac & Exercise', subtitle: 'Bruce Treadmill Stress & ECG', est: '45s' },
  { id: 4, name: 'Case Review', subtitle: 'Verification Dossier & Inference', est: '15s' },
];

export default function AssessmentPage({ onCaseLogged }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formValues, setFormValues] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [activePreset, setActivePreset] = useState(null);
  
  // Consent gate state
  const [consentAcknowledged, setConsentAcknowledged] = useState(() => {
    try {
      return sessionStorage.getItem('cardiodetect_consent') === 'true';
    } catch {
      return false;
    }
  });

  // Pipeline submission
  const [loading, setLoading] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('');
  const [submitError, setSubmitError] = useState(null);
  const [caseId] = useState(() => `CD-${Math.floor(1000 + Math.random() * 9000)}`);
  const [timestamp] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  const handleConsent = () => {
    setConsentAcknowledged(true);
    try {
      sessionStorage.setItem('cardiodetect_consent', 'true');
    } catch {}
  };

  const handleFieldChange = (field, val) => {
    setFormValues((prev) => ({ ...prev, [field]: val }));
    setActivePreset(null);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

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
        newErrors.Cholesterol = 'Enter total cholesterol between 80 and 650 mg/dL (or select "I don’t know").';
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
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleLoadPreset = (type) => {
    setActivePreset(type);
    if (type === 'healthy') {
      setFormValues({
        Age: 32,
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
      });
    } else if (type === 'moderate') {
      setFormValues({
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
      });
    } else if (type === 'acute') {
      setFormValues({
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
      });
    }
    setErrors({});
    setSubmitError(null);
  };

  const handleReset = () => {
    setFormValues(DEFAULT_FORM);
    setErrors({});
    setSubmitError(null);
    setActivePreset(null);
    setCurrentStep(1);
  };

  const handleExecuteAnalysis = async () => {
    setLoading(true);
    setSubmitError(null);

    setLoadingStepText('Scaling 11 features with StandardScaler...');
    const t1 = setTimeout(() => {
      setLoadingStepText('Locating 5 most similar cohort patients in 15D space...');
    }, 450);
    const t2 = setTimeout(() => {
      setLoadingStepText('Counting nearest-neighbor consensus votes...');
    }, 950);

    try {
      const response = await predictRisk(formValues);
      clearTimeout(t1);
      clearTimeout(t2);

      setTimeout(() => {
        const caseRecord = {
          ...response,
          caseId,
          timestamp,
          inputValues: { ...formValues }
        };

        if (onCaseLogged) {
          onCaseLogged(caseRecord);
        }

        try {
          sessionStorage.setItem('cardiodetect_latest_report', JSON.stringify(caseRecord));
        } catch {}

        setLoading(false);
        navigate('/report', { state: { report: caseRecord } });
      }, 1400);
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      setLoading(false);
      setSubmitError(err.message || 'Analysis engine unreachable. Please check backend connection.');
    }
  };

  // Percentage complete
  const completenessPct = Math.round((currentStep / STEPS.length) * 100);

  return (
    <motion.div
      variants={pageTransitionVariant}
      initial="initial"
      animate="animate"
      exit="exit"
      className="py-8 sm:py-12 bg-[var(--bg-canvas)] min-h-[calc(100vh-4rem)]"
    >
      <div className="site-container-wide">
        
        {/* Serious Consent/Acknowledgment Modal Gate */}
        {!consentAcknowledged && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div className="max-w-lg w-full p-6 sm:p-8 rounded-3xl product-card-glass shadow-2xl space-y-5 border-t-4 border-t-[var(--coral-red)]">
              <div className="w-12 h-12 rounded-2xl bg-[var(--coral-red-subtle)] text-[var(--coral-red)] flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <span className="font-mono text-xs uppercase tracking-wider text-[var(--coral-red)] font-semibold">
                  Institutional Scope & Ethical Notice
                </span>
                <h2 className="font-display font-bold text-2xl text-[var(--text-main)]">
                  Clinical Console Acknowledgment
                </h2>
              </div>

              <div className="text-xs sm:text-sm text-[var(--text-secondary)] space-y-2.5 leading-relaxed">
                <p>
                  CardioDetect is an educational machine learning platform built on the UCI Heart Disease Dataset (918 cases). It is designed to illustrate statistical nearest-neighbor classification and feature attribution.
                </p>
                <p className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-main)] font-mono">
                  * It does NOT provide a clinical diagnosis, replace a 12-lead ECG interpreted by a cardiologist, or establish treatment protocols.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleConsent}
                  className="btn-primary w-full py-3.5 text-sm font-semibold justify-center cursor-pointer"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>I Understand & Acknowledge (Enter Console)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-cyan-subtle)] text-[var(--accent-cyan)] text-xs font-mono uppercase tracking-wider mb-2">
              <Activity className="w-3.5 h-3.5" />
              <span>Diagnostic Console • Session {caseId}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-bold text-[var(--text-main)] tracking-tight">
              Cardiovascular Assessment Instrument
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Authoritative 11-indicator intake. Calibrated against 734 training cases.
            </p>
          </div>

          {/* Preset Chips Toolbar */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase mr-1 hidden sm:inline">Presets:</span>
            <button
              type="button"
              onClick={() => handleLoadPreset('healthy')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                activePreset === 'healthy'
                  ? 'bg-[var(--medical-green)] text-white'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
              }`}
            >
              Healthy
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset('moderate')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                activePreset === 'moderate'
                  ? 'bg-amber-600 text-white'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
              }`}
            >
              Moderate
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset('acute')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                activePreset === 'acute'
                  ? 'bg-[var(--coral-red)] text-white'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
              }`}
            >
              Acute Ischemia
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs px-2.5 py-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-elevated)] flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Stepper Header Bar with Progress & Est Time */}
        <div className="mb-8 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-[var(--text-secondary)] gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--text-main)]">Phase {currentStep} of {STEPS.length}:</span>
              <span>{STEPS[currentStep - 1].name}</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Est: {STEPS[currentStep - 1].est}</span>
              </span>
              <span>•</span>
              <span>{completenessPct}% Complete</span>
            </div>
          </div>

          {/* Stepper Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {STEPS.map((s) => {
              const isPast = currentStep > s.id;
              const isCurrent = currentStep === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (s.id < currentStep || validateCurrentStep()) {
                      setCurrentStep(s.id);
                    }
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isCurrent
                      ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan-subtle)] text-[var(--text-main)] shadow-xs'
                      : isPast
                      ? 'border-[var(--medical-green)]/40 bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold">0{s.id}</span>
                    {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--medical-green)]" />}
                  </div>
                  <div className="text-xs font-semibold">{s.name}</div>
                  <div className="text-[10px] text-[var(--text-muted)] truncate">{s.subtitle}</div>
                </button>
              );
            })}
          </div>

          <div className="h-1 w-full bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--accent-cyan)] via-[var(--medical-green)] to-[var(--coral-red)] transition-all duration-300"
              style={{ width: `${completenessPct}%` }}
            />
          </div>
        </div>

        {/* =========================================================================
            SPLIT LAYOUT: LEFT ~60% GUIDED FORM | RIGHT ~40% STICKY PATIENT MONITOR
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 7 COLS (~60% width): Guided Form Steps */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Intake (Age, Sex) */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="border-b border-[var(--border-subtle)] pb-2.5">
                  <h3 className="font-display font-semibold text-lg text-[var(--text-main)]">
                    Phase 01 — Demographic Intake
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Non-modifiable clinical parameters influencing arterial elasticity and disease morphology.
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

            {/* Step 2: Vitals & Chemistry */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="border-b border-[var(--border-subtle)] pb-2.5">
                  <h3 className="font-display font-semibold text-lg text-[var(--text-main)]">
                    Phase 02 — Resting Vitals & Laboratory Chemistry
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Physiological resting markers reflecting vascular pressure, lipid accumulation, and glucose homeostasis.
                  </p>
                </div>

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
              </motion.div>
            )}

            {/* Step 3: Cardiac & Exercise Markers */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="border-b border-[var(--border-subtle)] pb-2.5">
                  <h3 className="font-display font-semibold text-lg text-[var(--text-main)]">
                    Phase 03 — Cardiac Symptoms & Exercise Stress Testing
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Bruce treadmill protocol indicators detecting demand ischemia when cardiac oxygen workload peaks.
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
                  feature={CLINICAL_FEATURES.RestingECG}
                  value={formValues.RestingECG}
                  onChange={(v) => handleFieldChange('RestingECG', v)}
                  error={errors.RestingECG}
                  patientAge={formValues.Age}
                />

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

            {/* Step 4: Review & Run Case File Table */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="border-b border-[var(--border-subtle)] pb-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold text-lg text-[var(--text-main)]">
                      Phase 04 — Case File Dossier
                    </h3>
                    <span className="font-mono text-xs text-[var(--accent-cyan)] font-semibold">
                      ID: {caseId} • {timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Audit the 11 standardized clinical indicators before query vector projection.
                  </p>
                </div>

                {/* Case File Table */}
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden text-xs font-mono">
                  <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y divide-[var(--border-subtle)]">
                    <div className="p-3">
                      <span className="text-[10px] text-[var(--text-muted)] uppercase block">Age / Sex</span>
                      <span className="font-bold text-[var(--text-main)]">{formValues.Age} yrs • {formValues.Sex}</span>
                    </div>
                    <div className="p-3">
                      <span className="text-[10px] text-[var(--text-muted)] uppercase block">Resting BP</span>
                      <span className="font-bold text-[var(--text-main)]">{formValues.RestingBP} mmHg</span>
                    </div>
                    <div className="p-3">
                      <span className="text-[10px] text-[var(--text-muted)] uppercase block">Cholesterol</span>
                      <span className="font-bold text-[var(--text-main)]">
                        {formValues.Cholesterol === 0 ? 'Median Imputed (223 mg/dL)' : `${formValues.Cholesterol} mg/dL`}
                      </span>
                    </div>
                    <div className="p-3">
                      <span className="text-[10px] text-[var(--text-muted)] uppercase block">Fasting Glucose</span>
                      <span className="font-bold text-[var(--text-main)]">
                        {formValues.FastingBS === 1 ? 'Elevated (>120 mg/dL)' : 'Normal (≤120 mg/dL)'}
                      </span>
                    </div>
                    <div className="p-3">
                      <span className="text-[10px] text-[var(--text-muted)] uppercase block">Chest Pain</span>
                      <span className="font-bold text-[var(--text-main)]">{formValues.ChestPainType}</span>
                    </div>
                    <div className="p-3">
                      <span className="text-[10px] text-[var(--text-muted)] uppercase block">Resting ECG</span>
                      <span className="font-bold text-[var(--text-main)]">{formValues.RestingECG}</span>
                    </div>
                    <div className="p-3">
                      <span className="text-[10px] text-[var(--text-muted)] uppercase block">Max Heart Rate</span>
                      <span className="font-bold text-[var(--text-main)]">{formValues.MaxHR} BPM</span>
                    </div>
                    <div className="p-3">
                      <span className="text-[10px] text-[var(--text-muted)] uppercase block">Exertional Angina</span>
                      <span className="font-bold text-[var(--text-main)]">{formValues.ExerciseAngina === 'Y' ? 'Provoked (Yes)' : 'None (No)'}</span>
                    </div>
                    <div className="p-3">
                      <span className="text-[10px] text-[var(--text-muted)] uppercase block">ST Depression</span>
                      <span className="font-bold text-[var(--text-main)]">{formValues.Oldpeak} mm ({formValues.ST_Slope})</span>
                    </div>
                  </div>
                </div>

                {/* Error Banner */}
                {submitError && (
                  <div className="p-4 rounded-xl bg-[var(--coral-red-subtle)] border border-[var(--coral-red)]/30 text-[var(--coral-red)] text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleExecuteAnalysis}
                      className="px-2.5 py-1 rounded bg-[var(--coral-red)] text-white font-mono text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retry Analysis</span>
                    </button>
                  </div>
                )}

                {/* Primary Execute CTA */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleExecuteAnalysis}
                  className="btn-primary w-full py-4 text-base font-semibold shadow-lg shadow-[var(--coral-red-subtle)] flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Activity className="w-5 h-5" />
                  <span>{loading ? 'Evaluating K-NN Pipeline...' : 'Run Clinical Classification Analysis'}</span>
                </button>
              </motion.div>
            )}

            {/* Stepper Navigation Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous Step</span>
                </button>
              ) : <div />}

              {currentStep < 4 && (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn-primary text-xs py-2.5 px-5 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Run Sequence: Full-Panel Animated Analysis Sequence */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="product-card-glass p-8 text-center space-y-5"
              >
                <div className="w-12 h-12 rounded-2xl bg-[var(--coral-red-subtle)] text-[var(--coral-red)] mx-auto flex items-center justify-center shadow-sm">
                  <Activity className="w-6 h-6 animate-pulse" />
                </div>

                {/* Scanning Trace */}
                <div className="w-full h-8 flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 300 32" className="w-64 h-8 stroke-current fill-none text-[var(--coral-red)]">
                    <line x1="0" y1="16" x2="300" y2="16" stroke="var(--border-subtle)" strokeWidth="1" />
                    <path
                      d="M 0,16 L 70,16 L 90,16 L 100,8 L 110,24 L 120,16 L 135,16 L 142,4 L 152,28 L 160,12 L 168,18 L 176,16 L 200,16 L 215,12 L 230,16 L 300,16"
                      className="ecg-animated-line"
                      strokeWidth="2"
                    />
                  </svg>
                </div>

                <div className="space-y-1">
                  <h4 className="font-display font-semibold text-base text-[var(--text-main)]">
                    Executing K-Nearest Neighbors Pipeline
                  </h4>
                  <p className="text-xs font-mono text-[var(--accent-cyan)]">
                    {loadingStepText}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Persistent low-key disclaimer */}
            <div className="text-[11px] font-mono text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-3">
              Institutional notice: For educational study only. Does not constitute a clinical diagnosis.
            </div>

          </div>

          {/* RIGHT 5 COLS (~40% width): Signature Sticky Patient Monitor Panel */}
          <div className="lg:col-span-5">
            <PatientMonitorPanel formValues={formValues} />
          </div>

        </div>

      </div>
    </motion.div>
  );
}
