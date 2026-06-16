import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

// ── Wheel ──────────────────────────────────────────────────────────────────
function Wheel({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rotation = (frame / fps) * 360 * 1.4;

  return (
    <g transform={`translate(${cx},${cy})`}>
      {/* Tyre */}
      <circle r={r} fill="#1a1a2e" stroke="#4a4a6a" strokeWidth={r * 0.12} />
      {/* Rim */}
      <circle r={r * 0.62} fill="#0f172a" stroke="#f59e0b" strokeWidth={r * 0.06} />
      {/* Spokes */}
      <g transform={`rotate(${rotation})`} stroke="#f59e0b" strokeWidth={r * 0.07} strokeLinecap="round">
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <line
            key={deg}
            x1={0} y1={0}
            x2={0} y2={-(r * 0.55)}
            transform={`rotate(${deg})`}
          />
        ))}
      </g>
      {/* Hub */}
      <circle r={r * 0.13} fill="#f59e0b" />
    </g>
  );
}

// ── Car body ───────────────────────────────────────────────────────────────
function CarBody() {
  return (
    <g>
      {/* Shadow */}
      <ellipse cx={300} cy={208} rx={190} ry={10} fill="rgba(0,0,0,0.35)" />

      {/* Underbody */}
      <rect x={110} y={178} width={382} height={28} rx={6} fill="#0a0f1e" />

      {/* Main body */}
      <path
        d="M130,178 L130,135 C130,135 160,80 220,72 L310,68 C340,68 380,72 410,90 L470,135 L490,178 Z"
        fill="#0f172a"
        stroke="#1e3a5f"
        strokeWidth={2}
      />

      {/* Body highlight (top edge) */}
      <path
        d="M145,155 C165,110 195,84 230,78 L310,74 C336,74 370,80 400,98 L455,140"
        fill="none"
        stroke="#1e4a7f"
        strokeWidth={1.5}
        opacity={0.7}
      />

      {/* Windshield */}
      <path
        d="M220,76 L208,138 L320,138 L316,72 Z"
        fill="#0d2a4a"
        stroke="#1e3a5f"
        strokeWidth={1.5}
      />
      {/* Windshield glare */}
      <path
        d="M226,80 L216,128 L252,128 L254,76 Z"
        fill="rgba(100,160,255,0.08)"
      />

      {/* Rear window */}
      <path
        d="M320,138 L316,72 L368,76 L400,138 Z"
        fill="#0d2a4a"
        stroke="#1e3a5f"
        strokeWidth={1.5}
      />
      {/* Rear glare */}
      <path
        d="M328,130 L325,80 L356,83 L382,130 Z"
        fill="rgba(100,160,255,0.06)"
      />

      {/* B-pillar */}
      <rect x={316} y={72} width={4} height={66} fill="#0a0f1e" />

      {/* Door line */}
      <path
        d="M190,178 L186,115 M320,178 L320,138 M420,178 L430,140"
        stroke="#152040"
        strokeWidth={1.5}
        fill="none"
      />

      {/* Side skirt / lower accent */}
      <path
        d="M140,188 L460,188 L470,178 L130,178 Z"
        fill="#f59e0b"
        opacity={0.15}
      />
      <line x1={140} y1={190} x2={460} y2={190} stroke="#f59e0b" strokeWidth={1.5} opacity={0.5} />

      {/* Front headlight */}
      <path
        d="M468,132 L490,150 L490,170 L462,170 L455,155 Z"
        fill="#0d2a4a"
        stroke="#1e3a5f"
        strokeWidth={1}
      />
      <path
        d="M470,138 L488,154 L488,166 L464,166 L458,158 Z"
        fill="rgba(245,200,50,0.25)"
      />
      {/* DRL strip */}
      <line x1={466} y1={136} x2={488} y2={152} stroke="#f59e0b" strokeWidth={2} opacity={0.8} />

      {/* Rear tail light */}
      <rect x={118} y={140} width={14} height={32} rx={3} fill="#0d1a2e" stroke="#1e2a3e" strokeWidth={1} />
      <rect x={120} y={142} width={10} height={28} rx={2} fill="rgba(220,30,30,0.35)" />

      {/* Front bumper */}
      <path
        d="M488,170 L498,178 L490,200 L470,206 L465,190 L478,185 Z"
        fill="#0a0f1e"
        stroke="#1e3a5f"
        strokeWidth={1}
      />
      {/* Grille */}
      <path
        d="M478,186 L492,190 L490,198 L476,196 Z"
        fill="#f59e0b"
        opacity={0.2}
      />
      {[0,1,2].map(i => (
        <line key={i}
          x1={478} y1={188 + i*3}
          x2={491} y2={191 + i*3}
          stroke="#f59e0b"
          strokeWidth={0.8}
          opacity={0.5}
        />
      ))}

      {/* Rear bumper */}
      <path
        d="M112,170 L102,178 L108,198 L128,204 L134,188 L122,185 Z"
        fill="#0a0f1e"
        stroke="#1e3a5f"
        strokeWidth={1}
      />

      {/* Roof rack accent */}
      <rect x={230} y={64} width={130} height={5} rx={2.5} fill="#1e3a5f" />
      <rect x={236} y={62} width={4} height={9} rx={1} fill="#f59e0b" opacity={0.6} />
      <rect x={350} y={62} width={4} height={9} rx={1} fill="#f59e0b" opacity={0.6} />
    </g>
  );
}

