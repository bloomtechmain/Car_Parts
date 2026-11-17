import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
  tone?: 'dark' | 'light';
  defaultOpen?: number | null;
  /** Numbering offset so grouped lists keep counting */
  startAt?: number;
}

function PlusMinus({ open }: { open: boolean }) {
  return (
    <span className="relative block h-4 w-4 shrink-0">
      <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-current" />
      <motion.span
        className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-current"
        animate={{ scaleY: open ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      />
    </span>
  );
}

export default function Accordion({ items, tone = 'dark', defaultOpen = 0, startAt = 0 }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen);
  const dark = tone === 'dark';

  return (
    <div className={cn('border-t', dark ? 'border-ink-line' : 'border-paper-line')}>
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.question} className={cn('border-b', dark ? 'border-ink-line' : 'border-paper-line')}>
            <button
              className="group flex w-full items-baseline gap-5 py-6 text-left"
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
            >
              <span className={cn('label w-7 shrink-0', open ? 'text-signal' : dark ? 'text-steel' : 'text-paper-ink/50')}>
                {String(startAt + i + 1).padStart(2, '0')}
              </span>
              <span
                className={cn(
                  'flex-1 text-lg font-medium leading-snug transition-transform duration-300 group-hover:translate-x-1.5 sm:text-xl',
                  dark ? 'text-bone' : 'text-paper-ink',
                )}
              >
                {item.question}
              </span>
              <span className={cn('self-center', open ? 'text-signal' : dark ? 'text-steel' : 'text-paper-ink/60')}>
                <PlusMinus open={open} />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p
                    className={cn(
                      'max-w-2xl pb-7 pl-12 leading-relaxed',
                      dark ? 'text-steel' : 'text-paper-ink/70',
                    )}
                  >
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export type { AccordionItem };
