import { cn } from '../../utils/cn';
import PistonLoader from './PistonLoader';

export default function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <PistonLoader />
    </div>
  );
}
