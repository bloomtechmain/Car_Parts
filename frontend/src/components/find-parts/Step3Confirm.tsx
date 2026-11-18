import { useEffect, useState } from 'react';
import { Lock, Mail, Phone, LogIn, UserPlus } from 'lucide-react';
import Button from '../ui/Button';
import StepHeader from './StepHeader';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';

interface Props {
  onSubmit: () => Promise<void> | void;
  onBack: () => void;
  loading?: boolean;
}

function apiError(err: unknown, fallback: string): string {
  const msg = err && typeof err === 'object' && 'response' in err
    ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
    : undefined;
  return msg || fallback;
}

/**
 * Last step: no contact form — emails go to the account email and SMS to the account phone.
 * Guests log in or create an account right here, then the request is sent straight away,
 * so nothing typed in steps 1–2 is lost.
 */
export default function Step3Confirm({ onSubmit, onBack, loading }: Props) {
  const { token, user, login } = useAuthStore();
  const isCustomer = Boolean(token) && user?.role === 'customer';
  const [phone, setPhone] = useState<string | null>(null);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (!isCustomer) return;
    api.get('/api/customer/profile').then((res) => setPhone(res.data.phone || '')).catch(() => {});
  }, [isCustomer]);

  const authenticateAndSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (mode === 'register') {
      if (regPhone.trim().length < 7) return setAuthError('Enter a valid phone number');
      if (password.length < 8) return setAuthError('Password must be at least 8 characters');
      if (password !== confirm) return setAuthError('Passwords do not match');
    }
    setAuthLoading(true);
    try {
      const res = mode === 'login'
        ? await api.post('/api/auth/login', { email, password })
        : await api.post('/api/auth/register', { email, phone: regPhone, password });
      if (res.data.user.role !== 'customer') {
        setAuthError('That password opens a supplier/admin account. Use your customer account password, or create a customer account.');
        return;
      }
      login(res.data.token, res.data.user);
      await onSubmit();
    } catch (err) {
      setAuthError(apiError(err, mode === 'login' ? 'Invalid email or password' : 'Could not create the account'));
    } finally {
      setAuthLoading(false);
    }
  };

  const privacy = (
    <div className="mb-8 flex gap-3 border-l-2 border-signal bg-ink-2 px-4 py-3 text-sm text-steel">
      <Lock size={15} className="mt-0.5 shrink-0 text-signal" />
      <p>
        <span className="text-bone">Only our team sees your details.</span> Suppliers get the car and the part — never
        your email or number.
      </p>
    </div>
  );

  /* ── logged in as a customer: just confirm ── */
  if (isCustomer) {
    return (
      <div>
        <StepHeader no="03" title="Confirm & send" hint="We'll use your account details to reach you." />
        {privacy}
        <div className="mb-10 space-y-3 border border-ink-line p-5 text-sm">
          <p className="flex items-center gap-3 text-bone"><Mail size={15} className="text-signal" /> {user!.email} <span className="text-steel">— quotes &amp; updates by email</span></p>
          <p className="flex items-center gap-3 text-bone"><Phone size={15} className="text-signal" /> {phone ?? '…'} <span className="text-steel">— SMS when you order</span></p>
          <p className="pt-1 text-xs text-steel">Wrong number? Change it any time in My Account.</p>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="secondary" size="lg" onClick={onBack} disabled={loading}>Back</Button>
          <Button type="button" size="lg" className="flex-1" loading={loading} arrow onClick={() => onSubmit()}>
            {loading ? 'Sending to suppliers' : 'Send my request'}
          </Button>
        </div>
      </div>
    );
  }

  /* ── guest: log in or register, then send ── */
  const busy = authLoading || loading;
  return (
    <form onSubmit={authenticateAndSend}>
      <StepHeader no="03" title="Log in to send" hint="Your request is ready. Log in or create a free account to send it." />
      {privacy}

      <div className="mb-8 grid grid-cols-2 border border-ink-line">
        {(['login', 'register'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setAuthError(null); }}
            className={cn(
              'flex items-center justify-center gap-2 py-3 text-sm transition-colors',
              mode === m ? 'bg-signal text-ink font-semibold' : 'text-steel hover:text-bone',
            )}
          >
            {m === 'login' ? <><LogIn size={15} /> I have an account</> : <><UserPlus size={15} /> Create account</>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
        <div className={mode === 'login' ? 'sm:col-span-2' : ''}>
          <label className="field-label">Email *</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@example.com" className="input-base" autoComplete="email" />
        </div>
        {mode === 'register' && (
          <div>
            <label className="field-label">Phone *</label>
            <input value={regPhone} onChange={(e) => setRegPhone(e.target.value)} type="tel" required placeholder="+94 77 000 0000" className="input-base" autoComplete="tel" />
          </div>
        )}
        <div className={mode === 'login' ? 'sm:col-span-2' : ''}>
          <label className="field-label">Password *</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'} className="input-base" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
        </div>
        {mode === 'register' && (
          <div>
            <label className="field-label">Confirm password *</label>
            <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" required className="input-base" autoComplete="new-password" />
          </div>
        )}
      </div>

      {mode === 'register' && (
        <p className="mt-5 text-xs text-steel">
          Already a supplier with us? Same email is fine — just use a different password for your customer account.
        </p>
      )}

      {authError && (
        <p role="alert" className="mt-6 border-l-2 border-red-500 bg-red-500/10 px-4 py-3 text-sm text-red-300">{authError}</p>
      )}

      <div className="mt-10 flex gap-3">
        <Button type="button" variant="secondary" size="lg" onClick={onBack} disabled={busy}>Back</Button>
        <Button type="submit" size="lg" className="flex-1" loading={busy} arrow>
          {busy ? 'Sending' : mode === 'login' ? 'Log in & send request' : 'Create account & send request'}
        </Button>
      </div>
    </form>
  );
}
