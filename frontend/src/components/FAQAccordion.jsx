import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { EASE_OUT_EXPO } from '../utils/motion';

const FAQS = [
  {
    q: 'Is CardioDetect a medical diagnostic instrument?',
    a: 'No. CardioDetect is strictly an educational research platform and machine-learning demonstration based on the UCI Heart Disease Dataset (918 cases). It is designed to demonstrate interpretable classification and nearest-neighbor clustering, not to offer clinical diagnosis or medical therapy advice. Always consult a board-certified physician.'
  },
  {
    q: 'Why does the pipeline utilize K-Nearest Neighbors instead of deep neural networks?',
    a: 'In clinical decision support, explainability is paramount. Deep neural networks produce unexplainable latent feature embeddings. K-Nearest Neighbors (k=5) allows patients and clinicians to inspect the exact 5 historical peer patients whose physiological profiles most closely match the active query vector.'
  },
  {
    q: 'How does the model handle missing cholesterol laboratory records?',
    a: 'In the UCI dataset, several cases have unrecorded cholesterol (stored as 0). The pipeline applies median imputation (~223 mg/dL derived from training instances only) to prevent biological impossibilities from distorting Euclidean coordinate distances.'
  },
  {
    q: 'How is the 86.41% accuracy and 0.9269 ROC-AUC score validated?',
    a: 'Metrics are calculated on a strictly isolated 20% holdout test set (184 patient cases) that were completely held out during training, using stratified sampling to maintain authentic disease prevalence ratios.'
  }
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-20 sm:py-28 border-b border-[var(--border-subtle)] relative">
      <div className="site-container-narrow space-y-12">
        
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-mono uppercase text-[var(--text-muted)]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-display font-bold text-[var(--text-main)] tracking-tight">
            Methodology & Clinical Scope
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Common questions regarding model mechanics, dataset boundaries, and intended educational use.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-glass)] backdrop-blur-md overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-display font-semibold text-base text-[var(--text-main)]">
                    {faq.q}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center shrink-0 text-[var(--text-muted)]">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 sm:p-6 pt-0 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)]/40 mt-1">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
