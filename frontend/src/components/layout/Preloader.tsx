import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { introSeen, markIntroSeen } from './intro';

/*
 * "Ignition" intro — a rev counter sweeps to the redline while the
 * odometer counts up, then the screen splits open. Shown once per session.
 */
const DURATION = 1700;

const START = 135; // degrees, SVG space (0 = 3 o'clock, clockwise)
const SWEEP = 270;

function polar(r: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  return { x: 100 + r * Math.cos(a), y: 100 + r * Math.sin(a) };
}

function Tacho({ progress }: { progress: number }) {
  // needle overshoots into the red then settles back like a real blip
  const eased = progress < 0.85 ? progress / 0.85 : 1 - (progress - 0.85) * 1.6;
  const angle = START + SWEEP * Math.max(0, Math.min(1, eased)) * 0.92;
  const needle = polar(70, angle);

  return (
    <svg viewBox="0 0 200 200" className="h-44 w-44 sm:h-56 sm:w-56">
      {Array.from({ length: 41 }, (_, i) => {
        const deg = START + (SWEEP / 40) * i;
        const major = i % 5 === 0;
        const a = polar(major ? 74 : 79, deg);
        const b = polar(86, deg);
        const red = i >= 32;
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={red ? '#ff5a1f' : '#e9e3d6'}
            strokeOpacity={red ? 1 : major ? 0.8 : 0.3}
            strokeWidth={major ? 2 : 1}
          />
        );
      })}
      {Array.from({ length: 9 }, (_, i) => {
        const p = polar(60, START + (SWEEP / 8) * i);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y + 3.5}
            textAnchor="middle"
            fontSize="10"
            fontFamily="IBM Plex Mono, monospace"
            fill={i >= 7 ? '#ff5a1f' : '#8f897d'}
          >
            {i}
          </text>
        );
      })}
      <line x1="100" y1="100" x2={needle.x} y2={needle.y} stroke="#ff5a1f" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="100" cy="100" r="6" fill="#0f0e0c" stroke="#e9e3d6" strokeWidth="1.5" />
      <text x="100" y="146" textAnchor="middle" fontSize="7" letterSpacing="2" fontFamily="IBM Plex Mono, monospace" fill="#8f897d">
        RPM ×1000
      </text>
    </svg>
  );
}

export default function Preloader() {
  const [show, setShow] = useState(() => !introSeen());
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!show) return;
    document.documentElement.style.overflow = 'hidden';
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / DURATION);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        markIntroSeen();
        setTimeout(() => setShow(false), 180);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.style.overflow = '';
    };
  }, [show]);

  useEffect(() => {
    if (!show) document.documentElement.style.overflow = '';
  }, [show]);

  const count = Math.round(progress * 100);

  return (
    <AnimatePresence>
      {show && (
        <motion.div key="preloader" className="fixed inset-0 z-[100]" aria-hidden>
          {/* two halves that part to reveal the page */}
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 bg-ink"
            exit={{ y: '-100%' }}
            transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 border-t border-signal/0 bg-ink"
            exit={{ y: '100%' }}
            transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          />

          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35 }}
          >
            <Tacho progress={progress} />

            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-6xl font-extrabold tabular-nums text-bone sm:text-7xl">
                {String(count).padStart(3, '0')}
              </span>
              <span className="label text-steel">%</span>
            </div>

            <div className="mt-6 h-px w-48 bg-ink-line">
              <div className="h-px bg-signal" style={{ width: `${count}%` }} />
            </div>

            <p className="label mt-5 text-steel">
              {progress < 0.35 ? 'Key in' : progress < 0.8 ? 'Cranking' : 'Running'}
            </p>
          </motion.div>

          <span className="label absolute bottom-6 left-6 text-steel/70">CarParts Finder</span>
          <span className="label absolute bottom-6 right-6 text-steel/70">Est. 2019</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
