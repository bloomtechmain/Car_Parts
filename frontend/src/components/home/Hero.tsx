import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  motion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import { ArrowDown, ArrowRight } from 'lucide-react';
import ExplodedEngine from './engine/ExplodedEngine';
import { ENGINE_LEGEND, type EnginePart } from './engine/parts';
import { MaskLines } from '../ui/Reveal';
import Button from '../ui/Button';
import { PHOTOS } from '../../constants/brand';
import RequestModal from '../find-parts/RequestModal';
import { introPending } from '../layout/intro';
import { cn } from '../../utils/cn';

const REST = 0.32; // how far apart the parts sit when idle

export default function Hero() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [hot, setHot] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);
  const [startDelay] = useState(() => (introPending() ? 1.9 : 0.25));
  const [requestOpen, setRequestOpen] = useState(false);

  /* explode = spring(target) + scroll — parts fly in, assemble, then
     pull apart again when you hover the drawing or scroll past it */
  const target = useMotionValue(reduce ? REST : 1.6);
  const spring = useSpring(target, { stiffness: 55, damping: 16, mass: 1 });
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const explode = useTransform([spring, scrollYProgress], ([s, p]: number[]) => s + p * 1.1);

  /* small tilt that follows the pointer */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-5, 5]), { stiffness: 80, damping: 20 });
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 80, damping: 20 });

  useEffect(() => {
    const t = setTimeout(() => {
      setEntered(true);
      target.set(REST);
    }, startDelay * 1000);
    return () => clearTimeout(t);
  }, [startDelay, target]);

  const hotPart = ENGINE_LEGEND.find((p) => p.id === hot) ?? null;

  const pick = (part: EnginePart) =>
    navigate(
      `/find-parts?part=${encodeURIComponent(part.requestName)}&category=${encodeURIComponent(part.category)}`,
    );

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-ink pt-[72px]">
      {/* faint photograph under everything */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.13] grayscale"
        style={{ backgroundImage: `url(${PHOTOS.engineBay})` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />

      <div className="shell relative grid min-h-[calc(100svh-72px)] grid-cols-1 gap-10 pb-10 pt-10 lg:grid-cols-12 lg:gap-6 lg:pt-6">
        {/* ── Left: words + quick request ── */}
        <div className="flex flex-col justify-center lg:col-span-6 xl:col-span-5">
          <motion.p
            initial={{ opacity: 0 }}
            animate={entered ? { opacity: 1 } : undefined}
            transition={{ duration: 0.6 }}
            className="label mb-7 flex items-center gap-3 text-steel"
          >
            <span className="inline-block h-1.5 w-1.5 animate-blink bg-signal" />
            Parts desk — open for requests
          </motion.p>

          <h1 className="display text-[clamp(3.2rem,5.7vw,5.6rem)] text-bone">
            {entered || reduce ? (
              <MaskLines
                animateOnMount
                stagger={0.11}
                lines={[
                  'Name the part.',
                  "We'll find",
                  <span key="l3" className="text-signal">
                    who has it.
                  </span>,
                ]}
              />
            ) : (
              <span className="invisible">
                Name the part. We'll find who has it.
              </span>
            )}
          </h1>

          {/* quick request — opens the 3-step request in a popup */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={entered ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10"
          >
            <Button
              type="button"
              size="lg"
              arrow
              onClick={() => setRequestOpen(true)}
              className="h-16 w-full px-9 text-[17px] sm:w-auto"
            >
              Find Your Part Quickly
            </Button>
          </motion.div>
          <RequestModal open={requestOpen} onClose={() => setRequestOpen(false)} />

          <motion.p
            initial={{ opacity: 0 }}
            animate={entered ? { opacity: 1 } : undefined}
            transition={{ delay: 1 }}
            className="mt-4 hidden text-sm text-steel lg:block"
          >
            Or pick a part straight off the drawing <ArrowRight size={13} className="inline -mt-0.5" />
          </motion.p>
        </div>

        {/* ── Right: the drawing ── */}
        <div className="relative flex flex-col justify-center lg:col-span-6 xl:col-span-7">
          <motion.div
            initial={{ opacity: 0 }}
            animate={entered ? { opacity: 1 } : undefined}
            transition={{ duration: 1 }}
            className="relative border border-ink-line/70"
            style={{ perspective: 1200 }}
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              mx.set((e.clientX - r.left) / r.width - 0.5);
              my.set((e.clientY - r.top) / r.height - 0.5);
            }}
            onPointerEnter={() => target.set(1)}
            onPointerLeave={() => {
              target.set(REST);
              mx.set(0);
              my.set(0);
            }}
          >
            {/* drawing frame furniture */}
            <span className="label absolute left-3 top-3 text-[10px] text-steel">Fig. 01 — Inline-4, exploded</span>
            <span className="label absolute right-3 top-3 hidden text-[10px] text-steel sm:block">Scale 1:8</span>
            {['left-0 top-0 border-l border-t', 'right-0 top-0 border-r border-t', 'left-0 bottom-0 border-l border-b', 'right-0 bottom-0 border-r border-b'].map(
              (c) => (
                <span key={c} className={cn('absolute h-4 w-4 border-signal', c)} />
              ),
            )}

            <motion.div style={{ rotateX: rotX, rotateY: rotY }} className="px-2 pb-2 pt-9 sm:px-6">
              <ExplodedEngine explode={explode} hot={hot} onHot={setHot} onPick={pick} className="mx-auto max-h-[64vh]" />
            </motion.div>

            {/* title block */}
            <div className="flex items-stretch border-t border-ink-line/70 text-[12px]">
              <div className="flex-1 px-3 py-2.5">
                {hotPart ? (
                  <button onClick={() => pick(hotPart)} className="flex w-full items-center gap-3 text-left">
                    <span className="font-mono text-signal">{hotPart.no}</span>
                    <span className="font-medium text-bone">{hotPart.name}</span>
                    <span className="hidden text-steel sm:inline">· {hotPart.category}</span>
                    <span className="ml-auto inline-flex items-center gap-1 text-signal">
                      Request <ArrowRight size={12} />
                    </span>
                  </button>
                ) : (
                  <span className="text-steel">Hover the drawing to take it apart. Click a part to request it.</span>
                )}
              </div>
              <div className="label hidden items-center border-l border-ink-line/70 px-3 text-[10px] text-steel sm:flex">
                Dwg CPF-001
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* bottom rail */}
      <div className="relative border-t border-ink-line">
        <div className="shell grid grid-cols-2 text-[13px] md:grid-cols-4">
          {[
            'Free to request',
            'Suppliers never see your number',
            'Every quote checked by our team',
          ].map((t, i) => (
            <p
              key={t}
              className={cn(
                'flex items-center gap-2 border-ink-line py-4 text-steel',
                i > 0 && 'md:border-l md:pl-5',
                i === 2 && 'hidden md:flex',
              )}
            >
              <span className="font-mono text-[10px] text-signal">0{i + 1}</span>
              {t}
            </p>
          ))}
          <p className="flex items-center justify-end gap-2 py-4 text-steel md:border-l md:border-ink-line">
            Scroll to strip it down <ArrowDown size={14} className="animate-bounce text-signal" />
          </p>
        </div>
      </div>
    </section>
  );
}
