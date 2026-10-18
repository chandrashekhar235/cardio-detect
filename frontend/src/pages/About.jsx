import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  ShieldCheck,
  Code,
  User,
  ArrowRight,
  BookOpen,
  Globe,
  Database,
  Scale,
  AlertTriangle,
  Layers,
  FileCheck
} from 'lucide-react';
import { pageTransitionVariant } from '../utils/motion';

export default function About() {
  useEffect(() => {
    document.title = 'About & Methodology | CardioDetect';
  }, []);

  return (
    <motion.div
      variants={pageTransitionVariant}
      initial="initial"
      animate="animate"
      exit="exit"
      className="py-8 sm:py-16 bg-[var(--bg-canvas)] text-[var(--text-main)] min-h-[calc(100vh-4rem)] transition-colors duration-200"
    >
      <div className="site-container-wide max-w-5xl space-y-12 sm:space-y-16">
        
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-cyan-subtle)] text-[var(--accent-cyan)] text-xs font-semibold uppercase tracking-wider font-mono">
            <Heart className="w-3.5 h-3.5" />
            <span>Methodology & Governance</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-bold text-[var(--text-main)] tracking-tight">
            About CardioDetect
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-3xl">
            CardioDetect is an open educational and cardiovascular research platform exploring machine-learning-assisted classification using clinical biomarkers. Built to demonstrate radical algorithmic interpretability over opaque black boxes.
          </p>
        </div>

        {/* Section 1: Plain Language Overview */}
        <section className="product-card-glass p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
            <BookOpen className="w-4 h-4 text-[var(--accent-cyan)]" />
            <h2 className="font-display font-bold text-lg text-[var(--text-main)]">
              How the Machine Learning Model Works
            </h2>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            <p>
              Unlike deep neural networks whose internal representations are hidden, CardioDetect utilizes a deterministic, geometry-based algorithm: <strong>K-Nearest Neighbors (k=5)</strong> with scikit-learn.
            </p>
            <p>
              When clinical indicators (age, resting blood pressure, cholesterol, stress ECG markers) are submitted, the pipeline standardizes continuous values using <code>StandardScaler</code> so high-magnitude measurements (such as cholesterol in mg/dL) do not distort small-magnitude measurements (such as ST depression in millimeters). It then calculates the exact straight-line Euclidean distance across 15 coordinates between the input and all 734 training patient records.
            </p>
            <p>
              The 5 closest historical cases in that multidimensional space are identified. Each neighbor casts an equal vote. If 3 or more of these 5 similar patients had confirmed coronary artery disease, the case is classified as elevated risk.
            </p>
          </div>
        </section>

        {/* Section 2: Dataset Provenance & Exact Composition */}
        <section className="product-card-glass p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
            <Database className="w-4 h-4 text-[var(--medical-green)]" />
            <h2 className="font-display font-bold text-lg text-[var(--text-main)]">
              Dataset Origin & Empirical Composition
            </h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            <p>
              The training registry comprises <strong>918 patient records</strong> compiled from four landmark clinical cardiology registries:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 font-mono text-xs">
              <li className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                <span className="font-bold text-[var(--text-main)] block">1. Cleveland Clinic Foundation</span>
                <span className="text-[var(--text-muted)]">303 clinical evaluations (Dr. Robert Detrano)</span>
              </li>
              <li className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                <span className="font-bold text-[var(--text-main)] block">2. Hungarian Institute of Cardiology</span>
                <span className="text-[var(--text-muted)]">294 cases, Budapest (Dr. Andras Janosi)</span>
              </li>
              <li className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                <span className="font-bold text-[var(--text-main)] block">3. University Hospital, Zurich</span>
                <span className="text-[var(--text-muted)]">123 cases, Switzerland (Dr. William Steinbrunn)</span>
              </li>
              <li className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                <span className="font-bold text-[var(--text-main)] block">4. V.A. Medical Center, Long Beach</span>
                <span className="text-[var(--text-muted)]">200 cases (Dr. Donald Pfisterer)</span>
              </li>
            </ul>
            <p className="text-xs pt-2">
              Ground truth diagnosis was confirmed via coronary angiography (&gt;50% diameter narrowing in one or more major coronary arteries).
            </p>
          </div>
        </section>

        {/* Section 3: Limitations & Honest Boundary Constraints */}
        <section className="product-card-glass p-6 sm:p-8 space-y-4 border-amber-500/30">
          <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2 className="font-display font-bold text-lg text-[var(--text-main)]">
              Scientific Limitations & Known Algorithmic Constraints
            </h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-1.5">
                <span className="font-mono text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-amber-500" />
                  <span>Sample Size (n=918)</span>
                </span>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  While benchmarked across four hospitals, 918 patients is small compared to modern longitudinal registries (e.g. UK Biobank). Findings reflect retrospective clinical settings.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-1.5">
                <span className="font-mono text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  <span>Discrete 20% Granularity</span>
                </span>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Because k=5 neighbors vote, probability estimates strictly equal 0%, 20%, 40%, 60%, 80%, or 100%. We intentionally avoid pseudo-continuous calibration curves that claim misleading false precision.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-1.5">
                <span className="font-mono text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>Non-Interventional</span>
                </span>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  This tool has not been subjected to a randomized prospective clinical trial and is not FDA/CE-cleared for patient triage or prescription decision support.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Ethics & Responsible AI */}
        <section className="product-card-glass p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
            <ShieldCheck className="w-4 h-4 text-[var(--accent-cyan)]" />
            <h2 className="font-display font-bold text-lg text-[var(--text-main)]">
              Ethics, Fairness & AI Governance
            </h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            <p>
              Historical medical datasets carry demographic imbalances (e.g., male patients represent ~79% of this historical cohort). To mitigate bias:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[var(--text-muted)]">
              <li>Sex is modeled as an orthogonal feature rather than an exclusionary stratification filter.</li>
              <li>Every inference provides transparent nearest-neighbor evidence, enabling clinicians to audit exact comparison instances.</li>
              <li>No automated decisions or autonomous medical judgments are permitted by the system architecture.</li>
            </ul>
          </div>
        </section>

        {/* Section 5: Creator Profile */}
        <section className="product-card-glass p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
            <User className="w-4 h-4 text-[var(--coral-red)]" />
            <h2 className="font-display font-bold text-lg text-[var(--text-main)]">
              Creator & Lead Engineer
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[var(--coral-red)] to-amber-500 text-white flex items-center justify-center font-display font-bold text-2xl shadow-md shrink-0">
              JS
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg text-[var(--text-main)]">
                Jasmanjot Singh Sarna
              </h3>
              <p className="text-xs text-[var(--coral-red)] font-medium">
                Machine Learning Engineer & Full-Stack Developer
              </p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-1">
                Specializing in production ML architectures, clean healthcare interfaces, and end-to-end data pipeline integration using Python, Scikit-Learn, FastAPI, and React.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <a
                  href="https://linkedin.com/in/jasmanjot-singh-sarna"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[var(--accent-cyan)] hover:underline flex items-center gap-1"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>LinkedIn Profile</span>
                </a>
                <a
                  href="https://github.com/jasman-sarna"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-main)] flex items-center gap-1"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Full Institutional Medical Disclaimer */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-3">
          <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold block">
            Institutional Medical Notice & Disclaimer
          </span>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            CardioDetect is strictly an educational cardiovascular research and demonstration platform. It does not provide medical diagnoses, treatment plans, triage guidance, or clinical decision-making. Never alter medical therapy or disregard physician counsel based on this computational model. In emergency circumstances, contact local emergency services immediately.
          </p>
        </section>

        {/* Primary CTA */}
        <div className="text-center pt-2">
          <Link
            to="/assess"
            className="btn-primary text-xs py-3 px-6 inline-flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <span>Launch Clinical Assessment Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </motion.div>
  );
}
