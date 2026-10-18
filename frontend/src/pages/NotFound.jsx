import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { pageTransitionVariant } from '../utils/motion';

export default function NotFound() {
  const [beating, setBeating] = useState(false);

  const triggerBeat = () => {
    setBeating(true);
    setTimeout(() => setBeating(false), 900);
  };

  return (
    <motion.div
      variants={pageTransitionVariant}
      initial="initial"
      animate="animate"
      exit="exit"
      className="site-container-narrow min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-center py-16 blueprint-grid-canvas"
    >
      <div className="w-full max-w-md p-8 rounded-3xl product-card-glass space-y-6">
        
        {/* Flatline ECG Display with Beat on Hover/Click */}
        <div
          onMouseEnter={triggerBeat}
          onClick={triggerBeat}
          className="w-full h-24 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex items-center justify-center p-4 relative overflow-hidden cursor-pointer group"
          title="Click or hover to stimulate a rhythm"
        >
          <svg viewBox="0 0 300 60" className="w-full h-full stroke-current fill-none text-[var(--coral-red)]">
            <line x1="0" y1="30" x2="300" y2="30" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="4 4" />
            
            {beating ? (
              <motion.path
                d="M 0,30 L 100,30 L 115,30 L 125,20 L 135,40 L 145,30 L 152,8 L 160,52 L 168,18 L 176,34 L 184,30 L 300,30"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              />
            ) : (
              <line
                x1="0"
                y1="30"
                x2="300"
                y2="30"
                strokeWidth="2"
                className="opacity-70"
              />
            )}
          </svg>

          <span className="absolute bottom-2 right-3 font-mono text-[10px] text-[var(--text-muted)] uppercase">
            {beating ? 'Sinus Pulse Stimulated' : 'Asystole / 0 BPM'}
          </span>
        </div>

        <div className="space-y-2">
          <div className="font-mono text-xs uppercase tracking-wider text-[var(--coral-red)] font-semibold">
            Status Code 404 — Flatline Signal
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-main)]">
            Signal Vector Lost
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            The clinical coordinate or endpoint you requested does not exist in this pipeline registry.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            onMouseEnter={triggerBeat}
            className="btn-primary text-xs py-2.5 px-5 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Safety (Home)</span>
          </Link>
          <button
            type="button"
            onClick={triggerBeat}
            className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${beating ? 'animate-spin' : ''}`} />
            <span>Stimulate Beat</span>
          </button>
        </div>

      </div>
    </motion.div>
  );
}
