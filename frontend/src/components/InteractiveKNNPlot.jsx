import React, { useState, useMemo } from 'react';

// Representative training points in standardized 2D projection
const SAMPLE_TRAIN_POINTS = [
  // Low Risk (label: 0)
  { id: 1, x: 25, y: 35, label: 0, bp: 118, hr: 168 },
  { id: 2, x: 30, y: 45, label: 0, bp: 122, hr: 160 },
  { id: 3, x: 20, y: 55, label: 0, bp: 114, hr: 172 },
  { id: 4, x: 40, y: 30, label: 0, bp: 125, hr: 155 },
  { id: 5, x: 35, y: 65, label: 0, bp: 116, hr: 165 },
  { id: 6, x: 45, y: 50, label: 0, bp: 128, hr: 150 },
  { id: 7, x: 50, y: 38, label: 0, bp: 130, hr: 148 },
  { id: 8, x: 55, y: 25, label: 0, bp: 120, hr: 158 },
  // Elevated Risk (label: 1)
  { id: 9, x: 60, y: 62, label: 1, bp: 145, hr: 130 },
  { id: 10, x: 65, y: 72, label: 1, bp: 152, hr: 120 },
  { id: 11, x: 70, y: 55, label: 1, bp: 158, hr: 115 },
  { id: 12, x: 75, y: 82, label: 1, bp: 164, hr: 108 },
  { id: 13, x: 80, y: 68, label: 1, bp: 160, hr: 118 },
  { id: 14, x: 85, y: 78, label: 1, bp: 170, hr: 105 },
  { id: 15, x: 65, y: 45, label: 1, bp: 142, hr: 135 },
  { id: 16, x: 58, y: 75, label: 1, bp: 148, hr: 125 },
  { id: 17, x: 78, y: 42, label: 1, bp: 155, hr: 128 },
  { id: 18, x: 88, y: 60, label: 1, bp: 168, hr: 112 },
];

