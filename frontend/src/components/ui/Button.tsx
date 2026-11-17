import { ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import PistonLoader from './PistonLoader';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  /** Adds the sliding arrow used on the main calls to action */
  arrow?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading,
  arrow,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'group/btn relative inline-flex items-center justify-center gap-2.5 font-medium overflow-hidden ' +
    'transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-signal text-ink hover:bg-bone',
    secondary: 'border border-bone/30 text-bone hover:border-bone hover:bg-bone hover:text-ink',
    ghost: 'text-steel hover:text-bone',
    danger: 'border border-red-500/40 text-red-400 hover:bg-red-500/10',
    dark: 'bg-ink text-bone hover:bg-bone hover:text-ink',
  };

  const sizes = {
    sm: 'h-9 px-3.5 text-[13px]',
    md: 'h-11 px-5 text-sm',
    lg: 'h-14 px-7 text-[15px]',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <PistonLoader size="sm" tone="current" />}
      {children}
      {arrow && !loading && (
        <span className="relative inline-flex w-4 overflow-hidden">
          <ArrowRight
            size={16}
            className="transition-transform duration-300 ease-out group-hover/btn:translate-x-full"
          />
          <ArrowRight
            size={16}
            className="absolute left-0 -translate-x-full transition-transform duration-300 ease-out group-hover/btn:translate-x-0"
          />
        </span>
      )}
    </button>
  );
}
