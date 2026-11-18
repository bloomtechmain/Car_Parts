import { AnimatePresence, motion } from 'framer-motion';
import type { FindPartsFormData } from '../../types';
import { cn } from '../../utils/cn';

/*
 * The request as it's being written — styled like a printed parts docket,
 * perforated at the bottom. Fills in live as the form is typed.
 */
export default function Docket({
  data,
  ticketNumber,
  className,
}: {
  data: Partial<FindPartsFormData>;
  ticketNumber?: string | null;
  className?: string;
}) {
  const vehicle = [data.car_year, data.car_make, data.car_model].filter(Boolean).join(' ');
  const rows: [string, string | undefined][] = [
    ['Vehicle', vehicle || undefined],
    ['VIN', data.car_vin?.toUpperCase()],
    ['Section', data.part_category],
    ['Part', data.part_name],
    ['Notes', data.part_description],
    ['Customer', data.email ? 'Held by CarParts Finder' : undefined],
  ];
  const filled = rows.filter(([, v]) => v).length;

  return (
    <div className={cn('relative bg-paper text-paper-ink', className)}>
      <div className="flex items-center justify-between border-b border-dashed border-paper-line px-5 py-4">
        <span className="label text-[10px] text-paper-ink/60">Request docket</span>
        <span className="font-mono text-xs text-paper-ink/80">
          No. {ticketNumber ?? <span className="text-paper-ink/40">— pending</span>}
        </span>
      </div>

      <dl className="px-5 py-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline gap-2 py-2 text-sm">
            <dt className="label shrink-0 text-[10px] text-paper-ink/50">{label}</dt>
            <span className="mb-1 flex-1 border-b border-dotted border-paper-line" />
            <dd className="max-w-[60%] text-right">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={value ?? 'empty'}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className={cn('block truncate', value ? 'font-medium' : 'text-paper-ink/30')}
                >
                  {value || '—'}
                </motion.span>
              </AnimatePresence>
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex items-center justify-between px-5 pb-6 pt-2">
        <span className="label text-[10px] text-paper-ink/50">Completed</span>
        <div className="flex gap-1">
          {rows.map((_, i) => (
            <span key={i} className={cn('h-2 w-5 transition-colors duration-300', i < filled ? 'bg-signal' : 'bg-paper-line')} />
          ))}
        </div>
      </div>

      {/* perforation */}
      <div
        className="absolute inset-x-0 -bottom-[6px] h-3"
        style={{
          background: 'radial-gradient(circle at 6px 0, transparent 5px, #ebe6db 5.5px) 0 0 / 14px 12px repeat-x',
          transform: 'scaleY(-1)',
        }}
      />
    </div>
  );
}