// ── Speed lines ────────────────────────────────────────────────────────────
function SpeedLines() {
  const frame = useCurrentFrame();
  const lines = [
    { y: 100, len: 60, delay: 0 },
    { y: 130, len: 90, delay: 3 },
    { y: 155, len: 50, delay: 6 },
    { y: 170, len: 75, delay: 1 },
    { y: 190, len: 40, delay: 8 },
  ];

  return (
    <g opacity={0.35}>
      {lines.map((l, i) => {
        const offset = ((frame + l.delay * 4) % 40) / 40;
        const x = 85 - offset * 60;
        return (
          <line
            key={i}
            x1={x} y1={l.y}
            x2={x - l.len} y2={l.y}
            stroke="#f59e0b"
            strokeWidth={1.2}
            strokeLinecap="round"
            opacity={0.5 - offset * 0.4}
          />
        );
      })}
    </g>
  );
}

// ── Road ───────────────────────────────────────────────────────────────────
function Road() {
  const frame = useCurrentFrame();
  const dashOffset = -(frame * 5) % 60;

  return (
    <g>
      {/* Road surface */}
      <rect x={0} y={206} width={600} height={34} fill="#0a0d14" />
      {/* Road top edge glow */}
      <line x1={0} y1={206} x2={600} y2={206} stroke="#1e3a5f" strokeWidth={1} />
      {/* Centre dashes */}
      <line
        x1={0} y1={223} x2={600} y2={223}
        stroke="#f59e0b"
        strokeWidth={1.5}
        strokeDasharray="40 20"
        strokeDashoffset={dashOffset}
        opacity={0.4}
      />
    </g>
  );
}

// ── Main composition ────────────────────────────────────────────────────────
export default function CarScene() {
  const frame = useCurrentFrame();
  const { } = useVideoConfig();

  // Gentle horizontal sway
  const sway = interpolate(
    frame % 60,
    [0, 30, 60],
    [-1.5, 1.5, -1.5],
    { easing: Easing.inOut(Easing.sin) }
  );

  // Vertical bob
  const bob = interpolate(
    frame % 40,
    [0, 20, 40],
    [0, -2.5, 0],
    { easing: Easing.inOut(Easing.sin) }
  );

  // Entry slide-in on first 20 frames
  const entryX = interpolate(frame, [0, 20], [40, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const wheelR = 30;

  return (
    <svg
      viewBox="0 0 600 240"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <radialGradient id="bgGlow" cx="50%" cy="60%" r="60%">
          <stop offset="0%" stopColor="#0a1628" />
          <stop offset="100%" stopColor="#050810" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width={600} height={240} fill="url(#bgGlow)" />

      <Road />
      <SpeedLines />

      <g transform={`translate(${entryX + sway * 0.3}, ${bob})`}>
        {/* Front wheel */}
        <Wheel cx={415} cy={207} r={wheelR} />
        {/* Rear wheel */}
        <Wheel cx={188} cy={207} r={wheelR} />
        <CarBody />
      </g>
    </svg>
  );
}
