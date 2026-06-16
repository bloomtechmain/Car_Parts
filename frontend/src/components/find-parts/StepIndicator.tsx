import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Props {
  currentStep: number;
  steps: string[];
}

export default function StepIndicator({ currentStep, steps }: Props) {
  return (
    <div className="flex items-center justify-center mb-10">
      {steps.map((label, i) => {
        const step = i + 1;
        const done = currentStep > step;
        const active = currentStep === step;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  backgroundColor: done ? '#f59e0b' : active ? '#f59e0b' : '#1a2235',
                  borderColor: done || active ? '#f59e0b' : '#1e2d45',
                  scale: active ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm"
              >
                {done ? (
                  <Check size={16} className="text-navy" />
                ) : (
                  <span className={active ? 'text-navy' : 'text-slate-500'}>{step}</span>
                )}
              </motion.div>
              <span className={cn('text-xs mt-1.5 font-medium hidden sm:block', active ? 'text-gold' : done ? 'text-gold/60' : 'text-slate-500')}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-16 sm:w-24 h-px mx-2 sm:mx-3 mb-4 relative overflow-hidden bg-navy-border">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gold"
                  initial={{ width: '0%' }}
                  animate={{ width: currentStep > step ? '100%' : '0%' }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
