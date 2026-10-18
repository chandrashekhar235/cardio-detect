import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function PulseFieldCanvas() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { theme } = useTheme();
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationFrameId;
    let isVisible = true;

    // Pause when offscreen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    if (containerRef.current) observer.observe(containerRef.current);

    // Setup Canvas dimensions capped at max dpr 2
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const resize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Particles grid
    const spacing = 26;
    let t = 0;

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Colors depending on theme
      const isDark = theme === 'dark';
      const dotColor = isDark ? 'rgba(69, 217, 232, 0.12)' : 'rgba(0, 125, 143, 0.13)';
      const activeDotColor = isDark ? 'rgba(69, 217, 232, 0.9)' : 'rgba(0, 125, 143, 0.85)';
      const ribbonColor = isDark ? 'rgba(69, 217, 232, 0.95)' : 'rgba(0, 125, 143, 0.95)';
      const pulseBeadColor = isDark ? '#FF5267' : '#D9253E';
      const gridColorMajor = isDark ? 'rgba(69, 217, 232, 0.04)' : 'rgba(15, 23, 42, 0.035)';

      // 1. Draw subtle background medical ECG grid
      ctx.strokeStyle = gridColorMajor;
      ctx.lineWidth = 1;
      const gridSize = 32;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw responsive dot matrix
      const cols = Math.ceil(width / spacing);
      const rows = Math.ceil(height / spacing);

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const px = i * spacing;
          const py = j * spacing;

          // Compute distance to mouse
          const dx = mousePos.x - px;
          const dy = mousePos.y - py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxInfluence = 130;

          let renderX = px;
          let renderY = py;
          let size = 1.25;
          let currentDotColor = dotColor;

          if (dist < maxInfluence && !prefersReduced) {
            const force = (1 - dist / maxInfluence);
            renderX += (dx / dist) * force * 16;
            renderY += (dy / dist) * force * 16;
            size = 1.25 + force * 2.5;
            currentDotColor = activeDotColor;
          }

          ctx.beginPath();
          ctx.arc(renderX, renderY, size, 0, Math.PI * 2);
          ctx.fillStyle = currentDotColor;
          ctx.fill();
        }
      }

      // 3. Draw flowing multi-cycle ECG ribbon
      ctx.beginPath();
      const centerY = height * 0.48;
      const waveLength = 260;

      for (let x = 0; x <= width; x += 2) {
        const cycle = (((x - t * 1.6) % waveLength) + waveLength) % waveLength / waveLength;
        let yOffset = 0;

        // P wave
        if (cycle > 0.12 && cycle < 0.24) {
          yOffset = -Math.sin((cycle - 0.12) * Math.PI / 0.12) * 11;
        }
        // Q dip
        else if (cycle > 0.35 && cycle < 0.38) {
          yOffset = 10;
        }
        // R peak (QRS complex)
        else if (cycle >= 0.38 && cycle < 0.44) {
          yOffset = -Math.sin((cycle - 0.38) * Math.PI / 0.06) * 72;
        }
        // S dip
        else if (cycle >= 0.44 && cycle < 0.48) {
          yOffset = 20;
        }
        // T wave
        else if (cycle > 0.55 && cycle < 0.72) {
          yOffset = -Math.sin((cycle - 0.55) * Math.PI / 0.17) * 18;
        }

        // Mouse deflection on wave
        const mouseDist = Math.abs(x - mousePos.x);
        if (mouseDist < 100 && !prefersReduced) {
          yOffset += Math.sin((mouseDist / 100) * Math.PI) * (mousePos.y - centerY) * 0.18;
        }

        const currentY = centerY + yOffset;
        if (x === 0) {
          ctx.moveTo(x, currentY);
        } else {
          ctx.lineTo(x, currentY);
        }
      }

      ctx.strokeStyle = ribbonColor;
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Traveling pulse bead on the trace
      const beadX = ((t * 2.4) % width);
      const beadCycle = (((beadX - t * 1.6) % waveLength) + waveLength) % waveLength / waveLength;
      let beadY = centerY;
      if (beadCycle >= 0.38 && beadCycle < 0.44) {
        beadY += -Math.sin((beadCycle - 0.38) * Math.PI / 0.06) * 72;
      }
      ctx.beginPath();
      ctx.arc(beadX, beadY, 4, 0, Math.PI * 2);
      ctx.fillStyle = pulseBeadColor;
      ctx.shadowColor = pulseBeadColor;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Ambient pulse glow on canvas center
      const gradient = ctx.createRadialGradient(width * 0.5, centerY, 10, width * 0.5, centerY, 200);
      gradient.addColorStop(0, isDark ? 'rgba(69, 217, 232, 0.09)' : 'rgba(0, 125, 143, 0.07)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      t += 1;
      if (!prefersReduced) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    if (prefersReduced) {
      render();
    } else {
      animationFrameId = requestAnimationFrame(render);
    }

    return () => {
      window.removeEventListener('resize', resize);
      if (observer) observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, mousePos]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: -1000, y: -1000 });
    setIsHovered(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[500px] sm:h-[560px] lg:h-[600px] rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-2xl select-none group"
    >
      {/* Background Interactive Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Top Left Header Telemetry */}
      <div className="absolute top-5 left-5 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-surface-glass)] border border-[var(--border-glass)] backdrop-blur-md text-[11px] font-mono">
        <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
        <span className="text-[var(--text-main)] font-semibold">Pulse Field Visualizer</span>
        <span className="text-[var(--text-muted)]">•</span>
        <span className="text-[var(--text-muted)]">25 mm/s • 10 mm/mV</span>
      </div>

      {/* 3 Floating Frosted Glass Vital Cards with real internal padding and tighter positioning */}
      
      {/* Floating Card 1: Max Stress HR */}
      <motion.div
        animate={isHovered ? { y: -3, x: -2 } : { y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-16 right-5 sm:right-7 z-20 p-5 rounded-2xl product-card-glass shadow-xl max-w-[220px] space-y-1.5"
      >
        <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
          <span>EXERCISE STRESS</span>
          <Zap className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="font-mono text-xl font-bold text-[var(--text-main)]">
          164 <span className="text-xs font-normal text-[var(--text-muted)]">BPM</span>
        </div>
        <p className="text-[11px] text-[var(--medical-green)] font-mono font-medium">
          ✓ 92% of target reserve
        </p>
      </motion.div>

      {/* Floating Card 2: ST-Slope Geometry (positioned close to the ECG trace) */}
      <motion.div
        animate={isHovered ? { y: 3, x: -2 } : { y: [0, 6, 0] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        className="absolute top-52 left-5 sm:left-7 z-20 p-5 rounded-2xl product-card-glass shadow-xl max-w-[230px] space-y-1.5"
      >
        <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
          <span>ST REPOLARIZATION</span>
          <Activity className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
        </div>
        <div className="font-mono text-base font-bold text-[var(--accent-cyan)]">
          Upsloping (0.0mm)
        </div>
        <p className="text-[11px] text-[var(--text-secondary)] font-mono">
          Benign exertional ST recovery
        </p>
      </motion.div>

      {/* Floating Card 3: KNN Evidence Consensus */}
      <motion.div
        animate={isHovered ? { y: -4, x: 2 } : { y: [0, -6, 0] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        className="absolute bottom-6 right-5 sm:right-7 z-20 p-5 rounded-2xl product-card-glass shadow-xl max-w-[240px] space-y-2"
      >
        <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
          <span>COHORT MATCH (k=5)</span>
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--medical-green)]" />
        </div>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((dot) => (
            <div
              key={dot}
              className="w-3 h-3 rounded-full bg-[var(--medical-green)] shadow-xs"
              title="Matched Patient Vector"
            />
          ))}
        </div>
        <div className="font-mono text-xs font-semibold text-[var(--medical-green)]">
          5 of 5 Consensus (Low Risk)
        </div>
      </motion.div>

      {/* Bottom Hint */}
      <div className="absolute bottom-4 left-6 z-10 text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)]" />
        <span>Wave ribbon deflects toward pointer</span>
      </div>
    </div>
  );
}
