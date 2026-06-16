import { useCurrentFrame, interpolate, Easing } from 'remotion';

// ── Frame timeline ─────────────────────────────────────────────────────────
const SLIDE_IN_END   = 75;
const SETTLE_END     = 120;
const ZOOM_END       = 195;
const ENGINE_END     = 360;
const ZOOM_OUT_START = ENGINE_END;
const ZOOM_OUT_END   = 420;
export const TOTAL   = 480;

// ── Helpers ────────────────────────────────────────────────────────────────
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

// ── Sporty Rim ─────────────────────────────────────────────────────────────
function SportRim({ cx, cy, r, frame }: { cx: number; cy: number; r: number; frame: number }) {
  const rpm = 1.6;
  const rot = (frame * rpm * 6) % 360;
  return (
    <g transform={`translate(${cx},${cy})`}>
      {/* Tyre */}
      <circle r={r} fill="#111118" />
      <circle r={r} fill="none" stroke="#2a2a3a" strokeWidth={r * 0.13} />
      {/* Rim outer */}
      <circle r={r * 0.78} fill="#0d0d16" stroke="#f59e0b" strokeWidth={r * 0.05} />
      {/* 5-spoke rim */}
      <g transform={`rotate(${rot})`} fill="none" stroke="#c0c8d8" strokeWidth={r * 0.09} strokeLinecap="round">
        {[0,72,144,216,288].map(d => (
          <line key={d} x1={0} y1={r*0.1} x2={0} y2={-(r*0.7)} transform={`rotate(${d})`} />
        ))}
      </g>
      {/* Rim inner shadow */}
      <circle r={r * 0.35} fill="#0a0a12" stroke="#f59e0b" strokeWidth={r * 0.07} />
      {/* Gold brake caliper hint */}
      <path d={`M ${r*0.55},${-r*0.1} A ${r*0.55},${r*0.55} 0 0,1 ${r*0.45},${-r*0.35}`}
        fill="none" stroke="#f59e0b" strokeWidth={r*0.18} opacity={0.8} />
      {/* Centre cap */}
      <circle r={r * 0.11} fill="#f59e0b" />
    </g>
  );
}

