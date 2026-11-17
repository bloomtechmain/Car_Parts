import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface Props {
  currentStep: number;
  steps: string[];
}

/* Three segments that fill like a fuel gauge */
export default function StepIndicator({ currentStep, steps }: Props) {
  return (
    <div className="mb-10">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="label text-steel">
          Step <span className="text-bone">{currentStep}</span> of {steps.length}
        </span>
        <span className="label text-signal">{steps[currentStep - 1]}</span>
      </div>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
        {steps.map((label, i) => {
          const step = i + 1;
          return (
            <div key={label}>
              <div className="h-1 overflow-hidden bg-ink-line">
                <motion.div
                  className="h-full bg-signal"
                  initial={false}
                  animate={{ width: currentStep >= step ? '100%' : '0%' }}
                  transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                />
              </div>
              <p
                className={cn(
                  'mt-2 hidden text-xs sm:block',
                  currentStep === step ? 'text-bone' : currentStep > step ? 'text-steel' : 'text-steel/50',
                )}
              >
                {String(step).padStart(2, '0')} {label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
