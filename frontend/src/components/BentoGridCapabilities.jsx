import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Sliders,
  Cpu,
  Printer,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fadeUpVariant, staggerContainer } from '../utils/motion';

export default function BentoGridCapabilities() {
  return (
    <section className="py-20 sm:py-28 border-b border-[var(--border-subtle)] relative">
      <div className="site-container-wide">
        
        {/* Section Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mb-16 space-y-3"
        >
          <motion.div
            variants={fadeUpVariant}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-mono uppercase text-[var(--text-muted)]"
          >
            <span>Platform Capabilities</span>
          </motion.div>

          <motion.h2
            variants={fadeUpVariant}
            className="text-3xl sm:text-5xl font-display font-bold text-[var(--text-main)] tracking-tight"
          >
            Engineered for clinical explainability.
          </motion.h2>

          <motion.p variants={fadeUpVariant} className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            CardioDetect rejects opaque black-box deep learning in favor of transparent, patient-relatable local coordinate clustering.
          </motion.p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Tile 1: Explainable Neighbors (Large 7 cols) */}
          <div className="md:col-span-7 product-card-glass p-7 sm:p-8 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase text-[var(--accent-cyan)] font-semibold">
                  01 • Transparency
                </span>
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-cyan-subtle)] text-[var(--accent-cyan)] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <h3 className="font-display font-bold text-2xl text-[var(--text-main)]">
                Explainable Nearest Neighbors
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl">
                Instead of an unexplainable probability output, every case prediction is proven by isolating the 5 most anatomically similar patients in historical registries. Inspect their identical vitals and understand why the model decided.
              </p>
            </div>

            {/* Visual Micro-graphic */}
            <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((d) => (
                  <span
                    key={d}
                    className={`w-3.5 h-3.5 rounded-full transition-transform group-hover:scale-110 ${
                      d <= 4 ? 'bg-[var(--coral-red)] shadow-xs' : 'bg-[var(--medical-green)] shadow-xs'
                    }`}
                  />
                ))}
              </div>
              <span className="font-mono text-xs text-[var(--text-muted)]">4 of 5 Peer Agreement</span>
            </div>
          </div>

          {/* Tile 2: What-If Counterfactual Simulator (5 cols) */}
          <div className="md:col-span-5 product-card-glass p-7 sm:p-8 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase text-[var(--medical-green)] font-semibold">
                  02 • Interactive Exploration
                </span>
                <div className="w-10 h-10 rounded-xl bg-[var(--medical-green-subtle)] text-[var(--medical-green)] flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
              </div>
              <h3 className="font-display font-bold text-2xl text-[var(--text-main)]">
                What-If Simulator
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Adjust blood pressure, serum cholesterol, or peak heart rate sliders to witness how lifestyle interventions change neighbor clustering in real time.
              </p>
            </div>

            <Link
              to="/report"
              className="text-xs font-mono text-[var(--medical-green)] hover:underline flex items-center gap-1.5"
            >
              <span>Explore Simulator on Case Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Tile 3: 6-Stage Pipeline Rigor (5 cols) */}
          <div className="md:col-span-5 product-card-glass p-7 sm:p-8 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase text-[var(--accent-cyan)] font-semibold">
                  03 • Pipeline Architecture
                </span>
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-cyan-subtle)] text-[var(--accent-cyan)] flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
              </div>
              <h3 className="font-display font-bold text-2xl text-[var(--text-main)]">
                End-to-End Scikit-Learn Pipeline
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Median imputation for zero-value baselines, zero-mean StandardScaler normalization, and orthogonal One-Hot Encoding for all 11 indicators.
              </p>
            </div>

            <Link
              to="/science"
              className="text-xs font-mono text-[var(--accent-cyan)] hover:underline flex items-center gap-1.5"
            >
              <span>Walk Through the 6 Stages</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Tile 4: Printable Clinical Summary (7 cols) */}
          <div className="md:col-span-7 product-card-glass p-7 sm:p-8 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase text-[var(--coral-red)] font-semibold">
                  04 • Clinical Export
                </span>
                <div className="w-10 h-10 rounded-xl bg-[var(--coral-red-subtle)] text-[var(--coral-red)] flex items-center justify-center">
                  <Printer className="w-5 h-5" />
                </div>
              </div>
              <h3 className="font-display font-bold text-2xl text-[var(--text-main)]">
                Physician-Ready Print & PDF Dossier
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl">
                Every generated evaluation outputs a clean, print-formatted case file with complete indicator tables, neighbor comparisons, and prominent educational disclaimers.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-[var(--text-muted)]">
              <span>✓ CSS @media print formatted</span>
              <span>•</span>
              <span>✓ Unique Case IDs</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
