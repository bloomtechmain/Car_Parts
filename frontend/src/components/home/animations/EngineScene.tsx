import { useCurrentFrame, useVideoConfig } from 'remotion';

// ── Crankshaft ─────────────────────────────────────────────────────────────
function Crankshaft({ cx, cy }: { cx: number; cy: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rpm = 800;
  const angle = (frame / fps) * (rpm / 60) * 360;

  // 4 crank throws, 90° apart
  const throws = [0, 90, 180, 270].map((offset) => {
    const rad = ((angle + offset) * Math.PI) / 180;
    return { x: Math.cos(rad) * 18, y: Math.sin(rad) * 18 };
  });

  return (
    <g>
      {/* Crank shaft main journal */}
      <circle cx={cx} cy={cy} r={12} fill="#0a0f1e" stroke="#f59e0b" strokeWidth={1.5} />
      {/* Throws + pins */}
      {throws.map((t, i) => (
        <g key={i}>
          <line
            x1={cx} y1={cy}
            x2={cx + t.x} y2={cy + t.y}
            stroke="#334155" strokeWidth={3} strokeLinecap="round"
          />
          <circle cx={cx + t.x} cy={cy + t.y} r={4} fill="#1e293b" stroke="#f59e0b" strokeWidth={1} />
        </g>
      ))}
      <circle cx={cx} cy={cy} r={5} fill="#f59e0b" />
    </g>
  );
}

// ── Single piston + connecting rod ────────────────────────────────────────
function PistonCylinder({
  x,
  crankCx,
  crankCy,
  crankOffset,
}: {
  x: number;
  crankCx: number;
  crankCy: number;
  crankOffset: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rpm = 800;
  const angle = ((frame / fps) * (rpm / 60) * 360 + crankOffset) * (Math.PI / 180);

  const crankRadius = 18;
  const rodLength = 52;

  // Pin position on crank
  const pinX = crankCx + Math.cos(angle) * crankRadius;
  const pinY = crankCy + Math.sin(angle) * crankRadius;

  // Piston Y (constrained to x axis of cylinder)
  const dx = x - pinX;
  const discriminant = rodLength * rodLength - dx * dx;
  const pistonY = pinY - Math.sqrt(Math.max(0, discriminant));

  const pistonTop = pistonY - 14;
  const pistonH = 28;
  const pistonW = 34;

  // Combustion flash at TDC
  const tdc = pistonY < crankCy - crankRadius - rodLength + 8;
  const flashOpacity = tdc ? 0.55 : 0;

  return (
    <g>
      {/* Cylinder walls */}
      <rect
        x={x - pistonW / 2 - 5}
        y={35}
        width={pistonW + 10}
        height={crankCy - 35 - 5}
        rx={3}
        fill="none"
        stroke="#1e293b"
        strokeWidth={3}
      />
      {/* Liner inner highlight */}
      <rect
        x={x - pistonW / 2}
        y={38}
        width={2}
        height={crankCy - 46}
        rx={1}
        fill="#0f172a"
        opacity={0.6}
      />

      {/* Combustion flash */}
      <rect
        x={x - pistonW / 2}
        y={38}
        width={pistonW}
        height={pistonTop - 38}
        fill="#fbbf24"
        opacity={flashOpacity}
        rx={2}
      />

      {/* Connecting rod */}
      <line
        x1={x} y1={pistonY + pistonH / 2}
        x2={pinX} y2={pinY}
        stroke="#334155"
        strokeWidth={4}
        strokeLinecap="round"
      />

      {/* Piston */}
      <rect
        x={x - pistonW / 2}
        y={pistonTop}
        width={pistonW}
        height={pistonH}
        rx={4}
        fill="#1e293b"
        stroke="#475569"
        strokeWidth={1.5}
      />
      {/* Piston ring grooves */}
      {[5, 10].map((dy) => (
        <line
          key={dy}
          x1={x - pistonW / 2}
          y1={pistonTop + dy}
          x2={x + pistonW / 2}
          y2={pistonTop + dy}
          stroke="#0f172a"
          strokeWidth={1.5}
        />
      ))}
      {/* Piston pin */}
      <circle cx={x} cy={pistonY + 5} r={4} fill="#0f172a" stroke="#64748b" strokeWidth={1} />

      {/* Cylinder head (top) */}
      <rect
        x={x - pistonW / 2 - 5}
        y={30}
        width={pistonW + 10}
        height={10}
        rx={2}
        fill="#0f172a"
        stroke="#f59e0b"
        strokeWidth={1.5}
      />
      {/* Valve dots */}
      <circle cx={x - 6} cy={35} r={2.5} fill="#334155" stroke="#64748b" strokeWidth={0.8} />
      <circle cx={x + 6} cy={35} r={2.5} fill="#334155" stroke="#64748b" strokeWidth={0.8} />
    </g>
  );
}

// ── Oil pan ───────────────────────────────────────────────────────────────
function OilPan({ cy }: { cy: number }) {
  return (
    <path
      d={`M60,${cy} L540,${cy} L540,${cy + 22} Q300,${cy + 36} 60,${cy + 22} Z`}
      fill="#0a0f1e"
      stroke="#1e293b"
      strokeWidth={2}
    />
  );
}

// ── Engine block ──────────────────────────────────────────────────────────
function EngineBlock({ crankCy }: { crankCy: number }) {
  return (
    <>
      {/* Block sides */}
      <rect x={55} y={30} width={12} height={crankCy - 20} rx={3} fill="#0a0f1e" stroke="#1e293b" strokeWidth={2} />
      <rect x={533} y={30} width={12} height={crankCy - 20} rx={3} fill="#0a0f1e" stroke="#1e293b" strokeWidth={2} />
      {/* Main bearing caps */}
      {[120, 200, 280, 360, 440].map((bx) => (
        <rect key={bx} x={bx - 8} y={crankCy - 8} width={16} height={14} rx={2}
          fill="#0a0f1e" stroke="#1e293b" strokeWidth={1.5} />
      ))}
      {/* Gold accent stripe */}
      <line x1={67} y1={30} x2={533} y2={30} stroke="#f59e0b" strokeWidth={1.5} opacity={0.4} />
    </>
  );
}

// ── Camshaft indicator ────────────────────────────────────────────────────
function Camshaft() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rpm = 800;
  const angle = (frame / fps) * (rpm / 60) * 180; // cams spin at half crank speed

  return (
    <g>
      <line x1={80} y1={22} x2={520} y2={22} stroke="#1e293b" strokeWidth={3} />
      {[120, 200, 280, 360, 440].map((cx, i) => (
        <g key={i} transform={`translate(${cx},22) rotate(${angle + i * 90})`}>
          <ellipse rx={6} ry={3.5} fill="#334155" stroke="#f59e0b" strokeWidth={0.8} />
        </g>
      ))}
    </g>
  );
}

// ── Main composition ───────────────────────────────────────────────────────
export default function EngineScene() {
  const crankCy = 145;
  const pistonXPositions = [120, 200, 280, 360, 440];
  const firingOrder = [0, 270, 180, 90]; // 4-cyl firing order offsets

  return (
    <svg
      viewBox="0 0 600 210"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <radialGradient id="engBg" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#0c1524" />
          <stop offset="100%" stopColor="#050810" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width={600} height={210} fill="url(#engBg)" />

      <Camshaft />
      <EngineBlock crankCy={crankCy} />

      {/* 4 cylinders (using first 4 positions) */}
      {pistonXPositions.slice(0, 4).map((px, i) => (
        <PistonCylinder
          key={i}
          x={px + 30}
          crankCx={px + 30}
          crankCy={crankCy}
          crankOffset={firingOrder[i]}
        />
      ))}

      {/* Crankshaft spans all journals */}
      <line x1={80} y1={crankCy} x2={520} y2={crankCy} stroke="#0f172a" strokeWidth={6} />
      {pistonXPositions.slice(0, 4).map((px, i) => (
        <Crankshaft key={i} cx={px + 30} cy={crankCy} />
      ))}

      <OilPan cy={crankCy + 14} />

      {/* Label */}
      <text
        x={300} y={200}
        textAnchor="middle"
        fill="#f59e0b"
        fontSize={9}
        fontFamily="monospace"
        opacity={0.5}
        letterSpacing={2}
      >
        4-CYLINDER ENGINE
      </text>
    </svg>
  );
}
