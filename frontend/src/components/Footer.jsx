import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="no-print border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-12 px-4 sm:px-8 mt-auto text-xs text-[var(--text-secondary)] transition-colors duration-200">
      <div className="site-container space-y-8">
        
        {/* Institutional Medical Disclaimer Notice */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--coral-red-subtle)] text-[var(--coral-red)] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <span className="font-mono text-xs font-semibold uppercase text-[var(--text-main)] block">
                Educational Cardiovascular Research Platform
              </span>
              <p className="text-[11px] text-[var(--text-muted)] max-w-3xl leading-relaxed">
                CardioDetect is an experimental machine learning demonstration based on the UCI Heart Disease Dataset (918 patient cohort). It is designed exclusively for educational, informational, and technical study. It does not provide medical diagnoses, treatment advice, or formal clinical prognosis. If you are experiencing chest pain, shortness of breath, or cardiac symptoms, seek emergency medical care immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Brand, Links, & Baseline Specs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--border-subtle)]/60 text-[11px]">
          <div className="flex items-center gap-3">
            <button
              onClick={scrollToTop}
              className="font-display font-bold text-sm tracking-tight text-[var(--text-main)] hover:text-[var(--accent-cyan)] transition-colors cursor-pointer"
            >
              CardioDetect
            </button>
            <span className="text-[var(--text-muted)]">•</span>
            <span className="font-mono text-[var(--text-muted)]">
              Scikit-Learn KNN (k=5) + FastAPI
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[var(--text-muted)]">
            <a href="#how-it-works" className="hover:text-[var(--text-main)] transition-colors">How It Works</a>
            <a href="#assessment" className="hover:text-[var(--text-main)] transition-colors">Assessment</a>
            <a href="#insights" className="hover:text-[var(--text-main)] transition-colors">Model Insights</a>
            <a href="#inside-the-model" className="hover:text-[var(--text-main)] transition-colors">Inside the Model</a>
          </div>

          <div className="text-[var(--text-muted)] font-mono text-[10px]">
            © CardioDetect Research Lab. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
