import { cn } from '../../utils/cn';

/*
 * Four pistons running in the inline-4 firing order (1-3-4-2).
 * Used everywhere something is loading instead of a generic spinner.
 */
const FIRING_DELAY = [0, 0.45, 0.15, 0.3]; // cylinder 1..4 → 1, 3, 4, 2 order

interface Props {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'signal' | 'current';
}

export default function PistonLoader({ className, size = 'md', tone = 'signal' }: Props) {
  const dims = {
    sm: { w: 3, h: 9, gap: 2, travel: 'h-[14px]' },
    md: { w: 5, h: 14, gap: 4, travel: 'h-[24px]' },
    lg: { w: 8, h: 22, gap: 6, travel: 'h-[38px]' },
  }[size];

  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn('inline-flex items-start', dims.travel, className)}
      style={{ gap: dims.gap }}
    >
      {FIRING_DELAY.map((delay, i) => (
        <span
          key={i}
          className={cn('block', tone === 'signal' ? 'bg-signal' : 'bg-current')}
          style={{
            width: dims.w,
            height: dims.h,
            animation: `piston 0.6s cubic-bezier(0.45,0,0.55,1) ${delay}s infinite`,
          }}
        />
      ))}
    </span>
  );
}