// ── Supercar Body ──────────────────────────────────────────────────────────
function SportCar({ engineVisible }: { engineVisible: number }) {
  const bodyGlow = engineVisible;

  return (
    <g>
      {/* Ground shadow */}
      <ellipse cx={450} cy={334} rx={230} ry={12} fill="rgba(0,0,0,0.5)" />

      {/* ── Underbody diffuser ── */}
      <path d="M180,316 L720,316 L730,330 L170,330 Z" fill="#0a0a12" />
      <line x1={185} y1={323} x2={725} y2={323} stroke="#f59e0b" strokeWidth={1} opacity={0.3} />

      {/* ── Main body — very low, wide wedge shape ── */}
      <path
        d={`
          M 170,316
          L 155,290 L 148,260 L 160,220
          C 175,195 210,178 260,170
          L 400,162 L 480,160
          C 530,160 570,165 600,175
          L 670,200 L 720,240 L 730,290 L 730,316
          Z
        `}
        fill={`rgb(${lerp(14,20,bodyGlow)},${lerp(14,22,bodyGlow)},${lerp(28,35,bodyGlow)})`}
        stroke="#1e2a4a"
        strokeWidth={1.5}
      />

      {/* ── Hood with engine bay cutout ── */}
      <path
        d={`
          M 260,170 L 480,160 L 480,210
          C 450,218 380,222 310,220
          L 260,218 Z
        `}
        fill="#0f1020"
        stroke="#1e2a4a"
        strokeWidth={1}
      />

      {/* Hood centre line / crease */}
      <line x1={260} y1={170} x2={480} y2={160} stroke="#1a2540" strokeWidth={2} />
      <path d="M 280,194 C 340,198 420,198 465,185" fill="none" stroke="#0a0c18" strokeWidth={4} />

      {/* Hood vents */}
      {[310,350,390,430].map(x => (
        <g key={x}>
          <rect x={x} y={176} width={24} height={8} rx={2} fill="#060810" stroke="#1e2a4a" strokeWidth={0.8} />
          {/* vent glow when engine hot */}
          <rect x={x+1} y={177} width={22} height={6} rx={1.5}
            fill={`rgba(245,158,11,${engineVisible * 0.35})`} />
        </g>
      ))}

      {/* ── Windscreen ── */}
      <path
        d="M 480,162 L 540,162 C 575,162 600,168 610,180 L 600,212 L 480,210 Z"
        fill="#0b1828"
        stroke="#1e2a4a"
        strokeWidth={1.2}
      />
      {/* Windscreen glare */}
      <path d="M 485,164 L 530,164 C 555,164 574,168 580,178 L 578,196 L 484,194 Z"
        fill="rgba(80,140,255,0.06)" />

      {/* ── Rear window ── */}
      <path
        d="M 610,180 L 660,195 L 680,240 L 600,235 L 600,212 Z"
        fill="#0b1828"
        stroke="#1e2a4a"
        strokeWidth={1.2}
      />

      {/* ── A/B/C pillars ── */}
      <line x1={480} y1={162} x2={480} y2={215} stroke="#0a0c16" strokeWidth={6} />
      <line x1={610} y1={180} x2={600} y2={235} stroke="#0a0c16" strokeWidth={5} />

      {/* ── Side air intake (NACA duct style) ── */}
      <path d="M 610,252 C 640,248 680,252 700,262 L 690,274 C 668,268 638,264 610,268 Z"
        fill="#060810" stroke="#1e2a4a" strokeWidth={1} />
      <path d="M 614,254 C 638,250 672,254 692,262 L 686,270 C 664,265 638,261 614,266 Z"
        fill="rgba(245,158,11,0.08)" />

      {/* ── Front splitter & fascia ── */}
      <path
        d="M 148,260 L 140,275 L 130,285 L 125,310 L 165,316 L 170,290 L 160,270 Z"
        fill="#0a0c16"
        stroke="#1e2a4a"
        strokeWidth={1}
      />
      {/* Front diffuser grille lines */}
      {[0,1,2,3].map(i => (
        <line key={i}
          x1={131} y1={288+i*5}
          x2={159} y2={285+i*5}
          stroke="#f59e0b" strokeWidth={0.8} opacity={0.4}
        />
      ))}

      {/* ── Headlight cluster ── */}
      <path
        d="M 150,225 L 165,218 L 200,215 L 220,225 L 215,248 L 155,248 Z"
        fill="#080c18"
        stroke="#1e2a4a"
        strokeWidth={1}
      />
      {/* DRL strip */}
      <path d="M 154,228 L 212,222" stroke="#f59e0b" strokeWidth={2.5} strokeLinecap="round" opacity={0.9} />
      {/* Main beam */}
      <path d="M 156,236 L 210,230 L 212,242 L 157,246 Z" fill="rgba(200,210,255,0.12)" />
      {/* Lens flare dot */}
      <circle cx={168} cy={238} r={4} fill="#f0f0ff" opacity={0.4} />

      {/* ── Tail lights ── */}
      <path
        d="M 720,240 L 734,248 L 738,290 L 720,295 Z"
        fill="#080810"
        stroke="#1e1a2e"
        strokeWidth={1}
      />
      <path d="M 722,244 L 734,250 L 735,285 L 721,290 Z" fill="rgba(200,20,20,0.4)" />
      {/* LED strip */}
      <line x1={721} y1={246} x2={733} y2={252} stroke="#ff2222" strokeWidth={2} strokeLinecap="round" opacity={0.8} />

      {/* ── Rear spoiler ── */}
      <rect x={685} y={155} width={50} height={6} rx={3} fill="#0e0e1e" stroke="#f59e0b" strokeWidth={0.8} />
      <rect x={700} y={161} width={4} height={18} fill="#0e0e1e" stroke="#1e2a3e" strokeWidth={0.8} />
      <rect x={717} y={161} width={4} height={18} fill="#0e0e1e" stroke="#1e2a3e" strokeWidth={0.8} />

      {/* ── Gold side accent stripe ── */}
      <path
        d="M 165,298 C 300,292 600,290 728,295"
        fill="none" stroke="#f59e0b" strokeWidth={2} opacity={0.5}
      />

      {/* ── Door line ── */}
      <path d="M 480,165 C 480,215 480,310 480,316" stroke="#151e32" strokeWidth={1.5} fill="none" />
      <path d="M 600,180 C 602,235 604,308 604,316" stroke="#151e32" strokeWidth={1.5} fill="none" />
    </g>
  );
}

