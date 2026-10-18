import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import InsideModelSection from '../components/InsideModelSection';
import { pageTransitionVariant } from '../utils/motion';

export default function Science() {
  useEffect(() => {
    document.title = 'Inside the Model | CardioDetect Architecture & Math';
  }, []);

  return (
    <motion.div
      variants={pageTransitionVariant}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-[var(--bg-canvas)] min-h-[calc(100vh-4rem)] transition-colors duration-200"
    >
      <InsideModelSection />
    </motion.div>
  );
}
