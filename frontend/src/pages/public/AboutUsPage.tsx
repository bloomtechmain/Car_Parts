import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import PageHero from '../../components/layout/PageHero';
import { MaskLines, Reveal, SectionMark } from '../../components/ui/Reveal';
import Odometer from '../../components/ui/Odometer';
import Button from '../../components/ui/Button';
import { PHOTOS } from '../../constants/brand';

const VETTING = [
  ['Trade licence', 'We see the licence before anything else. No licence, no account.'],
  ['A real address', 'A shop or warehouse we can find on a map — not a phone number and a promise.'],
  ['Contact details that work', 'We call the number and email the address. Somebody has to answer.'],
  ['Ongoing review', 'Quotes are judged on accuracy and follow-through. Suppliers who slip, go.'],
];

const BELIEFS = [
  {
    word: 'Mission',
    text: 'Take the frustration out of finding car parts by putting one request in front of a trusted network of suppliers — fast, transparent, fair.',
  },
  {
    word: 'Vision',
    text: 'The marketplace drivers trust first: any part, the right price, no second-guessing.',
  },
  {
    word: 'Values',
    text: 'Transparency, reliability, customer first. We never charge customers a commission — suppliers who value the platform pay for it.',
  },
];

const STRIP = [PHOTOS.wrenchHands, PHOTOS.toolWall, PHOTOS.oilChange, PHOTOS.wiring, PHOTOS.tyres];

