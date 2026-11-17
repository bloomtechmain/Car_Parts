import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import Logo from '../../components/ui/Logo';
import Button from '../../components/ui/Button';
import PistonLoader from '../../components/ui/PistonLoader';
import { PHOTOS } from '../../constants/brand';

interface OptionPreview {
  ticket_number: string;
  car_make: string;
  car_model: string;
  car_year: number;
  part_name: string;
  part_category: string;
  option: {
    reply_id: number;
    admin_price: number;
    delivery_days: number;
    option_number: number;
  };
}

type PageState = 'loading' | 'preview' | 'confirming' | 'confirmed' | 'error' | 'already_done';

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2 py-2.5 text-sm">
      <dt className="label shrink-0 text-[10px] text-paper-ink/50">{k}</dt>
      <span className="mb-1 flex-1 border-b border-dotted border-paper-line" />
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}

function Message({ tone, kicker, title, body }: { tone: 'good' | 'bad'; kicker: string; title: string; body: string }) {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-left"
    >
      <p className={`label mb-5 ${tone === 'good' ? 'text-signal' : 'text-red-400'}`}>{kicker}</p>
      <h1 className="display mb-5 text-[clamp(2.8rem,8vw,4.6rem)] text-bone">{title}</h1>
      <p className="mb-10 max-w-sm leading-relaxed text-steel">{body}</p>
      <Link to="/" tabIndex={-1}>
        <Button variant="secondary">Go to the website</Button>
      </Link>
    </motion.div>
  );
}

export default function SelectOptionPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const reply = searchParams.get('reply') ?? '';

  const incomplete = !token || !reply;
  const [state, setState] = useState<PageState>(incomplete ? 'error' : 'loading');
  const [preview, setPreview] = useState<OptionPreview | null>(null);
  const [errorMsg, setErrorMsg] = useState(incomplete ? 'This link is invalid or incomplete.' : '');

  useEffect(() => {
    if (incomplete) return;

    api.get(`/api/tickets/select-option?token=${encodeURIComponent(token)}&reply=${encodeURIComponent(reply)}`)
      .then((res) => {
        setPreview(res.data);
        setState('preview');
      })
      .catch((err) => {
        const data = err?.response?.data;
        if (data?.already_selected) {
          setState('already_done');
        } else {
          setErrorMsg(data?.error || 'This link is invalid or has expired.');
          setState('error');
        }
      });
  }, [token, reply, incomplete]);

  const handleConfirm = async () => {
    setState('confirming');
    try {
      await api.post('/api/tickets/confirm-selection', {
        token,
        reply_id: Number(reply),
      });
      setState('confirmed');
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: string; already_selected?: boolean } } })?.response?.data;
      if (data?.already_selected) {
        setState('already_done');
      } else {
        setErrorMsg(data?.error || 'Failed to confirm selection. Please try again.');
        setState('error');
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-15 grayscale"
        style={{ backgroundImage: `url(${PHOTOS.garageNight})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 to-ink" />

      <div className="shell relative flex min-h-screen flex-col py-8">
        <Logo />

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              {state === 'loading' && (
                <motion.div key="loading" exit={{ opacity: 0 }} className="flex flex-col items-start gap-5">
                  <PistonLoader size="lg" />
                  <p className="label text-steel">Pulling up your option…</p>
                </motion.div>
              )}

              {(state === 'preview' || state === 'confirming') && preview && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 30, rotate: 1.5 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="label mb-4 text-signal">Option {preview.option.option_number} — your pick</p>
                  <h1 className="display mb-8 text-[clamp(2.8rem,8vw,4.4rem)] text-bone">Confirm your order.</h1>

                  <div className="bg-paper text-paper-ink">
                    <div className="flex items-center justify-between border-b border-dashed border-paper-line px-5 py-4">
                      <span className="label text-[10px] text-paper-ink/60">Ticket</span>
                      <span className="font-mono text-sm tracking-widest">{preview.ticket_number}</span>
                    </div>
                    <dl className="px-5 py-2">
                      <Row k="Vehicle" v={`${preview.car_year} ${preview.car_make} ${preview.car_model}`} />
                      <Row k="Part" v={preview.part_name} />
                      <Row k="Section" v={preview.part_category} />
                      <Row
                        k="Delivery"
                        v={`${preview.option.delivery_days} day${preview.option.delivery_days !== 1 ? 's' : ''}`}
                      />
                    </dl>
                    <div className="flex items-end justify-between border-t border-paper-line px-5 py-5">
                      <span className="label text-[10px] text-paper-ink/60">Total</span>
                      <span className="font-display text-5xl font-extrabold leading-none">
                        Rs. {Number(preview.option.admin_price).toLocaleString('si-LK')}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleConfirm}
                    loading={state === 'confirming'}
                    size="lg"
                    arrow
                    className="mt-4 w-full"
                  >
                    {state === 'confirming' ? 'Confirming' : 'Confirm & place order'}
                  </Button>
                  <p className="mt-4 text-xs leading-relaxed text-steel">
                    By confirming, your order is placed and you’ll receive a confirmation email and SMS.
                  </p>
                </motion.div>
              )}

              {state === 'confirmed' && (
                <Message
                  tone="good"
                  kicker="Order placed"
                  title="Done. It’s yours."
                  body="Your order has been placed. A confirmation email and SMS are on their way, and our team will be in touch with delivery details."
                />
              )}

              {state === 'already_done' && (
                <Message
                  tone="good"
                  kicker="Already confirmed"
                  title="You’re all set."
                  body="An option has already been selected for this ticket, so your order is confirmed. Nothing else to do."
                />
              )}

              {state === 'error' && (
                <Message tone="bad" kicker="Link problem" title="That link didn’t work." body={errorMsg} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
