import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ShieldAlert, LayoutDashboard } from 'lucide-react';
import Button from '../ui/Button';
import StepIndicator from './StepIndicator';
import Step1CarInfo from './Step1CarInfo';
import Step2PartInfo from './Step2PartInfo';
import Step3Confirm from './Step3Confirm';
import SuccessScreen from './SuccessScreen';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import type { FindPartsFormData } from '../../types';

const REQUEST_STEPS = ['The car', 'The part', 'Confirm'];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export interface WizardState {
  form: React.ReactNode;
  docketData: Partial<FindPartsFormData>;
  step: number;
  ticketNumber: string | null;
}

interface Props {
  initial?: Partial<FindPartsFormData>;
  /** Called after a successful submit (e.g. to scroll the page / modal to the top) */
  onSubmitted?: () => void;
  /** Shown on the success screen instead of "Back to home" (used by the popup) */
  onClose?: () => void;
  /** Lets the page lay the form out next to the live docket. Defaults to just the form. */
  children?: (state: WizardState) => React.ReactNode;
}

/**
 * The 3-step part request: 01 The car → 02 The part → 03 Confirm (log in / register if needed).
 * Used by the Find Parts page and the home-page popup.
 */
export default function RequestWizard({ initial, onSubmitted, onClose, children }: Props) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<Partial<FindPartsFormData>>(() => initial ?? {});
  const [live, setLive] = useState<Partial<FindPartsFormData>>({});
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { token, user } = useAuthStore();
  const role = token && user ? user.role : null;

  const onLive = useCallback((d: Partial<FindPartsFormData>) => setLive(d), []);

  const goNext = (data: Partial<FindPartsFormData>) => {
    setDirection(1);
    setFormData((prev) => ({ ...prev, ...data }));
    setLive({});
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setDirection(-1);
    setLive({});
    setStep((s) => s - 1);
  };

  // Contact details come from the logged-in customer account (email for emails, phone for SMS)
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/tickets', { ...formData });
      setTicketNumber(res.data.ticket_number);
      setStep(4);
      onSubmitted?.();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      toast.error(msg || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const form = (
    <>
      {step < 4 && <StepIndicator currentStep={step} steps={REQUEST_STEPS} />}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 1 && <Step1CarInfo defaultValues={formData} onNext={goNext} onLive={onLive} />}
            {step === 2 && <Step2PartInfo defaultValues={formData} onNext={goNext} onBack={goBack} onLive={onLive} />}
            {step === 3 && <Step3Confirm onSubmit={handleSubmit} onBack={goBack} loading={loading} />}
            {step === 4 && ticketNumber && <SuccessScreen ticketNumber={ticketNumber} onClose={onClose} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );

  const docketData = { ...formData, ...live, ...(role === 'customer' && user ? { email: user.email } : {}) };

  return <>{children ? children({ form, docketData, step, ticketNumber }) : form}</>;
}

/** Admins and suppliers can't raise requests — shown instead of the steps. */
export function RequestBlockedNotice({ role, onLogout }: { role: 'admin' | 'supplier'; onLogout: () => void }) {
  return (
    <div role="alert" className="mx-auto max-w-2xl border border-signal/50 bg-ink-line/30 p-8 text-center sm:p-12">
      <ShieldAlert size={44} className="mx-auto mb-6 text-signal" />
      <p className="label mb-3 text-signal">{role === 'admin' ? 'Admin account' : 'Supplier account'}</p>
      <h2 className="display mb-4 text-[clamp(2rem,4vw,3rem)] text-bone">
        {role === 'admin' ? 'You are an admin.' : 'You are signed in as a supplier.'}
      </h2>
      <p className="mb-8 text-[17px] leading-relaxed text-steel">
        Part requests can't be made from {role === 'admin' ? 'an admin' : 'a supplier'} account. Please use a
        customer account to request a part — log out, then sign in with your customer account
        {role === 'supplier' ? ' (same email is fine, with its own password)' : ''}.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to={`/dashboard/${role}`} tabIndex={-1}>
          <Button size="lg">
            <span className="flex items-center gap-2"><LayoutDashboard size={18} /> Back to {role} dashboard</span>
          </Button>
        </Link>
        <Button size="lg" variant="secondary" onClick={onLogout}>Log out &amp; use customer account</Button>
      </div>
    </div>
  );
}