export default function AboutUsPage() {
  const stripRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: stripRef, offset: ['start end', 'end start'] });
  const stripX = useTransform(scrollYProgress, [0, 1], ['4%', '-22%']);

  return (
    <>
      <PageHero
        layout="full"
        index="03"
        label="About us"
        title={['We got tired', 'of ringing', 'round.']}
        photo={PHOTOS.wrenchHands}
        aside={
          <p className="border-l-2 border-signal pl-5 text-[17px] leading-relaxed text-bone/85">
            CarParts Finder started with one simple frustration: finding the right part at the right price
            shouldn’t be a full-time job.
          </p>
        }
      />

      {/* ── story ── */}
      <section className="paper-section py-24 lg:py-32">
        <div className="shell grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionMark index="01" label="The story" tone="light" className="mb-8 lg:sticky lg:top-28" />
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <Reveal>
              <p className="mb-10 font-display text-[clamp(1.9rem,3.4vw,3rem)] font-bold uppercase leading-[1.02]">
                Calling five suppliers, getting five different prices, and still not knowing if the part would
                fit. That was the job before we built this.
              </p>
            </Reveal>
            <div className="columns-1 gap-10 text-[17px] leading-relaxed text-paper-ink/75 md:columns-2">
              <Reveal>
                <p className="mb-5 first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-6xl first-letter:font-black first-letter:leading-[0.8] first-letter:text-signal-dark">
                  We started CarParts Finder after watching everyday drivers in the UAE fight the same fight:
                  call around, get inconsistent quotes, and never be sure the price was fair. It was exhausting,
                  and it was the norm.
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mb-5">
                  So we built a better way. You send one request; verified suppliers compete to give you the
                  best deal. You get options. Suppliers get qualified leads. Everyone wins.
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                <p>
                  Today we work with over 500 suppliers, covering everything from everyday wear parts to rare
                  OEM components for classic and luxury vehicles.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── numbers ── */}
      <section className="border-b border-ink-line bg-ink">
        <div className="shell grid grid-cols-2 lg:grid-cols-4">
          {[
            { v: 2019, label: 'Founded', plain: true },
            { v: 500, s: '+', label: 'Suppliers' },
            { v: 50, s: 'K+', label: 'Requests handled' },
            { v: 0, s: '', label: 'Fees to customers', note: 'and that stays' },
          ].map((n, i) => (
            <Reveal
              key={n.label}
              delay={i * 0.08}
              className="group border-ink-line py-12 [&:nth-child(n+3)]:border-t lg:border-l lg:px-8 lg:first:border-l-0 lg:first:pl-0 lg:[&:nth-child(n+3)]:border-t-0"
            >
              {n.plain ? (
                <span className="font-display text-[clamp(3rem,6vw,5.5rem)] font-extrabold leading-none text-bone transition-colors group-hover:text-signal">
                  {n.v}
                </span>
              ) : (
                <Odometer
                  value={n.v}
                  suffix={n.s}
                  className="font-display text-[clamp(3rem,6vw,5.5rem)] font-extrabold leading-none text-bone transition-colors group-hover:text-signal"
                />
              )}
              <p className="mt-3 text-steel">
                {n.label}
                {n.note && <span className="text-steel/60"> — {n.note}</span>}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── vetting ── */}
      <section className="bg-ink py-24 lg:py-32">
        <div className="shell grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionMark index="02" label="Who gets in" className="mb-8" />
            <h2 className="display mb-10 text-[clamp(2.6rem,5vw,4.6rem)] text-bone">
              <MaskLines lines={['Not everyone', 'with a phone', 'is a supplier.']} />
            </h2>
            <Reveal className="relative hidden aspect-[4/3] overflow-hidden lg:block">
              <div
                className="absolute inset-0 bg-cover bg-center grayscale transition-all duration-1000 hover:scale-105 hover:grayscale-0"
                style={{ backgroundImage: `url(${PHOTOS.mechanic})` }}
              />
            </Reveal>
          </div>
          <ol className="self-end border-t border-ink-line lg:col-span-6 lg:col-start-7">
            {VETTING.map(([t, d], i) => (
              <Reveal as="li" key={t} delay={i * 0.08} className="group relative border-b border-ink-line">
                <div className="flex gap-6 py-7 transition-transform duration-500 group-hover:translate-x-2">
                  <span className="font-display text-5xl font-extrabold leading-none text-ink-line transition-colors duration-300 group-hover:text-signal">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="mb-1.5 text-xl font-medium text-bone">{t}</h3>
                    <p className="leading-relaxed text-steel">{d}</p>
                  </div>
                </div>
                <span className="absolute bottom-[-1px] left-0 h-px w-0 bg-signal transition-all duration-700 group-hover:w-full" />
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── photo strip that drifts with scroll ── */}
      <div ref={stripRef} className="overflow-hidden border-y border-ink-line bg-ink py-3">
        <motion.div style={{ x: stripX }} className="flex gap-3">
          {[...STRIP, ...STRIP].map((src, i) => (
            <div
              key={i}
              className="h-[260px] w-[380px] shrink-0 bg-cover bg-center grayscale transition-[filter] duration-500 hover:grayscale-0 sm:h-[320px] sm:w-[460px]"
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </motion.div>
      </div>

      {/* ── beliefs ── */}
      <section className="paper-section py-24 lg:py-32">
        <div className="shell">
          <SectionMark index="03" label="What we hold to" tone="light" className="mb-14" />
          <div className="border-t border-paper-line">
            {BELIEFS.map((b, i) => (
              <Reveal key={b.word} delay={i * 0.06}>
                <div className="group grid items-baseline gap-4 border-b border-paper-line py-10 lg:grid-cols-12">
                  <h3 className="display text-[clamp(3rem,7vw,6.5rem)] transition-colors duration-300 group-hover:text-signal-dark lg:col-span-5">
                    {b.word}
                  </h3>
                  <p className="max-w-xl text-lg leading-relaxed text-paper-ink/75 lg:col-span-6 lg:col-start-7">{b.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-ink py-24">
        <div className="shell flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <h2 className="display text-[clamp(2.6rem,5.4vw,5rem)] text-bone">
            <MaskLines lines={['Enough about us.', <span key="b" className="text-signal">What do you need?</span>]} />
          </h2>
          <Link to="/find-parts" tabIndex={-1}>
            <Button size="lg" arrow>Start your search</Button>
          </Link>
        </div>
      </section>
    </>
  );
}
