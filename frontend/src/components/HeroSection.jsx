import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import HeroHeartVisualizer from './HeroHeartVisualizer';
import { fadeUpVariant, staggerContainer } from '../utils/motion';

export default function HeroSection({ onStartAssessment }) {
  return (
    <section
      id="hero"
      className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 overflow-hidden border-b border-[var(--border-subtle)] blueprint-grid-canvas"
    >
      {/* Background Soft Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[var(--accent-cyan)]/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[250px] bg-[var(--coral-red)]/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="site-container relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-7"
        >
          {/* Eyebrow Pill */}
          <motion.div
            variants={fadeUpVariant}
            custom={0}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface-glass)] border border-[var(--border-glass)] text-xs font-mono tracking-wide text-[var(--accent-cyan)] shadow-sm backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
            <span className="font-semibold uppercase">Cardiovascular Decision Engine</span>
            <span className="text-[var(--text-muted)]">•</span>
            <span className="text-[var(--text-secondary)]">k=5 Nearest Neighbors</span>
          </motion.div>

          {/* Confident Headline */}
          <motion.h1
            variants={fadeUpVariant}
            custom={1}
            className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold text-[var(--text-main)] tracking-tight leading-[1.05]"
          >
            Every heartbeat <br />
            <span className="bg-gradient-to-r from-[var(--coral-red)] via-[var(--accent-cyan)] to-[var(--medical-green)] bg-clip-text text-transparent">
              leaves a clue.
            </span>
          </motion.h1>

          {/* Subline */}
          <motion.p
            variants={fadeUpVariant}
            custom={2}
            className="text-base sm:text-lg lg:text-xl text-[var(--text-secondary)] max-w-2xl leading-relaxed"
          >
            A calm, transparent clinical machine-learning platform. Project 11 physiological indicators into a verified 15-dimensional patient space to evaluate ischemic cardiac patterns.
          </motion.p>

          {/* Single Primary CTA */}
          <motion.div variants={fadeUpVariant} custom={3} className="pt-2">
            <button
              onClick={onStartAssessment}
              className="btn-primary text-sm sm:text-base py-3.5 px-8 shadow-md group cursor-pointer"
            >
              <span>Start assessment</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Living Cardiovascular Visualizer with Gentle Parallax */}
          <motion.div
            variants={fadeUpVariant}
            custom={4}
            className="w-full max-w-lg pt-6 sm:pt-8"
          >
            <HeroHeartVisualizer />
          </motion.div>

          {/* Benchmark Badges */}
          <motion.div
            variants={fadeUpVariant}
            custom={5}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl pt-4 border-t border-[var(--border-subtle)] text-left"
          >
            <div className="space-y-0.5">
              <div className="font-mono text-xs uppercase text-[var(--text-muted)]">Test Accuracy</div>
              <div className="font-mono text-lg font-bold text-[var(--text-main)]">86.41%</div>
            </div>
            <div className="space-y-0.5">
              <div className="font-mono text-xs uppercase text-[var(--text-muted)]">ROC-AUC Area</div>
              <div className="font-mono text-lg font-bold text-[var(--accent-cyan)]">0.9269</div>
            </div>
            <div className="space-y-0.5">
              <div className="font-mono text-xs uppercase text-[var(--text-muted)]">Training Cohort</div>
              <div className="font-mono text-lg font-bold text-[var(--text-main)]">918 Patients</div>
            </div>
            <div className="space-y-0.5">
              <div className="font-mono text-xs uppercase text-[var(--text-muted)]">Model Geometry</div>
              <div className="font-mono text-lg font-bold text-[var(--medical-green)]">k=5 Euclidean</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
