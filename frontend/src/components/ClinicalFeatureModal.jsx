import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CLINICAL_FEATURES } from '../data/clinicalFeatures';

export default function ClinicalFeatureModal({ featureKey, onClose }) {
  if (!featureKey || !CLINICAL_FEATURES[featureKey]) return null;

  const feature = CLINICAL_FEATURES[featureKey];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs">
        {/* Backdrop click dismiss */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-6 overflow-hidden z-10 text-slate-800 dark:text-slate-100"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center border border-rose-100 dark:border-rose-900/40">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white">
                    {feature.name}
                  </h3>
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {feature.unit}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Dataset Field: <code className="font-mono text-rose-500">{featureKey}</code>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close explanation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="mt-4 space-y-4 text-xs sm:text-sm max-h-[65vh] overflow-y-auto pr-1">
            {/* Clinical Meaning */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-cyan-500" />
                What It Represents
              </h4>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {feature.clinicalDefinition}
              </p>
            </div>

            {/* Why the Model Uses It */}
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Machine Learning Rationale
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                {feature.whyModelUsesIt}
              </p>
            </div>

            {/* Category / Threshold Reference */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Dataset Values & Categories
              </h4>
              
              {Array.isArray(feature.categoriesOrValues) ? (
                <div className="space-y-1.5">
                  {feature.categoriesOrValues.map((cat) => (
                    <div
                      key={cat.key}
                      className="p-2.5 rounded-md bg-white dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex flex-col gap-0.5"
                    >
                      <div className="font-medium text-xs text-slate-900 dark:text-slate-100 font-mono">
                        {cat.label}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {cat.desc}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2.5 rounded-md bg-white dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  {feature.categoriesOrValues}
                </div>
              )}
            </div>

            {/* Reference Range */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Clinical Reference Guideline
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {feature.normalReference}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="btn-secondary text-xs py-1.5 px-4"
            >
              Understood
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