export default function InteractiveKNNPlot() {
  const [queryPoint, setQueryPoint] = useState({ x: 54, y: 52 });
  const [kValue, setKValue] = useState(5);

  // Compute nearest neighbors in coordinate space
  const { nearestNeighbors, radius, positiveVotes, negativeVotes } = useMemo(() => {
    const withDist = SAMPLE_TRAIN_POINTS.map((pt) => {
      const dx = pt.x - queryPoint.x;
      const dy = pt.y - queryPoint.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return { ...pt, dist };
    });

    withDist.sort((a, b) => a.dist - b.dist);
    const topK = withDist.slice(0, kValue);
    const r = topK.length > 0 ? topK[topK.length - 1].dist : 0;
    const pos = topK.filter((p) => p.label === 1).length;
    const neg = topK.filter((p) => p.label === 0).length;

    return {
      nearestNeighbors: topK,
      radius: r,
      positiveVotes: pos,
      negativeVotes: neg,
    };
  }, [queryPoint, kValue]);

  const handleSvgClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;
    setQueryPoint({
      x: Math.max(10, Math.min(90, Math.round(clickX))),
      y: Math.max(10, Math.min(90, Math.round(clickY))),
    });
  };

  const handleKeyDown = (e) => {
    const step = 4;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setQueryPoint((p) => ({ ...p, y: Math.max(10, p.y - step) }));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setQueryPoint((p) => ({ ...p, y: Math.min(90, p.y + step) }));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setQueryPoint((p) => ({ ...p, x: Math.max(10, p.x - step) }));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setQueryPoint((p) => ({ ...p, x: Math.min(90, p.x + step) }));
    }
  };

  const consensusVerdict = positiveVotes > negativeVotes ? 'Elevated Risk' : 'Low Risk';
  const consensusPct = Math.round((Math.max(positiveVotes, negativeVotes) / kValue) * 100);

  return (
    <div className="product-card-glass p-5 sm:p-6 space-y-4">
      {/* Top Controls & Explanation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
        <div>
          <h4 className="font-display font-semibold text-base text-[var(--text-main)] flex items-center gap-2">
            <span>2D Feature-Space Nearest Neighbor Simulator</span>
          </h4>
          <p className="text-xs text-[var(--text-secondary)]">
            Click coordinate plane or use arrow keys to position a patient query vector.
          </p>
        </div>

        {/* k-Selector Toggle */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[var(--text-muted)]">Neighbors (k):</span>
          {[3, 5, 7].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKValue(k)}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                kValue === k
                  ? 'bg-[var(--accent-cyan)] text-white font-bold shadow-xs'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
              }`}
            >
              k={k}
            </button>
          ))}
        </div>
      </div>

      {/* Screen Reader Alternative Announcement */}
      <div className="sr-only" aria-live="polite">
        Query patient positioned at X {queryPoint.x}, Y {queryPoint.y}. Selected k is {kValue}. Nearest neighbors vote {positiveVotes} elevated risk, {negativeVotes} low risk. Result: {consensusVerdict}.
      </div>

      {/* SVG Coordinate Space */}
      <div
        tabIndex={0}
        role="application"
        aria-label="Interactive 2D patient feature plot. Use arrow keys to reposition patient query vector."
        onKeyDown={handleKeyDown}
        className="relative aspect-video sm:aspect-[2.1/1] w-full border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--bg-canvas)] cursor-crosshair select-none blueprint-grid-canvas focus:outline-2 focus:outline-[var(--accent-cyan)]"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          onClick={handleSvgClick}
        >
          {/* Nearest Neighbor Boundary Radius Circle */}
          <circle
            cx={queryPoint.x}
            cy={queryPoint.y}
            r={radius}
            fill="rgba(69, 217, 232, 0.08)"
            stroke="var(--accent-cyan)"
            strokeWidth="0.75"
            strokeDasharray="2 2"
          />

          {/* Connection Lines from Query to Nearest Neighbors */}
          {nearestNeighbors.map((nb) => (
            <line
              key={`line-${nb.id}`}
              x1={queryPoint.x}
              y1={queryPoint.y}
              x2={nb.x}
              y2={nb.y}
              stroke={nb.label === 1 ? 'var(--coral-red)' : 'var(--medical-green)'}
              strokeWidth="0.8"
              strokeDasharray="1.5 1.5"
              className="opacity-70"
            />
          ))}

          {/* Training Points */}
          {SAMPLE_TRAIN_POINTS.map((pt) => {
            const isNeighbor = nearestNeighbors.some((n) => n.id === pt.id);
            const isPositive = pt.label === 1;

            return (
              <g key={`pt-${pt.id}`}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isNeighbor ? 2.5 : 1.8}
                  fill={isPositive ? 'var(--coral-red)' : 'var(--medical-green)'}
                  stroke="#FFFFFF"
                  strokeWidth={isNeighbor ? 0.75 : 0.4}
                  className="transition-all duration-200"
                  style={{
                    filter: isNeighbor
                      ? isPositive
                        ? 'drop-shadow(0 0 3px #FF5267)'
                        : 'drop-shadow(0 0 3px #48D597)'
                      : 'none',
                  }}
                />
              </g>
            );
          })}

          {/* User Query Point */}
          <circle
            cx={queryPoint.x}
            cy={queryPoint.y}
            r="3.2"
            fill="#FFFFFF"
            stroke="var(--accent-cyan)"
            strokeWidth="1.2"
            className="filter drop-shadow-[0_0_6px_#45D9E8]"
          />
        </svg>

        {/* Floating Mini Legend Inside Plot */}
        <div className="absolute top-2 left-2 p-2 rounded-lg bg-[var(--bg-surface-glass)]/90 backdrop-blur-md border border-[var(--border-subtle)] text-[10px] font-mono space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--medical-green)]" />
            <span className="text-[var(--text-secondary)]">Historical Healthy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--coral-red)]" />
            <span className="text-[var(--text-secondary)]">Historical Heart Disease</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white border border-[var(--accent-cyan)]" />
            <span className="text-[var(--text-main)] font-semibold">Active Query Vector</span>
          </div>
        </div>
      </div>

      {/* Real-time Voting Results Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-mono space-y-1">
          <span className="text-[10px] uppercase text-[var(--text-muted)]">Active Coordinate</span>
          <div className="font-bold text-[var(--text-main)]">
            X: {queryPoint.x} • Y: {queryPoint.y}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-mono space-y-1">
          <span className="text-[10px] uppercase text-[var(--text-muted)]">Neighbor Vote Tally</span>
          <div className="font-bold flex items-center gap-2">
            <span className="text-[var(--coral-red)]">{positiveVotes} CAD (+)</span>
            <span>•</span>
            <span className="text-[var(--medical-green)]">{negativeVotes} Healthy (-)</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-mono space-y-1">
          <span className="text-[10px] uppercase text-[var(--text-muted)]">Majority Verdict</span>
          <div className={`font-bold ${positiveVotes > negativeVotes ? 'text-[var(--coral-red)]' : 'text-[var(--medical-green)]'}`}>
            {consensusVerdict} ({consensusPct}% Agreement)
          </div>
        </div>
      </div>
    </div>
  );
}
