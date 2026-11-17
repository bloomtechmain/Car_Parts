import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MaskLines, SectionMark } from '../ui/Reveal';
import Button from '../ui/Button';
import { PHOTOS } from '../../constants/brand';
import { cn } from '../../utils/cn';

const SIDES = [
  {
    key: 'buyers',
    kicker: 'If you need a part',
    title: ['Drivers', '& garages'],
    photo: PHOTOS.sedanDark,
    points: [
      ['Say what you need', 'Car, part, a line of detail. Two minutes, no account.'],
      ['Get checked quotes', 'Prices and delivery times, already reviewed by our team.'],
      ['Pick one and pay', 'Choose from the link we send you. We confirm the order.'],
    ],
    cta: { label: 'Request a part', to: '/find-parts' },
    alt: { label: 'How it works', to: '/about' },
  },
  {
    key: 'suppliers',
    kicker: 'If you sell parts',
    title: ['Parts', 'suppliers'],
    photo: PHOTOS.toolWall,
    points: [
      ['Real requests, daily', 'Every one is a buyer with a specific car and a specific part.'],
      ['Quote in a minute', 'Price, delivery days, a photo. From the portal, on any phone.'],
      ['No chasing', 'We handle the customer. You handle the part.'],
    ],
    cta: { label: 'Join the network', to: '/contact' },
    alt: { label: 'Supplier login', to: '/dashboard/login' },
  },
] as const;

export default function TwoSides() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="bg-ink py-24 lg:py-32">
      <div className="shell">
        <div className="mb-14 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionMark index="01" label="Who it's for" className="mb-8" />
            <h2 className="display text-[clamp(2.6rem,5.6vw,5rem)] text-bone">
              <MaskLines lines={['Two sides', 'of the same counter.']} />
            </h2>
          </div>
          <p className="self-end text-[17px] leading-relaxed text-steel lg:col-span-4 lg:col-start-9">
            Someone has a car off the road. Someone else has the part on a shelf. We sit in the middle and
            make sure the deal is fair for both.
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:h-[640px] lg:flex-row">
          {SIDES.map((side, i) => {
            const isActive = active === side.key;
            const isDim = active !== null && !isActive;
            return (
              <motion.article
                key={side.key}
                onPointerEnter={() => setActive(side.key)}
                onPointerLeave={() => setActive(null)}
                animate={{ flexGrow: isActive ? 1.45 : 1 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="group relative min-h-[560px] basis-0 overflow-hidden border border-ink-line lg:min-h-0"
              >
                <div
                  className={cn(
                    'absolute inset-0 bg-cover bg-center transition-[transform,filter] duration-[1.2s] ease-out',
                    isActive ? 'scale-105 grayscale-0' : 'scale-100 grayscale',
                  )}
                  style={{ backgroundImage: `url(${side.photo})` }}
                />
                <div
                  className={cn(
                    'absolute inset-0 transition-colors duration-700',
                    isDim ? 'bg-ink/90' : 'bg-gradient-to-t from-ink via-ink/75 to-ink/30',
                  )}
                />

                <div className="relative flex h-full flex-col justify-between p-6 sm:p-9">
                  <div className="flex items-start justify-between">
                    <span className="label text-bone/80">{side.kicker}</span>
                    <span className="font-mono text-sm text-signal">0{i + 1}</span>
                  </div>

                  <div>
                    <h3 className="display mb-8 text-[clamp(3rem,6vw,5.5rem)] text-bone">
                      {side.title[0]}
                      <br />
                      <span className="text-signal">{side.title[1]}</span>
                    </h3>
                    <ol className="mb-8 max-w-md space-y-0 border-t border-bone/15">
                      {side.points.map(([t, d], n) => (
                        <li key={t} className="grid grid-cols-[2rem_1fr] gap-x-2 border-b border-bone/15 py-3">
                          <span className="font-mono text-[11px] leading-6 text-steel">{n + 1}.</span>
                          <div>
                            <p className="font-medium text-bone">{t}</p>
                            <p
                              className={cn(
                                'overflow-hidden text-sm text-steel transition-all duration-500',
                                isActive ? 'max-h-12 opacity-100' : 'max-h-12 opacity-100 lg:max-h-0 lg:opacity-0',
                              )}
                            >
                              {d}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                    <div className="flex flex-wrap items-center gap-5">
                      <Link to={side.cta.to} tabIndex={-1}>
                        <Button arrow>{side.cta.label}</Button>
                      </Link>
                      <Link to={side.alt.to} className="link-draw text-sm text-bone/80 hover:text-bone">
                        {side.alt.label}
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
