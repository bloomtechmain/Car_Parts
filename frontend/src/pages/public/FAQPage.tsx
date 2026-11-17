import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X, ArrowUpRight } from 'lucide-react';
import Accordion from '../../components/ui/Accordion';
import { MaskLines, Reveal, SectionMark } from '../../components/ui/Reveal';
import { FAQ_GROUPS } from '../../constants/faqs';
import { BRAND, PHOTOS } from '../../constants/brand';
import { cn } from '../../utils/cn';

export default function FAQPage() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(FAQ_GROUPS[0].id);

  const q = query.trim().toLowerCase();
  const groups = useMemo(
    () =>
      FAQ_GROUPS.map((g) => ({
        ...g,
        items: q
          ? g.items.filter((it) => (it.question + ' ' + it.answer).toLowerCase().includes(q))
          : g.items,
      })).filter((g) => g.items.length > 0),
    [q],
  );
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  /* running question number so numbering continues across sections */
  const starts = groups.map((_, i) => groups.slice(0, i).reduce((n, g) => n + g.items.length, 0));

  return (
    <>
      {/* ── hero with live search ── */}
      <section className="relative overflow-hidden bg-ink pt-[72px]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 grayscale"
          style={{ backgroundImage: `url(${PHOTOS.wiring})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/80 to-ink" />
        {/* oversized question mark in the background */}
        <motion.span
          aria-hidden
          initial={{ opacity: 0, rotate: -12, y: 60 }}
          animate={{ opacity: 1, rotate: 6, y: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="pointer-events-none absolute -right-6 top-6 font-display text-[clamp(18rem,40vw,38rem)] font-black leading-none text-transparent [-webkit-text-stroke:1.5px_#2d2a24]"
        >
          ?
        </motion.span>

        <div className="shell relative pb-16 pt-14 lg:pb-20 lg:pt-24">
          <div className="mb-8 flex items-center gap-4">
            <span className="label text-signal">04</span>
            <span className="h-px w-12 bg-bone/30" />
            <span className="label text-steel">Questions</span>
          </div>
          <h1 className="display mb-12 text-[clamp(3.2rem,8vw,7.4rem)] text-bone">
            <MaskLines animateOnMount delay={0.2} lines={['Ask it plainly.', <span key="2" className="text-signal">We’ll answer it plainly.</span>]} />
          </h1>

          <motion.label
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="flex max-w-2xl items-center gap-4 border-b-2 border-bone/30 pb-3 transition-colors focus-within:border-signal"
          >
            <Search size={22} className="shrink-0 text-steel" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search — try “VIN”, “price” or “supplier”"
              className="w-full bg-transparent text-xl text-bone placeholder:text-steel/60 focus:outline-none sm:text-2xl"
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Clear search" className="text-steel hover:text-bone">
                <X size={20} />
              </button>
            )}
          </motion.label>
          <p className="label mt-4 text-steel">
            {q ? `${total} answer${total === 1 ? '' : 's'} for “${query.trim()}”` : `${total} answers in ${FAQ_GROUPS.length} sections`}
          </p>
        </div>
      </section>

      {/* ── grouped answers ── */}
      <section className="bg-ink pb-24 lg:pb-32">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <nav className="hidden lg:col-span-3 lg:block" aria-label="FAQ sections">
            <ul className="sticky top-28 space-y-1 border-l border-ink-line">
              {FAQ_GROUPS.map((g, i) => (
                <li key={g.id}>
                  <a
                    href={`#${g.id}`}
                    onClick={() => setActive(g.id)}
                    className={cn(
                      '-ml-px flex items-baseline gap-3 border-l py-2 pl-5 text-sm transition-colors',
                      active === g.id ? 'border-signal text-bone' : 'border-transparent text-steel hover:text-bone',
                    )}
                  >
                    <span className="font-mono text-[10px]">{String.fromCharCode(65 + i)}</span>
                    {g.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-16 lg:col-span-9">
            {groups.length === 0 && (
              <div className="border border-dashed border-ink-line p-10 text-center">
                <p className="mb-2 text-lg text-bone">Nothing matches that.</p>
                <p className="text-steel">
                  Ask us directly — <Link to="/contact" className="text-signal link-draw">get in touch</Link>.
                </p>
              </div>
            )}
            {groups.map((g, gi) => {
              const start = starts[gi];
              const letter = String.fromCharCode(65 + FAQ_GROUPS.findIndex((x) => x.id === g.id));
              return (
                <motion.div
                  key={g.id}
                  id={g.id}
                  className="scroll-mt-28"
                  onViewportEnter={() => setActive(g.id)}
                  viewport={{ margin: '-40% 0px -50% 0px' }}
                >
                  <div className="mb-4 flex items-baseline gap-4">
                    <span className="font-display text-4xl font-extrabold text-signal">{letter}</span>
                    <h2 className="font-display text-3xl font-bold uppercase text-bone">{g.title}</h2>
                  </div>
                  <Accordion key={q} items={g.items} startAt={start} defaultOpen={q ? 0 : null} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── still stuck ── */}
      <section className="paper-section py-20 lg:py-24">
        <div className="shell">
          <SectionMark index="—" label="Didn’t find it?" tone="light" className="mb-10" />
          <div className="grid gap-px border border-paper-line bg-paper-line md:grid-cols-3">
            {[
              { k: 'Write', v: BRAND.email, href: `mailto:${BRAND.email}` },
              { k: 'Call', v: BRAND.phone, href: `tel:${BRAND.phone.replace(/\s/g, '')}` },
              { k: 'Use the form', v: 'Contact page', to: '/contact' },
            ].map((c, i) => {
              const inner = (
                <>
                  <span className="label text-[10px] text-paper-ink/50">{c.k}</span>
                  <span className="mt-6 flex items-end justify-between gap-4">
                    <span className="min-w-0 text-xl font-medium [overflow-wrap:anywhere] sm:text-2xl">{c.v}</span>
                    <ArrowUpRight size={22} className="shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </span>
                </>
              );
              const cls = 'group flex flex-col justify-between bg-paper p-7 transition-colors duration-300 hover:bg-signal';
              return (
                <Reveal key={c.k} delay={i * 0.08}>
                  {c.to ? (
                    <Link to={c.to} className={cls}>{inner}</Link>
                  ) : (
                    <a href={c.href} className={cls}>{inner}</a>
                  )}
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
