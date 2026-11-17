import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { CATEGORY_DETAILS, PART_CATEGORIES } from '../../constants/brand';
import { MaskLines, SectionMark } from '../ui/Reveal';

/*
 * Category index — hovering a row floats a photo that trails the cursor.
 */
export default function PartsIndex() {
  const listRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<string | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 20, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 150, damping: 20, mass: 0.6 });

  const onMove = (e: React.PointerEvent) => {
    const r = listRef.current?.getBoundingClientRect();
    if (!r) return;
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  };

  return (
    <section className="bg-ink py-24 lg:py-32">
      <div className="shell">
        <div className="mb-14 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <SectionMark index="03" label="Parts index" className="mb-8" />
            <h2 className="display text-[clamp(2.6rem,5.6vw,5rem)] text-bone">
              <MaskLines lines={['Bumper to', 'exhaust tip.']} />
            </h2>
          </div>
          <p className="self-end text-[17px] leading-relaxed text-steel lg:col-span-4">
            Fourteen sections, the same way a parts catalogue is laid out. Pick the one your part lives in and
            we’ll take it from there.
          </p>
        </div>

        <div
          ref={listRef}
          className="relative border-t border-ink-line"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          {/* floating preview */}
          <motion.div
            style={{ x: sx, y: sy }}
            className="pointer-events-none absolute left-0 top-0 z-20 hidden lg:block"
          >
            <AnimatePresence>
              {hover && (
                <motion.div
                  key={hover}
                  initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                >
                  <div
                    className="h-[220px] w-[320px] border border-ink-line bg-cover bg-center shadow-2xl"
                    style={{ backgroundImage: `url(${CATEGORY_DETAILS[hover]?.photo})` }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {PART_CATEGORIES.map((cat, i) => (
            <Link
              key={cat}
              to={`/find-parts?category=${encodeURIComponent(cat)}`}
              onPointerEnter={() => setHover(cat)}
              className="group relative grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 overflow-hidden border-b border-ink-line py-5 sm:grid-cols-[3.5rem_1fr_1fr_auto] lg:py-6"
            >
              {/* fill that wipes in from the left */}
              <span className="absolute inset-0 origin-left scale-x-0 bg-ink-2 transition-transform duration-500 ease-out group-hover:scale-x-100" />
              <span className="relative font-mono text-xs text-steel transition-colors group-hover:text-signal">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="relative font-display text-[clamp(1.7rem,3.4vw,3rem)] font-bold uppercase leading-none text-bone transition-transform duration-500 ease-out group-hover:translate-x-3">
                {cat}
              </span>
              <span className="relative hidden text-sm text-steel sm:block">{CATEGORY_DETAILS[cat]?.examples}</span>
              <span className="relative flex h-10 w-10 items-center justify-center border border-ink-line text-steel transition-colors duration-300 group-hover:border-signal group-hover:bg-signal group-hover:text-ink">
                <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:rotate-45" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
