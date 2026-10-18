import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  Activity,
  Sliders,
  CheckCircle2,
  FileText
} from 'lucide-react';
import PulseFieldCanvas from '../components/PulseFieldCanvas';
import LandingPageMiniDemo from '../components/LandingPageMiniDemo';
import BentoGridCapabilities from '../components/BentoGridCapabilities';
import FAQAccordion from '../components/FAQAccordion';
import { fetchMetrics } from '../api';
import { useCountUp, fadeUpVariant, staggerContainer, pageTransitionVariant } from '../utils/motion';

export default function Home() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const m = await fetchMetrics();
        setMetrics(m);
      } catch {
        setMetrics({ accuracy: 0.8641, roc_auc: 0.9269, precision: 0.8812, recall: 0.8725 });
      }
    }
    loadStats();
  }, []);

  const acc = useCountUp(metrics ? metrics.accuracy * 100 : 86.41, 1000, 2);
  const auc = useCountUp(metrics ? metrics.roc_auc : 0.9269, 1000, 4);
  const prec = useCountUp(metrics ? metrics.precision * 100 : 88.12, 1000, 2);
  const rec = useCountUp(metrics ? metrics.recall * 100 : 87.25, 1000, 2);

  return (
    <motion.div
      variants={pageTransitionVariant}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-[var(--bg-canvas)] text-[var(--text-main)] min-h-screen transition-colors duration-200"
    >
      {/* =========================================================================
          HERO SECTION (Split 12-Column Layout: Left Typography / Right Pulse Field)
          ========================================================================= */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-[var(--border-subtle)] blueprint-grid-canvas overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 -left-20 w-[450px] h-[350px] bg-[var(--accent-cyan)]/6 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 right-0 w-[450px] h-[350px] bg-[var(--coral-red)]/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="site-container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            
            {/* Left 6 Columns: Editorial Typography & Primary CTA */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="lg:col-span-6 space-y-6 max-w-2xl"
            >
              <motion.div
                variants={fadeUpVariant}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface-glass)] border border-[var(--border-glass)] text-xs font-mono text-[var(--accent-cyan)] backdrop-blur-md shadow-xs"
              >
                <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
                <span className="font-semibold uppercase tracking-wider">Clinical Machine Learning</span>
                <span className="text-[var(--text-muted)]">•</span>
                <span className="text-[var(--text-secondary)]">k=5 Nearest Neighbors</span>
              </motion.div>

              <motion.h1
                variants={fadeUpVariant}
                className="text-4xl sm:text-6xl xl:text-7xl font-display font-bold text-[var(--text-main)] tracking-tight leading-[1.04]"
              >
                Every heartbeat <br />
                <span className="bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--medical-green)] bg-clip-text text-transparent">
                  leaves a clue.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUpVariant}
                className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed"
              >
                Compare a patient's 11 clinical indicators against 918 real cardiovascular cases to detect coronary ischemia risk—with full visibility into which 5 patients were most similar and how they voted.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeUpVariant} className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  onClick={() => navigate('/assess')}
                  className="btn-primary text-sm sm:text-base py-3.5 px-8 shadow-md group cursor-pointer"
                >
                  <span>Start assessment</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <a
                  href="#how-it-works"
                  className="btn-secondary text-sm sm:text-base py-3.5 px-6 cursor-pointer"
                >
                  <span>See how it works</span>
                </a>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                variants={fadeUpVariant}
                className="pt-6 border-t border-[var(--border-subtle)] flex items-center gap-6 text-xs font-mono text-[var(--text-muted)]"
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--medical-green)]" />
                  <span>918 UCI Patient Cohort</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent-cyan)]" />
                  <span>100% Explainable K-NN</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right 6 Columns: Pulse Field Visualizer (Replaces Heart) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 w-full"
            >
              <PulseFieldCanvas />
            </motion.div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          LIVE STATS TICKER STRIP (Dedicated Band with Dividers & Padding)
          ========================================================================= */}
      <section className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] py-10 sm:py-12">
        <div className="site-container-wide">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-subtle)]">
            <div className="p-6 sm:px-8 sm:py-4 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-3xl font-bold text-[var(--text-main)]">{acc}%</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--medical-green)]" />
              </div>
              <div className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">Holdout Test Accuracy</div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">159 of 184 test records correctly classified</p>
            </div>

            <div className="p-6 sm:px-8 sm:py-4 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-3xl font-bold text-[var(--accent-cyan)]">{auc}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-cyan)]" />
              </div>
              <div className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">ROC-AUC Area</div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">High discrimination separating disease vs healthy</p>
            </div>

            <div className="p-6 sm:px-8 sm:py-4 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-3xl font-bold text-[var(--text-main)]">{prec}%</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--medical-green)]" />
              </div>
              <div className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">Precision (PPV)</div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">88% positive prediction accuracy</p>
            </div>

            <div className="p-6 sm:px-8 sm:py-4 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-3xl font-bold text-[var(--coral-red)]">{rec}%</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--coral-red)]" />
              </div>
              <div className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">Clinical Sensitivity</div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">Detected 89 of 102 true heart-disease cases</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          "HOW IT WORKS" STORY SECTION (Consistent Left-Aligned Header)
          ========================================================================= */}
      <section id="how-it-works" className="py-16 sm:py-24 lg:py-28 border-b border-[var(--border-subtle)] relative">
        <div className="site-container-wide space-y-12 sm:space-y-16">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-mono uppercase text-[var(--accent-cyan)] font-semibold">
              <span>The Clinical Protocol</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-[var(--text-main)] tracking-tight">
              Three steps to transparent clarity.
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              From raw patient vitals to nearest-neighbor consensus in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1 */}
            <div className="product-card-glass p-7 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-bold text-[var(--text-muted)]">01</span>
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-cyan-subtle)] text-[var(--accent-cyan)] flex items-center justify-center">
                    <Sliders className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-display font-semibold text-xl text-[var(--text-main)]">
                  Enter 11 Indicators
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  Input demographics, resting blood pressure, cholesterol, and Bruce protocol stress ECG markers. Contextual clinical guides explain every normal vs concerning threshold.
                </p>
              </div>

              {/* Mini visual */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-2">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-[var(--text-muted)]">BP Range:</span>
                  <span className="text-[var(--medical-green)] font-semibold">120/80 mmHg Normal</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--border-subtle)] overflow-hidden">
                  <div className="h-full w-2/5 bg-[var(--medical-green)]" />
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="product-card-glass p-7 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-bold text-[var(--text-muted)]">02</span>
                  <div className="w-10 h-10 rounded-xl bg-[var(--medical-green-subtle)] text-[var(--medical-green)] flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-display font-semibold text-xl text-[var(--text-main)]">
                  15D Nearest Neighbors
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  Continuous features are median-imputed and standardized. The query vector projects into 15-dimensional Euclidean space to isolate the 5 closest matched cohort patients.
                </p>
              </div>

              {/* Mini visual */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-2">
                <div className="text-[11px] font-mono text-[var(--text-muted)]">Distance matching:</div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <div key={d} className="flex-1 h-2.5 rounded-full bg-[var(--accent-cyan)]/70 animate-pulse" />
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="product-card-glass p-7 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-bold text-[var(--text-muted)]">03</span>
                  <div className="w-10 h-10 rounded-xl bg-[var(--coral-red-subtle)] text-[var(--coral-red)] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-display font-semibold text-xl text-[var(--text-main)]">
                  Actionable Report
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  Receive a clear verdict, review exactly how the 5 peer neighbors voted, explore what-if lifestyle adjustments, and export a print-ready clinical dossier.
                </p>
              </div>

              {/* Mini visual */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--text-main)] font-semibold">Verdict: Low Risk</span>
                <span className="text-[var(--medical-green)] font-bold">✓ 100% Peer Match</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE MINI-DEMO (Consistent Left-Aligned Header)
          ========================================================================= */}
      <section className="py-16 sm:py-24 lg:py-28 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/30 relative">
        <div className="site-container-wide space-y-10">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-mono uppercase text-[var(--accent-cyan)] font-semibold">
              <span>Interactive Model Verification</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-[var(--text-main)] tracking-tight">
              Experience the Classifier Instantly
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              Select an illustrative clinical scenario below and trigger an immediate test inference against the live machine learning pipeline.
            </p>
          </div>

          <LandingPageMiniDemo />
        </div>
      </section>

      {/* =========================================================================
          BENTO GRID OF CAPABILITIES
          ========================================================================= */}
      <BentoGridCapabilities />

      {/* =========================================================================
          TRUST & INSTITUTIONAL ETHICS BAND
          ========================================================================= */}
      <section className="py-12 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
        <div className="site-container-wide flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-cyan)] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-display font-semibold text-base text-[var(--text-main)]">
                Educational Cardiovascular Research Instrument
              </h4>
              <p className="text-xs text-[var(--text-secondary)] max-w-2xl">
                CardioDetect is an exploratory machine learning demonstration. It does not provide medical diagnoses, treatment decisions, or formal clinical prognosis.
              </p>
            </div>
          </div>

          <Link
            to="/about"
            className="btn-secondary text-xs py-2.5 px-4 shrink-0"
          >
            <span>Read Method & Ethics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* =========================================================================
          FAQ ACCORDION SECTION
          ========================================================================= */}
      <FAQAccordion />

      {/* =========================================================================
          FINAL PRIMARY CALL TO ACTION
          ========================================================================= */}
      <section className="py-16 sm:py-24 lg:py-28 relative blueprint-grid-canvas">
        <div className="site-container-narrow text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-[var(--text-main)] tracking-tight">
            Ready to evaluate a cardiovascular case?
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
            Launch the clinical console, enter the 11 physiological indicators, and inspect your matched patient cohort in real time.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/assess')}
              className="btn-primary text-base py-4 px-10 shadow-xl group cursor-pointer"
            >
              <span>Launch Clinical Console</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
