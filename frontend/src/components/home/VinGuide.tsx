import { useState } from 'react';
import { motion } from 'framer-motion';
import { MaskLines, Reveal, SectionMark } from '../ui/Reveal';
import { cn } from '../../utils/cn';

const SPOTS = [
  {
    id: 'screen',
    x: 168,
    y: 126,
    title: 'Base of the windscreen',
    body: 'Look through the glass on the driver’s side. A small metal plate with 17 characters.',
  },
  {
    id: 'pillar',
    x: 306,
    y: 152,
    title: 'Driver door pillar',
    body: 'Open the driver’s door. It’s on the sticker on the body, next to the tyre pressures.',
  },
  {
    id: 'bay',
    x: 92,
    y: 146,
    title: 'Under the bonnet',
    body: 'Stamped into the chassis or on a plate near the front of the engine bay.',
  },
  {
    id: 'docs',
    x: 520,
    y: 40,
    title: 'Registration card',
    body: 'Printed as “VIN” or “Chassis No.” on your registration and insurance papers.',
  },
];

export default function VinGuide() {
  const [active, setActive] = useState('screen');

  return (
    <section className="paper-section py-24 lg:py-32">
      <div className="shell grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionMark index="06" label="Before you ask" tone="light" className="mb-8" />
          <h2 className="display mb-6 text-[clamp(2.6rem,5vw,4.6rem)]">
            <MaskLines lines={['Seventeen characters', 'that save a week.']} />
          </h2>
          <Reveal>
            <p className="mb-10 max-w-md text-[17px] leading-relaxed text-paper-ink/70">
              The VIN tells a supplier exactly which engine, gearbox and trim your car left the factory with.
              It’s optional — but requests with one are quoted faster and fit first time.
            </p>
          </Reveal>

          <ol className="border-t border-paper-line">
            {SPOTS.map((s, i) => (
              <li key={s.id} className="border-b border-paper-line">
                <button
                  onPointerEnter={() => setActive(s.id)}
                  onFocus={() => setActive(s.id)}
                  onClick={() => setActive(s.id)}
                  className="grid w-full grid-cols-[2rem_1fr] gap-x-3 py-4 text-left"
                >
                  <span className={cn('font-mono text-xs leading-6', active === s.id ? 'text-signal-dark' : 'text-paper-ink/40')}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>
                    <span className={cn('block font-medium transition-colors', active === s.id ? 'text-paper-ink' : 'text-paper-ink/60')}>
                      {s.title}
                    </span>
                    <motion.span
                      initial={false}
                      animate={{ height: active === s.id ? 'auto' : 0, opacity: active === s.id ? 1 : 0 }}
                      className="block overflow-hidden text-sm text-paper-ink/60"
                    >
                      <span className="block pt-1">{s.body}</span>
                    </motion.span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <Reveal className="flex flex-col justify-center lg:col-span-7" delay={0.1}>
          <div className="relative border border-paper-line bg-paper-2/60 p-4 sm:p-8">
            <span className="label absolute left-3 top-3 text-[10px] text-paper-ink/50">Fig. 02 — Where to look</span>
            <svg viewBox="0 0 600 260" className="mt-6 w-full" aria-label="Car outline showing where the VIN is found">
              <g fill="none" stroke="#24211c" strokeWidth="1.4" strokeLinejoin="round">
                <path d="M34,192 L34,160 Q36,140 66,134 L148,124 Q190,80 242,72 L362,70 Q412,72 452,118 L540,130 Q566,136 568,162 L568,192 Z" fill="#e0d9cb" />
                <path d="M174,122 Q204,88 246,82 L300,81 L300,122 Z" fill="#ebe6db" />
                <path d="M312,81 L360,80 Q396,84 426,120 L312,122 Z" fill="#ebe6db" />
                <line x1="306" y1="82" x2="306" y2="190" strokeOpacity="0.5" />
                <line x1="168" y1="126" x2="172" y2="190" strokeOpacity="0.5" />
                <line x1="432" y1="122" x2="436" y2="190" strokeOpacity="0.5" />
                <line x1="270" y1="146" x2="290" y2="146" />
                <line x1="410" y1="146" x2="428" y2="146" />
                <path d="M548,140 L566,146" />
                <path d="M40,146 L64,142" />
                {[140, 470].map((cx) => (
                  <g key={cx}>
                    <circle cx={cx} cy={192} r={40} fill="#ebe6db" />
                    <circle cx={cx} cy={192} r={24} />
                    <circle cx={cx} cy={192} r={6} fill="#24211c" />
                  </g>
                ))}
                <line x1="0" y1="232" x2="600" y2="232" strokeOpacity="0.4" strokeDasharray="6 6" />
                {/* registration card */}
                <rect x="494" y="18" width="78" height="48" fill="#ebe6db" />
                <line x1="502" y1="32" x2="540" y2="32" strokeOpacity="0.5" />
                <line x1="502" y1="42" x2="560" y2="42" strokeOpacity="0.5" />
                <line x1="502" y1="52" x2="530" y2="52" strokeOpacity="0.5" />
              </g>

              {SPOTS.map((s, i) => {
                const on = active === s.id;
                return (
                  <g
                    key={s.id}
                    className="cursor-pointer"
                    onPointerEnter={() => setActive(s.id)}
                    onClick={() => setActive(s.id)}
                  >
                    {on && (
                      <motion.circle
                        cx={s.x}
                        cy={s.y}
                        r={10}
                        fill="none"
                        stroke="#ff5a1f"
                        initial={{ r: 10, opacity: 0.9 }}
                        animate={{ r: 26, opacity: 0 }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                      />
                    )}
                    <circle cx={s.x} cy={s.y} r={11} fill={on ? '#ff5a1f' : '#ebe6db'} stroke="#24211c" strokeWidth="1.2" />
                    <text
                      x={s.x}
                      y={s.y + 3.5}
                      textAnchor="middle"
                      fontSize="10"
                      fontFamily="IBM Plex Mono, monospace"
                      fill="#24211c"
                    >
                      {String.fromCharCode(65 + i)}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-paper-line pt-4">
              <span className="label pb-5 text-[10px] text-paper-ink/50">Example VIN</span>
              <span className="flex gap-3 font-mono text-paper-ink sm:gap-4">
                {[
                  ['JTD', 'Maker'],
                  ['BT9230', 'Vehicle'],
                  ['71245678', 'Serial'],
                ].map(([chunk, what]) => (
                  <span key={chunk} className="group flex flex-col items-center">
                    <span className="border-b-2 border-paper-ink/20 pb-1 text-base tracking-[0.16em] transition-colors group-hover:border-signal sm:text-lg">
                      {chunk}
                    </span>
                    <span className="label mt-1.5 text-[9px] text-paper-ink/50">{what}</span>
                  </span>
                ))}
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
