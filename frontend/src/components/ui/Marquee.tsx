import { cn } from '../../utils/cn';

/* Endless horizontal strip. Content is duplicated once so the loop is seamless. */
export default function Marquee({
  children,
  className,
  slow,
  reverse,
}: {
  children: React.ReactNode;
  className?: string;
  slow?: boolean;
  reverse?: boolean;
}) {
  return (
    <div className={cn('group relative flex overflow-hidden', className)}>
      <div
        className={cn(
          'flex w-max shrink-0 group-hover:[animation-play-state:paused]',
          slow ? 'animate-marquee-slow' : 'animate-marquee',
        )}
        style={reverse ? { animationDirection: 'reverse' } : undefined}
      >
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