// ── Engine Bay (rendered during zoom) ─────────────────────────────────────
function EngineBay({ frame, alpha }: { frame: number; alpha: number }) {
  const rpm = 14; // cycles per second * some factor
  const angle = (frame * (rpm / 60) * 360 * Math.PI) / 180;
  const crankR = 22;
  const rodLen = 55;

  type PistonData = { x: number; offset: number };
  const pistons: PistonData[] = [
    { x: 295, offset: 0 },
    { x: 355, offset: Math.PI / 2 },
    { x: 415, offset: Math.PI },
    { x: 475, offset: (3 * Math.PI) / 2 },
    { x: 535, offset: Math.PI / 4 },
    { x: 595, offset: (5 * Math.PI) / 4 },
  ];

  const crankCy = 280;

  return (
    <g opacity={alpha}>
      {/* Engine bay floor & walls */}
      <rect x={260} y={168} width={340} height={148} rx={4} fill="#060810" stroke="#f59e0b" strokeWidth={1} opacity={0.6} />
      {/* Ambient glow */}
      <rect x={265} y={172} width={330} height={140} rx={3} fill={`rgba(245,120,11,${0.04 + alpha * 0.06})`} />

      {/* Block cross-section */}
      <rect x={272} y={220} width={316} height={64} rx={3} fill="#0a0e1c" stroke="#1e293b" strokeWidth={1.5} />

      {/* Intake manifold */}
      <path d="M 272,220 C 300,206 560,206 588,220" fill="none" stroke="#1e3a5f" strokeWidth={5} strokeLinecap="round" />
      {[295,355,415,475,535].map(x => (
        <line key={x} x1={x} y1={220} x2={x} y2={212} stroke="#1e3a5f" strokeWidth={4} />
      ))}

      {/* Each piston */}
      {pistons.slice(0,5).map(({ x, offset }) => {
        const a = angle + offset;
        const pinX = x + Math.cos(a) * crankR;
        const pinY = crankCy + Math.sin(a) * crankR;
        const dx = x - pinX;
        const pistonY = pinY - Math.sqrt(Math.max(0, rodLen * rodLen - dx * dx));
        const atTdc = pistonY < crankCy - crankR - rodLen + 14;
        const flashA = atTdc ? 0.7 : 0;

        return (
          <g key={x}>
            {/* Combustion flash */}
            {atTdc && (
              <ellipse cx={x} cy={pistonY - 8} rx={16} ry={10}
                fill={`rgba(255,180,30,${flashA})`} />
            )}
            {/* Connecting rod */}
            <line x1={x} y1={pistonY + 14} x2={pinX} y2={pinY}
              stroke="#334155" strokeWidth={4} strokeLinecap="round" />
            {/* Piston */}
            <rect x={x - 16} y={pistonY - 14} width={32} height={28} rx={3}
              fill="#1e293b" stroke="#475569" strokeWidth={1.2} />
            {/* Ring */}
            <line x1={x-16} y1={pistonY - 6} x2={x+16} y2={pistonY - 6}
              stroke="#0a0f1e" strokeWidth={1.5} />
            {/* Cylinder head */}
            <rect x={x-19} y={220} width={38} height={8} rx={2}
              fill="#0a0e1c" stroke="#f59e0b" strokeWidth={1} />
          </g>
        );
      })}

      {/* Crankshaft backbone */}
      <line x1={272} y1={crankCy} x2={588} y2={crankCy}
        stroke="#0f172a" strokeWidth={8} />
      {pistons.slice(0,5).map(({ x, offset }) => {
        const a = angle + offset;
        const px = x + Math.cos(a) * crankR;
        const py = crankCy + Math.sin(a) * crankR;
        return (
          <g key={x}>
            <line x1={x} y1={crankCy} x2={px} y2={py}
              stroke="#334155" strokeWidth={3.5} strokeLinecap="round" />
            <circle cx={px} cy={py} r={4.5} fill="#1e293b" stroke="#f59e0b" strokeWidth={1} />
            <circle cx={x} cy={crankCy} r={5.5} fill="#0a0f1e" stroke="#f59e0b" strokeWidth={1} />
          </g>
        );
      })}

      {/* Oil pan */}
      <path d={`M268,${crankCy+14} L592,${crankCy+14} L590,${crankCy+26} Q430,${crankCy+38} 270,${crankCy+26} Z`}
        fill="#060810" stroke="#1e293b" strokeWidth={1.5} />

      {/* Label */}
      <text x={430} y={330} textAnchor="middle" fill="#f59e0b"
        fontSize={8} fontFamily="monospace" opacity={0.5} letterSpacing={3}>
        INLINE-6 · ENGINE BAY
      </text>
    </g>
  );
}

