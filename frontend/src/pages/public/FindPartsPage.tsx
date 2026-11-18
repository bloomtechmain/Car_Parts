import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import RequestWizard, { RequestBlockedNotice } from '../../components/find-parts/RequestWizard';
import { useRequestBlock } from '../../components/find-parts/useRequestBlock';
import Docket from '../../components/find-parts/Docket';
import PageHero from '../../components/layout/PageHero';
import { MaskLines, Reveal, SectionMark } from '../../components/ui/Reveal';
import { CAR_MAKES, PART_CATEGORIES, PHOTOS } from '../../constants/brand';
import type { FindPartsFormData } from '../../types';

const TIPS = [
  ['Say which side', 'Left or right, front or rear. Half of all wrong parts are the right part for the other side.'],
  ['Mention the engine', '1.8 or 2.0? Petrol, diesel or hybrid? Different engines, different parts.'],
  ['OEM or aftermarket', 'Tell us if you only want genuine parts — or if a good copy at half the price is fine.'],
  ['Part number wins', 'If the old part has a number stamped on it, type it in. Nothing is faster.'],
];

/* Pre-fill from the home page: ?make=&model=&part=&category= */
function initialFromQuery(params: URLSearchParams): Partial<FindPartsFormData> {
  const out: Partial<FindPartsFormData> = {};
  const make = params.get('make');
  const model = params.get('model');
  const part = params.get('part');
  const category = params.get('category');
  if (make && CAR_MAKES.includes(make)) out.car_make = make;
  if (model) out.car_model = model.slice(0, 100);
  if (part) out.part_name = part.slice(0, 255);
  if (category && PART_CATEGORIES.includes(category)) out.part_category = category;
  return out;
}

export default function FindPartsPage() {
  const [params] = useSearchParams();
  const [initial] = useState(() => initialFromQuery(params));
  const logout = useAuthStore((s) => s.logout);
  // Only customer accounts can raise requests. Guests fill in the steps and log in / register at the end;
  // admin and supplier accounts are blocked so staff and suppliers stay separate from customers.
  const blocked = useRequestBlock();

  return (
    <>
      <PageHero
        index="02"
        label="Request desk"
        title={['Tell us', 'what broke.']}
        intro="Three short steps, no fee. Your request goes to verified suppliers the moment you send it — and you can track it in your account."
        photo={PHOTOS.openBonnet}
        rail={['Takes about two minutes', 'Free customer account', 'Your details stay with us']}
        compact
      />

      {/* ── who may request: customers only ── */}
      {blocked ? (
        <section id="request" className="bg-ink py-16 lg:py-24">
          <div className="shell">
            <RequestBlockedNotice role={blocked} onLogout={logout} />
          </div>
        </section>
      ) : (
        /* ── the form ── */
        <section id="request" className="bg-ink py-16 lg:py-24">
          <RequestWizard initial={initial} onSubmitted={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            {({ form, docketData, step, ticketNumber }) => (
              <div className="shell grid gap-12 lg:grid-cols-12">
                <div className="lg:col-span-7">{form}</div>
                <aside className="lg:col-span-4 lg:col-start-9">
                  <div className="lg:sticky lg:top-24">
                    <motion.div
                      initial={{ opacity: 0, y: 30, rotate: 2 }}
                      animate={{ opacity: 1, y: 0, rotate: step === 4 ? -1.5 : 0.6 }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                    >
                      <Docket data={docketData} ticketNumber={ticketNumber} />
                    </motion.div>
                    <p className="mt-8 text-sm leading-relaxed text-steel">
                      This is what suppliers will see — minus anything personal. The more of it is filled in, the
                      quicker and closer the quotes.
                    </p>
                  </div>
                </aside>
              </div>
            )}
          </RequestWizard>
        </section>
      )}

      {/* ── tips ── */}
      <section className="paper-section py-20 lg:py-28">
        <div className="shell">
          <div className="mb-12 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <SectionMark index="A" label="Getting a fast quote" tone="light" className="mb-8" />
              <h2 className="display text-[clamp(2.4rem,5vw,4.4rem)]">
                <MaskLines lines={['Four habits of', 'quick requests.']} />
              </h2>
            </div>
            <p className="self-end text-paper-ink/70 lg:col-span-4 lg:col-start-9">
              Suppliers quote fastest when there’s nothing to guess. These four things remove the guessing.
            </p>
          </div>
          <div className="grid gap-px border border-paper-line bg-paper-line sm:grid-cols-2 lg:grid-cols-4">
            {TIPS.map(([t, d], i) => (
              <Reveal key={t} delay={i * 0.08} className="group bg-paper p-7 transition-colors duration-300 hover:bg-paper-ink hover:text-bone">
                <span className="font-display text-5xl font-extrabold text-paper-ink/15 transition-colors group-hover:text-signal">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mb-2 mt-6 text-lg font-semibold">{t}</h3>
                <p className="text-sm leading-relaxed text-paper-ink/70 transition-colors group-hover:text-bone/70">{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── what you'll get back ── */}
      <section className="bg-ink py-20 lg:py-28">
        <div className="shell grid items-center gap-12 lg:grid-cols-12">
          <Reveal className="relative lg:col-span-5">
            <div className="aspect-[4/5] bg-cover bg-center grayscale transition-all duration-700 hover:grayscale-0" style={{ backgroundImage: `url(${PHOTOS.mechanic})` }} />
            <span className="label absolute -bottom-3 left-4 bg-signal px-2 py-1 text-[10px] text-ink">Checked before it’s sent</span>
          </Reveal>
          <div className="lg:col-span-6 lg:col-start-7">
            <SectionMark index="B" label="What comes back" className="mb-8" />
            <h2 className="display mb-8 text-[clamp(2.4rem,5vw,4.4rem)] text-bone">
              <MaskLines lines={['A short list,', 'not a long one.']} />
            </h2>
            <Reveal>
              <p className="mb-8 text-[17px] leading-relaxed text-steel">
                You won’t get twenty messages from twenty sellers. Our team reads every quote, drops anything that
                doesn’t add up, and sends you the few worth choosing between.
              </p>
            </Reveal>
            <dl className="grid grid-cols-2 border-t border-ink-line">
              {[
                ['Price', 'Final, in your currency'],
                ['Delivery', 'In days, from the supplier'],
                ['Option no.', 'So you can compare'],
                ['One link', 'Pick your option there'],
              ].map(([k, v]) => (
                <div key={k} className="border-b border-ink-line py-4 pr-4">
                  <dt className="label text-[10px] text-signal">{k}</dt>
                  <dd className="mt-1 text-bone">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
