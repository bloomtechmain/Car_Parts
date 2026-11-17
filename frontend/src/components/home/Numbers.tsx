import { STATS, PHOTOS } from '../../constants/brand';
import Odometer from '../ui/Odometer';
import { Reveal, SectionMark } from '../ui/Reveal';

export default function Numbers() {
  return (
    <section className="relative overflow-hidden border-y border-ink-line bg-ink-2">
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-cover bg-center opacity-25 grayscale lg:block"
        style={{
          backgroundImage: `url(${PHOTOS.piston})`,
          maskImage: 'linear-gradient(to right, transparent, black 70%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 70%)',
        }}
      />
      <div className="shell relative py-20 lg:py-24">
        <SectionMark index="04" label="By the numbers" className="mb-12" />
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 0.08}
              className="group border-ink-line py-6 pr-4 [&:nth-child(n+3)]:border-t lg:border-l lg:px-6 lg:py-2 lg:first:border-l-0 lg:first:pl-0 lg:[&:nth-child(n+3)]:border-t-0"
            >
              <Odometer
                value={s.value}
                prefix={s.prefix}
                suffix={s.suffix}
                className="font-display text-[clamp(3rem,6vw,5.5rem)] font-extrabold leading-none text-bone transition-colors group-hover:text-signal"
              />
              <p className="mt-4 font-medium text-bone">{s.label}</p>
              <p className="mt-1 text-sm text-steel">{s.note}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