// ── Speed lines ────────────────────────────────────────────────────────────
function SpeedLines({ frame, opacity }: { frame: number; opacity: number }) {
  const lines = [
    { y: 195, len: 80 }, { y: 220, len: 120 }, { y: 245, len: 65 },
    { y: 268, len: 100 }, { y: 292, len: 50 },
  ];
  return (
    <g opacity={opacity * 0.4}>
      {lines.map((l, i) => {
        const offset = ((frame * 6 + i * 15) % 70) / 70;
        const x = 140 - offset * 80;
        return (
          <line key={i} x1={x} y1={l.y} x2={x - l.len} y2={l.y}
            stroke="#f59e0b" strokeWidth={1.2} strokeLinecap="round"
            opacity={0.6 - offset * 0.5} />
        );
      })}
    </g>
  );
}

// ── Road ───────────────────────────────────────────────────────────────────
function Road({ frame, opacity }: { frame: number; opacity: number }) {
  const dash = -(frame * 6) % 80;
  return (
    <g opacity={opacity}>
      <rect x={0} y={330} width={900} height={50} fill="#080a10" />
      <line x1={0} y1={330} x2={900} y2={330} stroke="#1e2a4a" strokeWidth={1.5} />
      <line x1={0} y1={340} x2={900} y2={340}
        stroke="#f59e0b" strokeWidth={1.5}
        strokeDasharray="55 25" strokeDashoffset={dash} opacity={0.3} />
    </g>
  );
}

// ── Particle sparks (engine running) ──────────────────────────────────────
function Sparks({ frame, alpha }: { frame: number; alpha: number }) {
  if (alpha < 0.1) return null;
  const sparks = [
    { bx: 295, by: 222, dx: -8, dy: -18, period: 18, delay: 0 },
    { bx: 355, by: 222, dx: 6,  dy: -22, period: 15, delay: 5 },
    { bx: 415, by: 222, dx: -4, dy: -20, period: 20, delay: 10 },
    { bx: 475, by: 222, dx: 9,  dy: -16, period: 17, delay: 3 },
    { bx: 535, by: 222, dx: -6, dy: -24, period: 19, delay: 8 },
  ];
  return (
    <g opacity={alpha}>
      {sparks.map((s, i) => {
        const t = ((frame + s.delay * 3) % s.period) / s.period;
        const x = s.bx + s.dx * t;
        const y = s.by + s.dy * t;
        const a = 1 - t;
        return (
          <circle key={i} cx={x} cy={y} r={1.5}
            fill="#fbbf24" opacity={a * 0.9} />
        );
      })}
    </g>
  );
}

