import React from 'react';

/**
 * BackgroundBeams - Inspired by Aceternity UI
 * Creates a clean, restrained ambient medical grid with subtle gradient lighting.
 */
export default function BackgroundBeams() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Soft Ambient Radial Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[var(--accent-cyan)]/8 dark:bg-[var(--accent-cyan)]/10 rounded-full blur-[100px]" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[300px] bg-[var(--coral-red)]/5 dark:bg-[var(--coral-red)]/8 rounded-full blur-[90px]" />
      
      {/* Subtle Dot Matrix Matrix / Mesh */}
      <svg
        className="absolute inset-0 w-full h-full opacity-40 dark:opacity-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="med-grid-pattern"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1" fill="currentColor" className="text-slate-400 dark:text-cyan-400" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#med-grid-pattern)" />
      </svg>
    </div>
  );
}
