import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BorderBeam from './ui/BorderBeam';

export default function HeroHeartVisualizer() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 16;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-md lg:max-w-lg aspect-square rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden transition-all duration-300 group medical-grid-bg"
      style={{
        boxShadow: 'var(--card-shadow)'
      }}
    >
      {/* Magic UI Border Beam */}
      <BorderBeam size={220} duration={10} colorFrom="#45D9E8" colorTo="#FF5267" />
      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between z-10 border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--medical-green)] shadow-xs shadow-emerald-500/50" />
          <span className="text-[11px] font-mono tracking-wider text-[var(--text-secondary)] uppercase">
            Sinus Rhythm Vector
          </span>
        </div>
        <span className="text-[11px] font-mono font-medium text-[var(--accent-cyan)]">
          72 BPM • QRS 94ms
        </span>
      </div>

      {/* Center Interactive Anatomical Vector Composition */}
      <motion.div
        animate={{
          x: mousePos.x,
          y: mousePos.y
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 120 }}
        className="relative my-auto flex items-center justify-center py-6 floating-heart"
      >
        {/* Soft Radial Ambient Glow */}
        <div className="absolute w-44 h-44 rounded-full bg-[var(--coral-red)]/10 dark:bg-[var(--coral-red)]/15 blur-2xl pointer-events-none" />
        <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-[var(--accent-cyan)]/10 dark:bg-[var(--accent-cyan)]/15 blur-2xl pointer-events-none" />

        {/* Anatomical Heart & Grid Overlay SVG */}
        <svg
          viewBox="0 0 320 280"
          className="w-72 h-64 select-none"
          style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }}
        >
          {/* Subtle Cardiac Coordinate Grid Lines */}
          <line x1="20" y1="140" x2="300" y2="140" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="160" y1="20" x2="160" y2="260" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="4 4" />

          {/* Stylized Anatomical Heart Contour */}
          {/* Superior Vena Cava & Aorta Arch */}
          <path
            d="M 125,75 C 125,45 140,25 160,25 C 180,25 195,42 195,70"
            fill="none"
            stroke="var(--accent-cyan)"
            strokeWidth="2.5"
            className="opacity-80"
          />
          <path
            d="M 105,80 C 105,55 115,35 130,35"
            fill="none"
            stroke="var(--accent-cyan)"
            strokeWidth="2"
            className="opacity-60"
          />

          {/* Left & Right Ventricles and Atria Contours */}
          <path
            d="M 160,75 C 220,40 265,95 245,160 C 230,205 180,240 160,255 C 140,240 90,205 75,160 C 55,95 100,40 160,75 Z"
            fill="none"
            stroke="var(--coral-red)"
            strokeWidth="2.2"
            className="opacity-90"
          />

          {/* Internal Conduction System (Bundle of His / Purkinje Fibers) */}
          <path
            d="M 160,75 L 160,140 L 135,185 L 115,195"
            fill="none"
            stroke="var(--accent-cyan)"
            strokeWidth="1.8"
            strokeDasharray="2 3"
          />
          <path
            d="M 160,140 L 185,185 L 205,195"
            fill="none"
            stroke="var(--accent-cyan)"
            strokeWidth="1.8"
            strokeDasharray="2 3"
          />

          {/* Continuous Animated ECG Waveform Overlay */}
          <path
            d="M 20,140 L 80,140 L 95,140 L 105,125 L 115,155 L 125,140 L 135,140 L 142,85 L 152,205 L 162,110 L 172,150 L 182,140 L 198,140 L 210,132 L 222,140 L 300,140"
            fill="none"
            stroke="var(--coral-red)"
            strokeWidth="2"
            className="ecg-animated-line"
          />

          {/* Restrained Biological Signal Marker 1: Sinoatrial Node */}
          <circle cx="125" cy="75" r="4.5" fill="var(--coral-red)" />
          <circle cx="125" cy="75" r="8" fill="none" stroke="var(--coral-red)" strokeWidth="1" className="animate-ping" style={{ transformOrigin: '125px 75px' }} />

          {/* Signal Marker 2: Apex */}
          <circle cx="160" cy="255" r="4" fill="var(--accent-cyan)" />

          {/* Signal Marker 3: Left Ventricular Free Wall */}
          <circle cx="230" cy="175" r="4" fill="var(--medical-green)" />
        </svg>

        {/* Telemetry Labels around vector */}
        <div className="absolute top-2 right-2 px-2 py-1 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--accent-cyan)] shadow-xs">
          SA Node: Normal
        </div>
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--coral-red)] shadow-xs">
          Apex Axis: -15°
        </div>
      </motion.div>

      {/* Bottom Status Ribbon */}
      <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-3 text-[11px] font-mono text-[var(--text-secondary)] z-10">
        <span>Model Feature Space</span>
        <span className="text-[var(--text-main)] font-semibold">15D Standardized</span>
        <span className="text-[var(--medical-green)]">k=5 Active</span>
      </div>
    </div>
  );
}
