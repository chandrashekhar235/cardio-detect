import React, { useRef, useEffect } from 'react';
import {
  Activity,
  CheckCircle2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function PatientMonitorPanel({ formValues }) {
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  const hr = Number(formValues.MaxHR) || 145;
  const bp = Number(formValues.RestingBP) || 130;
  const chol = Number(formValues.Cholesterol) || 0;
  const oldpeak = Number(formValues.Oldpeak) || 0;
  const stSlope = formValues.ST_Slope || 'Flat';
  const angina = formValues.ExerciseAngina === 'Y';
  const age = Number(formValues.Age) || 54;

  // Real-time calculation of abnormal markers
  const abnormalMarkers = [];
  if (bp >= 140) abnormalMarkers.push(`Stage 2 Hypertension (${bp} mmHg)`);
  else if (bp >= 130) abnormalMarkers.push(`Stage 1 Hypertension (${bp} mmHg)`);

  if (chol >= 240) abnormalMarkers.push(`High Serum Cholesterol (${chol} mg/dL)`);
  else if (chol >= 200) abnormalMarkers.push(`Borderline Cholesterol (${chol} mg/dL)`);

  if (oldpeak >= 2.0) abnormalMarkers.push(`Marked ST Depression (${oldpeak} mm)`);
  else if (oldpeak >= 1.0) abnormalMarkers.push(`Mild ST Depression (${oldpeak} mm)`);

  if (stSlope === 'Flat') abnormalMarkers.push('Flat Exercise ST Slope (Ischemic)');
  else if (stSlope === 'Down') abnormalMarkers.push('Downsloping ST Slope (Severe CAD)');

  if (angina) abnormalMarkers.push('Exertional Angina Provoked');

  if (formValues.FastingBS === 1) abnormalMarkers.push('Fasting Blood Glucose > 120 mg/dL');

  // Real-time canvas ECG trace drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerY = height * 0.52;

    // Heart rate determines sweep speed (e.g. 60 bpm = slower, 180 bpm = faster)
    const bpmNorm = Math.min(220, Math.max(50, hr));
    const speed = (bpmNorm / 60) * 1.8;

    let xPos = 0;
    const points = [];
    const maxPoints = Math.floor(width);

    // Color definitions
    const isDark = theme === 'dark';
    const traceColor = isDark ? '#45D9E8' : '#007D8F';
    const gridLineColor = isDark ? 'rgba(69, 217, 232, 0.08)' : 'rgba(0, 125, 143, 0.08)';

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle background medical grid lines
      ctx.strokeStyle = gridLineColor;
      ctx.lineWidth = 1;
      const step = 20;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Generate dynamic synthetic ECG curve point based on current inputs
      // P wave -> Q dip -> R spike -> S dip -> ST segment (affected by oldpeak & slope) -> T wave
      const cycleLen = (width / (bpmNorm / 25));
      const phase = (xPos % cycleLen) / cycleLen;
      let yOffset = 0;

      // P wave
      if (phase > 0.1 && phase < 0.2) {
        yOffset = -Math.sin((phase - 0.1) * Math.PI * 10) * 7;
      }
      // Q dip
      else if (phase >= 0.28 && phase < 0.3) {
        yOffset = 8;
      }
      // R spike
      else if (phase >= 0.3 && phase < 0.35) {
        yOffset = -Math.sin((phase - 0.3) * Math.PI / 0.05) * 58;
      }
      // S dip
      else if (phase >= 0.35 && phase < 0.38) {
        yOffset = 14;
      }
      // ST-segment & T wave (heavily reactive to oldpeak & stSlope)
      else if (phase >= 0.38 && phase < 0.65) {
        const stDepression = oldpeak * 5; // ST depression in px
        let slopeFactor = 0;
        if (stSlope === 'Down') slopeFactor = (phase - 0.38) * 20;
        else if (stSlope === 'Up') slopeFactor = -(phase - 0.38) * 15;

        // Base depression shift
        const baselineShift = stDepression + slopeFactor;

        // T wave on top of depressed segment
        const tWave = Math.sin((phase - 0.42) * Math.PI / 0.23) * (angina ? 10 : 16);
        yOffset = baselineShift - tWave;
      }

      points.push({ x: xPos, y: centerY + yOffset });
      if (points.length > maxPoints) {
        points.shift();
      }

      // Render connected trace line
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        if (i === 0) ctx.moveTo(points[i].x, points[i].y);
        else ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.strokeStyle = traceColor;
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Lead sweep head point
      if (points.length > 0) {
        const last = points[points.length - 1];
        ctx.beginPath();
        ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      }

      xPos += speed;
      if (xPos >= width) {
        xPos = 0;
        points.length = 0;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [hr, bp, chol, oldpeak, stSlope, angina, theme]);

  return (
    <div className="product-card-glass p-5 sm:p-6 space-y-6 sticky top-20 border-t-4 border-t-[var(--accent-cyan)] shadow-xl">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--medical-green)] shadow-xs animate-pulse" />
          <h3 className="font-display font-bold text-sm tracking-tight uppercase text-[var(--text-main)]">
            Patient Monitor Console
          </h3>
        </div>
        <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase">
          Lead II • Standardized Telemetry
        </span>
      </div>

      {/* Signature Reactive ECG Screen */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--accent-cyan)]" />
            <span className="font-bold text-[var(--text-main)] text-sm">{hr} BPM</span>
            <span className="text-[10px] text-[var(--text-muted)]">(Bruce Target)</span>
          </div>
          <span className="text-[11px] text-[var(--text-muted)]">
            ST: {oldpeak.toFixed(1)}mm ({stSlope})
          </span>
        </div>

        <div className="relative w-full h-32 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full block" />
          <div className="absolute bottom-2 left-3 font-mono text-[9px] text-[var(--text-muted)] tracking-wider">
            25 mm/s • 10 mm/mV • Filter 0.05-150Hz
          </div>
        </div>
      </div>

      {/* Real-time Zone Gauges */}
      <div className="space-y-3.5 pt-1">
        
        {/* Blood Pressure Gauge */}
        <div className="space-y-1.5 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)]">Resting Systolic BP:</span>
            <span
              className={`font-bold ${
                bp >= 140
                  ? 'text-[var(--coral-red)]'
                  : bp >= 130
                  ? 'text-amber-500'
                  : bp >= 120
                  ? 'text-amber-400'
                  : 'text-[var(--medical-green)]'
              }`}
            >
              {bp} mmHg {bp >= 140 ? '(Stage 2)' : bp >= 130 ? '(Stage 1)' : '(Normal)'}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[var(--border-subtle)] overflow-hidden flex">
            <div className="w-1/4 h-full bg-[var(--medical-green)]/40" />
            <div className="w-1/4 h-full bg-amber-400/40" />
            <div className="w-1/4 h-full bg-amber-500/40" />
            <div className="w-1/4 h-full bg-[var(--coral-red)]/40" />
          </div>
        </div>

        {/* Serum Cholesterol Gauge */}
        <div className="space-y-1.5 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)]">Serum Cholesterol:</span>
            <span
              className={`font-bold ${
                chol === 0
                  ? 'text-[var(--accent-cyan)]'
                  : chol >= 240
                  ? 'text-[var(--coral-red)]'
                  : chol >= 200
                  ? 'text-amber-500'
                  : 'text-[var(--medical-green)]'
              }`}
            >
              {chol === 0 ? 'Median Imputed' : `${chol} mg/dL`}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[var(--border-subtle)] overflow-hidden flex">
            <div className="w-1/3 h-full bg-[var(--medical-green)]/40" />
            <div className="w-1/3 h-full bg-amber-400/40" />
            <div className="w-1/3 h-full bg-[var(--coral-red)]/40" />
          </div>
        </div>

        {/* Heart Rate Reserve (% of Max) */}
        <div className="space-y-1.5 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)]">Age Target Reserve:</span>
            <span className="font-bold text-[var(--text-main)]">
              {Math.round((hr / Math.max(120, 220 - age)) * 100)}% of Max
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[var(--border-subtle)] overflow-hidden">
            <div
              className="h-full bg-[var(--accent-cyan)] transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round((hr / Math.max(120, 220 - age)) * 100))}%` }}
            />
          </div>
        </div>

      </div>

      {/* Dynamic Biomarkers Watchlist Tally */}
      <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[var(--text-secondary)]">Out-of-Range Indicators:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded text-[11px] ${
              abnormalMarkers.length >= 3
                ? 'bg-[var(--coral-red-subtle)] text-[var(--coral-red)] border border-[var(--coral-red)]/30'
                : abnormalMarkers.length > 0
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                : 'bg-[var(--medical-green-subtle)] text-[var(--medical-green)] border border-[var(--medical-green)]/30'
            }`}
          >
            {abnormalMarkers.length} of 11 Flagged
          </span>
        </div>

        {abnormalMarkers.length === 0 ? (
          <p className="text-[11px] text-[var(--medical-green)] flex items-center gap-1.5 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>All monitored biomarkers within healthy clinical boundaries.</span>
          </p>
        ) : (
          <ul className="space-y-1 text-[11px] text-[var(--text-secondary)] font-mono">
            {abnormalMarkers.slice(0, 4).map((m, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span className="truncate">{m}</span>
              </li>
            ))}
            {abnormalMarkers.length > 4 && (
              <li className="text-[10px] text-[var(--text-muted)] italic">
                + {abnormalMarkers.length - 4} additional physiological risk markers
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Institutional Calibration Notice */}
      <div className="text-[10px] font-mono text-[var(--text-muted)] text-center leading-relaxed">
        Normalized against UCI standard distribution $(\mu=0, \sigma=1)$
      </div>
    </div>
  );
}