// ── Main composition ───────────────────────────────────────────────────────
export default function CinematicScene() {
  const frame = useCurrentFrame();

  // ── Car slide-in X offset ──
  const carX = interpolate(frame, [0, SLIDE_IN_END], [900, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // ── Vertical settle bounce ──
  const carBounce = interpolate(
    frame,
    [SLIDE_IN_END, SLIDE_IN_END + 10, SLIDE_IN_END + 20, SLIDE_IN_END + 30],
    [0, -10, 4, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) }
  );

  // ── ViewBox camera zoom into engine bay ──
  const vbX = interpolate(frame, [ZOOM_END - 60, ZOOM_END], [0, 240], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic),
  });
  const vbY = interpolate(frame, [ZOOM_END - 60, ZOOM_END], [0, 120], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic),
  });
  const vbW = interpolate(frame, [ZOOM_END - 60, ZOOM_END], [900, 400], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic),
  });
  const vbH = interpolate(frame, [ZOOM_END - 60, ZOOM_END], [380, 220], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic),
  });

  // ── Zoom back out ──
  const vbXOut = interpolate(frame, [ZOOM_OUT_START, ZOOM_OUT_END], [vbX, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic),
  });
  const vbYOut = interpolate(frame, [ZOOM_OUT_START, ZOOM_OUT_END], [vbY, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic),
  });
  const vbWOut = interpolate(frame, [ZOOM_OUT_START, ZOOM_OUT_END], [400, 900], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic),
  });
  const vbHOut = interpolate(frame, [ZOOM_OUT_START, ZOOM_OUT_END], [220, 380], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic),
  });

  // Choose active viewBox
  const isZoomingOut = frame >= ZOOM_OUT_START;
  const isZoomed = frame >= ZOOM_END && frame < ZOOM_OUT_START;
  const finalVbX = isZoomingOut ? vbXOut : isZoomed ? vbX : vbX;
  const finalVbY = isZoomingOut ? vbYOut : isZoomed ? vbY : vbY;
  const finalVbW = isZoomingOut ? vbWOut : isZoomed ? 400 : vbW;
  const finalVbH = isZoomingOut ? vbHOut : isZoomed ? 220 : vbH;

  // ── Engine bay alpha (visible during zoom) ──
  const engineAlpha = interpolate(frame,
    [ZOOM_END - 20, ZOOM_END + 20, ENGINE_END, ENGINE_END + 30],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // ── Speed lines fade out as we slow to stop ──
  const speedOpacity = interpolate(frame, [0, SLIDE_IN_END, SETTLE_END], [1, 0.6, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // ── Road opacity (fades during engine close-up) ──
  const roadOpacity = interpolate(frame, [ZOOM_END - 40, ZOOM_END], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const roadOpacityOut = interpolate(frame, [ZOOM_OUT_START + 20, ZOOM_OUT_END], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const wheelR = 38;

  return (
    <svg
      viewBox={`${finalVbX} ${finalVbY} ${finalVbW} ${finalVbH}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="bg" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#0c1428" />
          <stop offset="100%" stopColor="#04060e" />
        </radialGradient>
        <radialGradient id="engineGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="rgba(245,120,11,0.18)" />
          <stop offset="100%" stopColor="rgba(245,120,11,0)" />
        </radialGradient>
        <filter id="bloom" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width={900} height={380} fill="url(#bg)" />

      {/* Engine glow overlay during close-up */}
      {engineAlpha > 0.05 && (
        <ellipse cx={430} cy={265} rx={200} ry={110}
          fill={`rgba(245,120,11,${engineAlpha * 0.12})`} />
      )}

      <Road frame={frame} opacity={Math.max(roadOpacity, roadOpacityOut)} />

      {/* Car group — translated by slide-in offset + bounce */}
      <g transform={`translate(${carX}, ${carBounce})`}>
        <SportRim cx={215} cy={330} r={wheelR} frame={frame} />
        <SportRim cx={670} cy={330} r={wheelR} frame={frame} />
        <SportCar engineVisible={engineAlpha} />
        <EngineBay frame={frame} alpha={engineAlpha} />
        <Sparks frame={frame} alpha={engineAlpha} />
        <SpeedLines frame={frame} opacity={speedOpacity} />
      </g>

      {/* Scan-line overlay (subtle) */}
      <rect width={900} height={380}
        fill="url(#bg)" opacity={0.04}
        style={{ mixBlendMode: 'multiply' }} />
    </svg>
  );
}
