import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MaskLines } from '../ui/Reveal';
import { cn } from '../../utils/cn';

const EASE = [0.76, 0, 0.24, 1] as const;

interface Props {
  /** "03 / About" style breadcrumb */
  index: string;
  label: string;
  title: React.ReactNode[];
  intro?: React.ReactNode;
  photo: string;
  /** 'split' puts the photo in a panel on the right; 'full' runs it behind everything */
  layout?: 'split' | 'full';
  aside?: React.ReactNode;
  /** small facts along the bottom edge */
  rail?: string[];
  /** shorter hero for task pages */
  compact?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function PageHero({
  index,
  label,
  title,
  intro,
  photo,
  layout = 'split',
  aside,
  rail,
  compact,
  className,
  children,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const photoY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const titleY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  return (
    <section ref={ref} className={cn('relative overflow-hidden bg-ink pt-[72px]', className)}>
      {layout === 'full' && (
        <>
          <motion.div
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ y: photoY, backgroundImage: `url(${photo})` }}
            className="absolute inset-0 bg-cover bg-center"
          />
          <div className="absolute inset-0 bg-ink/65" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/70" />
        </>
      )}

      <div
        className={cn(
          'shell relative grid gap-10 pb-14 pt-14 lg:grid-cols-12 lg:pt-20',
          layout === 'full' ? 'min-h-[86svh] items-end' : compact ? 'min-h-[56svh] items-end' : 'min-h-[72svh] items-end',
        )}
      >
        <motion.div style={{ y: titleY }} className={layout === 'split' ? 'lg:col-span-7' : 'lg:col-span-8'}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8 flex items-center gap-4"
          >
            <span className="label text-signal">{index}</span>
            <motion.span
              className="h-px w-12 origin-left bg-bone/30"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
            />
            <span className="label text-steel">{label}</span>
          </motion.div>
          <h1 className="display text-[clamp(3.2rem,8vw,7.4rem)] text-bone">
            <MaskLines lines={title} animateOnMount delay={0.35} stagger={0.1} />
          </h1>
          {intro && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.75 }}
              className="mt-8 max-w-xl text-[17px] leading-relaxed text-steel"
            >
              {intro}
            </motion.div>
          )}
        </motion.div>

        {layout === 'split' ? (
          <div className="relative lg:col-span-5 lg:self-stretch">
            <motion.div
              initial={{ clipPath: 'inset(100% 0 0 0)' }}
              animate={{ clipPath: 'inset(0% 0 0 0)' }}
              transition={{ duration: 1.2, delay: 0.25, ease: EASE }}
              className="relative h-[300px] overflow-hidden border border-ink-line lg:h-full lg:min-h-[420px]"
            >
              <motion.div
                style={{ y: photoY, backgroundImage: `url(${photo})` }}
                initial={{ scale: 1.25 }}
                animate={{ scale: 1.08 }}
                transition={{ duration: 1.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-[-10%_0] bg-cover bg-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
              {aside && <div className="absolute inset-x-0 bottom-0 p-5">{aside}</div>}
            </motion.div>
          </div>
        ) : (
          aside && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="lg:col-span-4"
            >
              {aside}
            </motion.div>
          )
        )}
      </div>

      {children}

      {rail && (
        <div className="relative border-t border-ink-line">
          <div className="shell flex flex-wrap gap-x-10 gap-y-2 py-4">
            {rail.map((r, i) => (
              <motion.span
                key={r}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.08 }}
                className="flex items-center gap-2 text-[13px] text-steel"
              >
                <span className="font-mono text-[10px] text-signal">{String(i + 1).padStart(2, '0')}</span>
                {r}
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
