import React from 'react';
import { motion } from 'framer-motion';
import { Sliders, Users, FileCheck } from 'lucide-react';
import { fadeUpVariant, staggerContainer } from '../utils/motion';

const STEPS = [
  {
    num: '01',
    title: 'Enter 11 Clinical Indicators',
    tag: 'Patient Profile & Stress Vitals',
    icon: Sliders,
    color: 'var(--accent-cyan)',
    desc: 'Input patient demographics, resting blood pressure, fasting glucose, lipid levels, and Bruce treadmill stress ECG markers. Built-in clinical guides explain every threshold.',
  },
  {
    num: '02',
    title: 'Nearest-Neighbor Consensus (k=5)',
    tag: '15-Dimensional Coordinate Projection',
    icon: Users,
    color: 'var(--medical-green)',
    desc: 'The scikit-learn pipeline standardizes continuous biomarkers and queries 734 verified clinical cases, isolating the 5 most physiologically similar patient vectors.',
  },
  {
    num: '03',
    title: 'Interpret Honest Case Evidence',
    tag: 'Transparent Decision Support',
    icon: FileCheck,
    color: 'var(--coral-red)',
    desc: 'Receive an honest classification without opaque black-box estimates. Review exactly how many neighbors presented heart disease, examine key contributing factors, and export the case.',
  },
];

export default function HowItWorksSection({ onStartAssessment: _onStartAssessment }) {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 border-b border-[var(--border-subtle)] relative">
      <div className="site-container">
        
        {/* Section Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-3"
        >
          <motion.div
            variants={fadeUpVariant}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-mono uppercase text-[var(--text-muted)]"
          >
            <span>The Clinical Protocol</span>
          </motion.div>

          <motion.h2
            variants={fadeUpVariant}
            className="text-3xl sm:text-4xl font-display font-bold text-[var(--text-main)] tracking-tight"
          >
            How CardioDetect works
          </motion.h2>

          <motion.p variants={fadeUpVariant} className="text-sm sm:text-base text-[var(--text-secondary)]">
            A three-step clinical intelligence workflow built for transparency, patient clarity, and non-parametric machine learning rigor.
          </motion.p>
        </motion.div>

        {/* 3 Steps Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                variants={fadeUpVariant}
                custom={idx}
                className="product-card-glass p-7 flex flex-col justify-between space-y-6 relative group"
              >
                <div className="space-y-4">
                  {/* Top: Step Number & Icon */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-bold tracking-tight text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">
                      {step.num}
                    </span>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${step.color} 12%, transparent)`,
                        color: step.color,
                        border: `1px solid color-mix(in srgb, ${step.color} 30%, transparent)`,
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Step Title & Tag */}
                  <div>
                    <span className="text-[11px] font-mono tracking-wider uppercase text-[var(--text-muted)] block mb-1">
                      {step.tag}
                    </span>
                    <h3 className="font-display font-semibold text-lg text-[var(--text-main)]">
                      {step.title}
                    </h3>
                  </div>

                  {/* Body description */}
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: step.color }} />
                  <span>Phase {step.num} of 03</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
