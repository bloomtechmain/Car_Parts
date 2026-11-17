import { motion } from 'framer-motion';

/*
 * Mechanical odometer: every digit is a strip of 0–9 that rolls to its
 * final position when scrolled into view. Separators stay still.
 */
export default function Odometer({
  value,
  prefix = '',
  suffix = '',
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const chars = value.toLocaleString('en-US').split('');
  let digitIndex = 0;

  return (
    <span className={className} aria-label={`${prefix}${value.toLocaleString('en-US')}${suffix}`}>
      <span aria-hidden className="inline-flex items-baseline">
        {prefix && <span>{prefix}</span>}
        {chars.map((ch, i) => {
          if (!/\d/.test(ch)) return <span key={i}>{ch}</span>;
          const d = Number(ch);
          const order = digitIndex++;
          return (
            <span key={i} className="relative inline-block h-[1em] overflow-hidden leading-none">
              <motion.span
                className="flex flex-col"
                initial={{ y: '0em' }}
                whileInView={{ y: `${-(d + 10)}em` }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 1.6 + order * 0.25, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              >
                {/* two full turns so small digits still roll visibly */}
                {Array.from({ length: 20 }, (_, n) => (
                  <span key={n} className="block h-[1em]">
                    {n % 10}
                  </span>
                ))}
              </motion.span>
            </span>
          );
        })}
        {suffix && <span>{suffix}</span>}
      </span>
    </span>
  );
}
