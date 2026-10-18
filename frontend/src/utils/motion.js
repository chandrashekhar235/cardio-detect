import { useEffect, useState } from 'react';

/**
 * Standard cubic-bezier easing for calm, authoritative medical-tech motion
 */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
export const EASE_IN_OUT = [0.4, 0, 0.2, 1];

/**
 * Shared Motion Variants (Respects prefers-reduced-motion)
 */
export const fadeUpVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: custom * 0.08,
      ease: EASE_OUT_EXPO,
    },
  }),
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

export const scaleInVariant = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: (custom = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.45,
      delay: custom * 0.05,
      ease: EASE_OUT_EXPO,
    },
  }),
};

export const pageTransitionVariant = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
};

/**
 * Animated number counter hook
 */
export function useCountUp(endVal, duration = 1200, decimals = 0, startTrigger = true) {
  const isReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const target = parseFloat(endVal);
  const [val, setVal] = useState(isReduced || isNaN(target) ? endVal : 0);

  useEffect(() => {
    if (!startTrigger || isReduced || isNaN(target)) {
      setVal(endVal);
      return;
    }

    const start = 0;
    const startTime = performance.now();
    let frameId;

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * ease;
      setVal(Number(current.toFixed(decimals)));

      if (progress < 1) {
        frameId = requestAnimationFrame(update);
      } else {
        setVal(target);
      }
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [endVal, duration, decimals, startTrigger, isReduced, target]);

  return val;
}
