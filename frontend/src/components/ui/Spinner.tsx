import { cn } from '../../utils/cn';

export default function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="w-8 h-8 border-3 border-navy-border border-t-gold rounded-full animate-spin" />
    </div>
  );
}
