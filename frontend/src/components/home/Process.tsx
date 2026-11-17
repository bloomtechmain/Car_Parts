import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MaskLines, Reveal, SectionMark } from '../ui/Reveal';

const STAGES = [
  {
    time: '≈ 2 min',
    status: 'Open',
    title: 'You file the request',
    body: 'Make, model, year and the part. Add the VIN or a note if you have one — it all helps.',
  },
  {
    time: 'Hours, not days',
    status: 'Quoting',
    title: 'Suppliers quote',
    body: 'Verified suppliers see the car and the part — never your name or number — and send a price with delivery time.',
  },
  {
    time: 'Same day, usually',
    status: 'Options sent',
    title: 'We check and shortlist',
    body: 'Our team reviews every quote, drops the odd ones, and sends you the best options by email and SMS.',
  },
  {
    time: 'One tap',
    status: 'Confirmed',
    title: 'You pick, we confirm',
    body: 'Choose the option that suits you from the link. We lock the order in and keep you posted.',
  },
];

export default function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className="paper-section py-24 lg:py-32">
      <div className="shell">
        <div className="mb-16 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <SectionMark index="02" label="How a request moves" tone="light" className="mb-8" />
            <h2 className="display text-[clamp(2.6rem,5.6vw,5rem)]">
              <MaskLines lines={['From “it’s broken”', 'to “it’s ordered”.']} />
            </h2>
          </div>
          <Reveal className="self-end lg:col-span-4">
            <p className="text-[17px] leading-relaxed text-paper-ink/70">
              Four stages. You only do the first and the last — the middle is our job.
            </p>
          </Reveal>
        </div>

        <div ref={ref} className="relative">
          {/* track that fills as you scroll */}
          <div className="absolute left-0 right-0 top-[7px] hidden h-px bg-paper-line lg:block" />
          <motion.div
            style={{ scaleX: lineScale }}
            className="absolute left-0 right-0 top-[6px] hidden h-[3px] origin-left bg-signal lg:block"
          />

          <ol className="grid gap-px bg-paper-line lg:grid-cols-4 lg:gap-0 lg:bg-transparent">
            {STAGES.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 0.1} className="group relative bg-paper lg:pr-8">
                <span className="relative z-10 hidden h-[15px] w-[15px] border-2 border-paper-ink bg-paper transition-colors duration-300 group-hover:border-signal group-hover:bg-signal lg:block" />
                <div className="py-8 transition-transform duration-500 group-hover:-translate-y-1 lg:pt-10">
                  <div className="mb-6 flex items-baseline justify-between">
                    <span className="font-display text-7xl font-extrabold leading-none text-paper-ink/15 transition-colors duration-300 group-hover:text-signal">
                      0{i + 1}
                    </span>
                    <span className="label text-paper-ink/50">{s.time}</span>
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">{s.title}</h3>
                  <p className="mb-6 leading-relaxed text-paper-ink/70">{s.body}</p>
                  <span className="label inline-flex items-center gap-2 border border-paper-ink/25 px-2.5 py-1.5 text-[10px] text-paper-ink/70">
                    <span className="h-1.5 w-1.5 bg-signal" />
                    Status: {s.status}
                  </span>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
