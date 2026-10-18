import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE_OUT_EXPO } from '../utils/motion';

export default function WelcomeScreen({ onComplete }) {
  const [stage, setStage] = useState(1); // 1: ECG drawing & pulsing, 2: Wordmark resolve, 3: Lift away

  useEffect(() => {
    // Check reduced motion upfront
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete();
      return;
    }

    const t1 = setTimeout(() => setStage(2), 1050); // Wordmark & tagline reveal
    const t2 = setTimeout(() => setStage(3), 1950); // Lift away
    const t3 = setTimeout(() => onComplete(), 2400); // Complete

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {stage < 3 && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070B14] text-[#F1F5F9] select-none blueprint-grid-canvas"
        >
          {/* Skip CTA */}
          <button
            onClick={onComplete}
            className="absolute top-6 right-6 text-xs font-mono tracking-widest text-slate-400 hover:text-white transition-colors uppercase px-3 py-1.5 rounded border border-white/10 hover:border-white/20 bg-white/5 backdrop-blur-md"
          >
            Skip [Esc]
          </button>

          {/* Center Cinematic Composition */}
          <div className="w-full max-w-xl px-6 flex flex-col items-center text-center">
            
            {/* Ambient Pulse Glow */}
            <div className="absolute w-72 h-72 rounded-full bg-[var(--accent-cyan)]/10 blur-3xl pointer-events-none -z-10 animate-pulse" />

            {/* Stage 1: Beating lines ECG waveform */}
            <div className="w-full h-24 flex items-center justify-center relative overflow-hidden mb-6">
              <svg
                viewBox="0 0 500 80"
                className="w-full h-full stroke-current fill-none overflow-visible"
              >
                {/* Background faint guideline */}
                <line
                  x1="0"
                  y1="40"
                  x2="500"
                  y2="40"
                  stroke="rgba(69, 217, 232, 0.15)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />

                {/* Beating ECG waveform line */}
                <motion.path
                  d="M 0,40 L 120,40 L 150,40 L 165,28 L 180,52 L 195,40 L 220,40 L 230,10 L 242,70 L 254,22 L 266,46 L 278,40 L 305,40 L 320,32 L 335,40 L 500,40"
                  stroke="url(#ecgWelcomeGradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                />

                {/* Animated Glowing Pulse Bead */}
                <motion.circle
                  cx="236"
                  cy="40"
                  r="5"
                  fill="#45D9E8"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1.8, 1],
                    opacity: [0, 1, 0.8],
                  }}
                  transition={{ delay: 0.65, duration: 0.6 }}
                  className="filter drop-shadow-[0_0_8px_#45D9E8]"
                />

                <defs>
                  <linearGradient id="ecgWelcomeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#45D9E8" stopOpacity="0.2" />
                    <stop offset="45%" stopColor="#45D9E8" stopOpacity="0.9" />
                    <stop offset="55%" stopColor="#FF5267" stopOpacity="1" />
                    <stop offset="100%" stopColor="#48D597" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Stage 2: Resolves into CARDIODETECT Wordmark */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: stage >= 2 ? 1 : 0, y: stage >= 2 ? 0 : 12 }}
              transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
              className="space-y-2"
            >
              <div className="flex items-center justify-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--coral-red)] shadow-[0_0_12px_#FF5267]" />
                <span className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-white">
                  CARDIODETECT
                </span>
              </div>

              {/* Tagline */}
              <p className="text-xs sm:text-sm font-medium tracking-wide text-slate-400 font-sans">
                Every heartbeat leaves a clue.
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
