import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { PHOTOS } from '../../constants/brand';
import { MaskLines, Reveal } from '../ui/Reveal';

const PROMISES = [
  ['Your details stay here', 'Suppliers see the car and the part. Never your name, phone or address.'],
  ['Every quote gets read', 'A person on our team checks each price before it reaches you.'],
  ['No fee to ask', 'Requesting and comparing quotes costs you nothing. Ever.'],
];

export default function HouseRules() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-12%', '12%']);

  return (
    <section ref={ref} className="relative overflow-hidden">
      <motion.div
        style={{ y, backgroundImage: `url(${PHOTOS.garageNight})` }}
        className="absolute inset-[-12%_0] bg-cover bg-center"
      />
      <div className="absolute inset-0 bg-ink/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-transparent" />

      <div className="shell relative grid min-h-[80vh] items-end gap-12 py-24 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="label mb-8 text-signal">House rules</p>
          <h2 className="display text-[clamp(3rem,7vw,6.5rem)] text-bone">
            <MaskLines lines={['Three things', 'we don’t', 'bend on.']} />
          </h2>
        </div>
        <ol className="space-y-0 border-t border-bone/20 lg:col-span-5">
          {PROMISES.map(([t, d], i) => (
            <Reveal as="li" key={t} delay={i * 0.12} className="group border-b border-bone/20 py-5">
              <div className="flex gap-5">
                <span className="font-mono text-xs leading-7 text-signal">0{i + 1}</span>
                <div className="transition-transform duration-500 group-hover:translate-x-2">
                  <p className="text-xl font-medium text-bone">{t}</p>
                  <p className="mt-1 text-steel">{d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
