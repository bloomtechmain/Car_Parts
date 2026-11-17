import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../utils/cn';

const EASE = [0.22, 1, 0.36, 1] as const;

/* Plain fade + rise when the element scrolls into view */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  as = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: 'div' | 'li' | 'section' | 'p';
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </Comp>
  );
}

/*
 * Each line slides up from behind a mask — the way printed headlines
 * are revealed in editorial sites. Pass lines as an array.
 */
export function MaskLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 0.09,
  animateOnMount = false,
}: {
  lines: React.ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  animateOnMount?: boolean;
}) {
  const reduce = useReducedMotion();
  const trigger = animateOnMount
    ? { animate: { y: '0%' } }
    : { whileInView: { y: '0%' }, viewport: { once: true, margin: '-40px' } };

  return (
    <span className={cn('block', className)}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.06em]">
          <motion.span
            className={cn('block', lineClassName)}
            initial={reduce ? false : { y: '105%' }}
            {...trigger}
            transition={{ duration: 0.9, delay: delay + i * stagger, ease: EASE }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* Small section marker — "02 / How it works" with a hairline that draws in */
export function SectionMark({
  index,
  label,
  tone = 'dark',
  className,
}: {
  index: string;
  label: string;
  tone?: 'dark' | 'light';
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <span className={cn('label', tone === 'dark' ? 'text-signal' : 'text-signal-dark')}>{index}</span>
      <motion.span
        className={cn('h-px w-12 origin-left', tone === 'dark' ? 'bg-bone/30' : 'bg-paper-ink/30')}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: EASE }}
      />
      <span className={cn('label', tone === 'dark' ? 'text-steel' : 'text-paper-ink/60')}>{label}</span>
    </div>
  );
}

export { EASE };
