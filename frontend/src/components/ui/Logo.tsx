import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

/* Hex bolt-head mark + stacked wordmark */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('h-8 w-8', className)} aria-hidden>
      <path
        d="M16 3.5 26.8 9.75v12.5L16 28.5 5.2 22.25V9.75z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        className="text-signal"
      />
      <path d="M16 9.5 21.6 12.75v6.5L16 22.5l-5.6-3.25v-6.5z" className="fill-current" />
    </svg>
  );
}

export default function Logo({ className, tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
  return (
    <Link
      to="/"
      aria-label="CarParts Finder — home"
      className={cn(
        'group inline-flex items-center gap-2.5',
        tone === 'light' ? 'text-bone' : 'text-paper-ink',
        className,
      )}
    >
      <LogoMark className="transition-transform duration-500 group-hover:rotate-[60deg]" />
      <span className="font-display text-[19px] font-extrabold uppercase leading-[0.82] tracking-wide">
        CarParts
        <br />
        <span className="text-signal">Finder</span>
      </span>
    </Link>
  );
}
