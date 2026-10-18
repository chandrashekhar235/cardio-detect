import React from 'react';
import CardSpotlight from './CardSpotlight';
import { Sliders, Cpu, BarChart3, FileText } from 'lucide-react';

/**
 * BentoGrid - Inspired by Aceternity UI & Magic UI
 * Organizes platform features in an asymmetric, visual-hierarchy bento grid.
 */
export default function BentoGrid() {
  const items = [
    {
      title: 'Guided Clinical Parameter Entry',
      description: 'Every input features contextual help, physiological boundaries, and medical explanations for accessible data entry.',
      header: (
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent-cyan)] p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          <span className="w-2 h-2 rounded-full bg-[var(--medical-green)]" />
          <span>11 Verified Diagnostic Indicators</span>
        </div>
      ),
      className: 'md:col-span-2',
      icon: <Sliders className="w-5 h-5 text-[var(--accent-cyan)]" />,
    },
    {
      title: 'Instant KNN Inference',
      description: 'Zero-latency Scikit-Learn pipeline calculating Euclidean distances across 15 standardized coordinates.',
      header: (
        <div className="font-mono text-xl font-bold text-[var(--coral-red)]">
          k=5 Majority Rule
        </div>
      ),
      className: 'md:col-span-1',
      icon: <Cpu className="w-5 h-5 text-[var(--coral-red)]" />,
    },
    {
      title: 'Benchmark Verification',
      description: 'Authentic 86.41% accuracy, 0.9269 ROC-AUC, and full test confusion matrix calculated on 184 holdout cases.',
      header: (
        <div className="font-mono text-xl font-bold text-[var(--medical-green)]">
          86.41% Accuracy
        </div>
      ),
      className: 'md:col-span-1',
      icon: <BarChart3 className="w-5 h-5 text-[var(--medical-green)]" />,
    },
    {
      title: 'Evidence-Based Case Reports',
      description: 'Synthesizes model predictions, probability scores, patient vitals, and actionable recommendations into printable clinical summaries.',
      header: (
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--coral-red)] p-2 rounded-lg bg-[var(--coral-red-subtle)] border border-[var(--coral-red)]/30">
          <span>Synthesizes Risk & Biomarkers</span>
        </div>
      ),
      className: 'md:col-span-2',
      icon: <FileText className="w-5 h-5 text-[var(--coral-red)]" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
      {items.map((item, i) => (
        <CardSpotlight
          key={i}
          className={`${item.className} flex flex-col justify-between p-6 sm:p-7 min-h-[220px] group`}
          spotlightColor="rgba(69, 217, 232, 0.08)"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              {item.header}
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-[var(--text-main)] group-hover:text-[var(--accent-cyan)] transition-colors">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        </CardSpotlight>
      ))}
    </div>
  );
}
