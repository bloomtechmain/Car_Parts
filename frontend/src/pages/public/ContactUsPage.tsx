import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import PageHero from '../../components/layout/PageHero';
import { MaskLines, Reveal, SectionMark } from '../../components/ui/Reveal';
import api from '../../services/api';
import { BRAND, PHOTOS } from '../../constants/brand';
import { cn } from '../../utils/cn';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormData = z.infer<typeof schema>;

const TOPICS = ['A request I made', 'Joining as a supplier', 'Something else'];

const JOIN = [
  ['Write to us', 'Use the form with “Joining as a supplier”. Tell us what you stock and where you are.'],
  ['We check you out', 'Trade licence, location, contact details. It doesn’t take long.'],
  ['You get a login', 'We set up your supplier account and requests start arriving in the portal.'],
];

export default function ContactUsPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const subject = watch('subject');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await api.post('/api/tickets/contact', data);
      toast.success('Message sent');
      setSent(true);
      reset();
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const channels = [
    { k: 'Email', v: BRAND.email, href: `mailto:${BRAND.email}` },
    { k: 'Phone', v: BRAND.phone, href: `tel:${BRAND.phone.replace(/\s/g, '')}` },
    { k: 'Office', v: BRAND.address },
  ];

  return (
    <>
      <PageHero
        index="05"
        label="Contact"
        title={['Talk to', 'a person.']}
        intro="No bots, no ticket queue. Messages land with the same small team that checks every quote."
        photo={PHOTOS.toolWall}
        aside={
          <div className="flex items-center gap-3 bg-ink/80 px-4 py-3 backdrop-blur-sm">
            <span className="h-2 w-2 animate-blink bg-signal" />
            <span className="text-sm text-bone">We usually reply within one working day.</span>
          </div>
        }
      />

      {/* ── channels ── */}
      <section className="border-b border-ink-line bg-ink">
        <div className="shell">
          {channels.map((c, i) => {
            const body = (
              <>
                <span className="label w-24 shrink-0 text-steel">{c.k}</span>
                <span className="flex-1 font-display text-[clamp(1.8rem,4.6vw,4rem)] font-bold uppercase leading-none text-bone transition-[transform,color] duration-500 group-hover:translate-x-3 group-hover:text-signal" style={c.k === 'Email' ? { textTransform: 'none' } : undefined}>
                  {c.v}
                </span>
                {c.href && (
                  <ArrowUpRight size={28} className="hidden shrink-0 text-steel transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-signal sm:block" />
                )}
              </>
            );
            const cls = cn(
              'group flex flex-col gap-3 py-8 sm:flex-row sm:items-center sm:gap-8',
              i > 0 && 'border-t border-ink-line',
            );
            return (
              <Reveal key={c.k} delay={i * 0.06}>
                {c.href ? (
                  <a href={c.href} className={cls}>{body}</a>
                ) : (
                  <div className={cls}>{body}</div>
                )}
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── form ── */}
      <section id="contact-form" className="scroll-mt-24 bg-ink py-24 lg:py-32">
        <div className="shell grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionMark index="01" label="Send a message" className="mb-8" />
            <h2 className="display text-[clamp(2.4rem,4.6vw,4.2rem)] text-bone">
              <MaskLines lines={['Write it', 'like you’d', 'say it.']} />
            </h2>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="border border-ink-line p-10"
                >
                  <p className="label mb-4 text-signal">Delivered</p>
                  <h3 className="display mb-4 text-5xl text-bone">Got it. Thanks.</h3>
                  <p className="mb-8 text-steel">We’ll get back to you as soon as we can — usually within a working day.</p>
                  <button onClick={() => setSent(false)} className="link-draw text-sm text-bone">
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <div>
                    <span className="field-label mb-3">What’s it about? *</span>
                    <input type="hidden" {...register('subject')} />
                    <div className="flex flex-wrap gap-1.5">
                      {TOPICS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setValue('subject', t, { shouldValidate: true })}
                          className={cn(
                            'border px-4 py-2 text-sm transition-colors',
                            subject === t
                              ? 'border-signal bg-signal text-ink'
                              : 'border-ink-line text-steel hover:border-bone/40 hover:text-bone',
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    {errors.subject && <p className="field-error">{errors.subject.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                    <div>
                      <label className="field-label">Your name *</label>
                      <input {...register('name')} placeholder="John Smith" className="input-base" />
                      {errors.name && <p className="field-error">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="field-label">Email *</label>
                      <input {...register('email')} type="email" placeholder="you@example.com" className="input-base" />
                      {errors.email && <p className="field-error">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="field-label">Message *</label>
                    <textarea {...register('message')} rows={6} placeholder="Tell us more…" className="input-base resize-none" />
                    {errors.message && <p className="field-error">{errors.message.message}</p>}
                  </div>

                  <Button type="submit" size="lg" loading={loading} arrow>
                    {loading ? 'Sending' : 'Send message'}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── joining as a supplier ── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${PHOTOS.worktop})` }}
        />
        <div className="absolute inset-0 bg-signal/95 mix-blend-multiply" />
        <div className="absolute inset-0 bg-signal/80" />
        <div className="shell relative grid gap-12 py-24 text-ink lg:grid-cols-12 lg:py-28">
          <div className="lg:col-span-5">
            <p className="label mb-8 text-ink/70">For suppliers</p>
            <h2 className="display text-[clamp(2.6rem,5.6vw,5.2rem)]">
              <MaskLines lines={['Got parts', 'on the shelf?']} />
            </h2>
          </div>
          <ol className="border-t border-ink/25 lg:col-span-6 lg:col-start-7">
            {JOIN.map(([t, d], i) => (
              <Reveal as="li" key={t} delay={i * 0.1} className="group grid grid-cols-[3rem_1fr] border-b border-ink/25 py-6">
                <span className="font-mono text-sm">{String(i + 1).padStart(2, '0')}</span>
                <div className="transition-transform duration-500 group-hover:translate-x-2">
                  <h3 className="text-xl font-semibold">{t}</h3>
                  <p className="mt-1 text-ink/75">{d}</p>
                </div>
              </Reveal>
            ))}
            <Button
              type="button"
              variant="dark"
              size="lg"
              arrow
              className="mt-8"
              onClick={() => {
                setSent(false);
                setValue('subject', 'Joining as a supplier', { shouldValidate: true });
                document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            >
              Start the conversation
            </Button>
          </ol>
        </div>
      </section>
    </>
  );
}
