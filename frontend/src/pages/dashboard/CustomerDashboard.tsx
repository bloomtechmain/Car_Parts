import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import { RefreshCw, Plus, Car, Wrench, Check, CheckCircle2, Clock, PackageSearch, X, User } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { REQUEST_CREATED_EVENT, OPEN_REQUEST_EVENT } from '../../components/find-parts/RequestModal';

const openRequest = () => window.dispatchEvent(new Event(OPEN_REQUEST_EVENT));
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { formatPrice, formatDateTime } from '../../utils/formatters';
import { cn } from '../../utils/cn';
import type { CustomerTicket, CustomerTicketDetail } from '../../types';

function errorMessage(err: unknown, fallback: string): string {
  const msg = err && typeof err === 'object' && 'response' in err
    ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
    : undefined;
  return msg || fallback;
}

/** Customer-friendly status, based on where the request is in the flow */
function stage(t: { status: string; options_ready?: number; options?: unknown[]; selected_reply_id: number | null }) {
  const hasOptions = (t.options_ready ?? t.options?.length ?? 0) > 0;
  if (t.status === 'closed') {
    return t.selected_reply_id
      ? { label: 'Option selected', tone: 'bg-green-500/15 text-green-400 border-green-500/30' }
      : { label: 'Closed', tone: 'bg-slate-500/15 text-slate-300 border-slate-500/30' };
  }
  if (hasOptions) return { label: 'Options ready — choose one', tone: 'bg-signal/15 text-signal border-signal/40' };
  if (t.status === 'replied') return { label: 'Quotes coming in', tone: 'bg-blue-500/15 text-blue-300 border-blue-500/30' };
  return { label: 'Waiting for quotes', tone: 'bg-slate-500/15 text-slate-300 border-slate-500/30' };
}

function StageBadge({ t }: { t: Parameters<typeof stage>[0] }) {
  const s = stage(t);
  return <span className={cn('inline-block whitespace-nowrap border px-2 py-0.5 text-[11px] font-medium', s.tone)}>{s.label}</span>;
}

export default function CustomerDashboard() {
  const location = useLocation();
  const isAccount = location.pathname.endsWith('/account');

  return (
    <DashboardLayout>
      {isAccount ? <AccountView /> : <RequestsView />}
    </DashboardLayout>
  );
}

/* ───────────────────────── My requests ───────────────────────── */

function RequestsView() {
  const [tickets, setTickets] = useState<CustomerTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  // Arrived from an order email (?ticket=…): make sure this is the account that owns the ticket.
  // Wrong account → log out and ask for the right one, then come back here.
  const ticketParam = searchParams.get('ticket');
  const hintParam = searchParams.get('hint');
  useEffect(() => {
    if (!ticketParam) return;
    let cancelled = false;
    api.get(`/api/customer/tickets/${encodeURIComponent(ticketParam)}`)
      .then(() => {
        if (cancelled) return;
        setSelectedId(Number(ticketParam));
        navigate('/dashboard/customer', { replace: true });
      })
      .catch((err) => {
        if (cancelled || err?.response?.status !== 404) return;
        const back = `/dashboard/customer?${new URLSearchParams({ ticket: ticketParam, ...(hintParam ? { hint: hintParam } : {}) })}`;
        toast.error('This order belongs to a different account. Please log in with the right account.');
        logout();
        navigate(`/dashboard/login?${new URLSearchParams({ next: back, reason: 'wrong-account' })}`, { replace: true });
      });
    return () => { cancelled = true; };
  }, [ticketParam, hintParam, navigate, logout]);

  const fetchTickets = useCallback(
    () => api.get('/api/customer/tickets')
      .then((res) => setTickets(res.data.tickets))
      .catch(() => toast.error('Failed to load your requests'))
      .finally(() => setLoading(false)),
    [],
  );

  const load = () => { setLoading(true); fetchTickets(); };

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  useEffect(() => {
    const refresh = () => { fetchTickets(); };
    window.addEventListener(REQUEST_CREATED_EVENT, refresh);
    return () => window.removeEventListener(REQUEST_CREATED_EVENT, refresh);
  }, [fetchTickets]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="min-w-0 flex-1">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">My Requests</h1>
            <p className="mt-0.5 text-sm text-slate-400">Track your part requests and choose from the options we send you</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={load}>
              <RefreshCw size={15} /> Refresh
            </Button>
            <Button size="sm" onClick={openRequest}><Plus size={15} /> New request</Button>
          </div>
        </div>

        {loading ? (
          <Spinner className="mt-16" />
        ) : tickets.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <PackageSearch size={40} className="mx-auto mb-3 opacity-30" />
            <p>You haven't requested any parts yet.</p>
            <Button size="sm" className="mt-4" onClick={openRequest}>Request a part</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t, i) => (
              <motion.button
                key={t.id}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedId(t.id)}
                className={cn(
                  'w-full rounded-xl border bg-navy-card p-5 text-left transition-colors',
                  selectedId === t.id ? 'border-gold' : 'border-navy-border hover:border-slate-500',
                )}
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-sm font-bold text-gold">{t.ticket_number}</span>
                      <StageBadge t={t} />
                    </div>
                    <p className="font-semibold text-white">
                      {t.car_year} {t.car_make} {t.car_model}
                      <span className="font-normal text-slate-400"> — {t.part_name}</span>
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-start gap-1 text-xs text-slate-400 sm:items-end">
                    <span>{t.quotes_received} quote{t.quotes_received === 1 ? '' : 's'} received</span>
                    <span className="text-slate-500">{formatDateTime(t.created_at)}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {selectedId && (
        <div className="flex-shrink-0 lg:w-96 xl:w-[440px]">
          <div className="sticky top-24 overflow-hidden rounded-2xl border border-navy-border bg-navy-card">
            <RequestDetail key={selectedId} ticketId={selectedId} onClose={() => setSelectedId(null)} onChanged={load} />
          </div>
        </div>
      )}
    </div>
  );
}

function RequestDetail({ ticketId, onClose, onChanged }: { ticketId: number; onClose: () => void; onChanged: () => void }) {
  const [ticket, setTicket] = useState<CustomerTicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(
    () => api.get(`/api/customer/tickets/${ticketId}`)
      .then((res) => { setTicket(res.data); setConfirmingId(null); })
      .catch(() => toast.error('Failed to load request'))
      .finally(() => setLoading(false)),
    [ticketId],
  );

  useEffect(() => { load(); }, [load]);

  const select = async (replyId: number) => {
    setSubmitting(true);
    try {
      await api.post(`/api/customer/tickets/${ticketId}/select`, { reply_id: replyId });
      toast.success('Order placed! Check your email and SMS to complete payment.');
      await load();
      onChanged();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not confirm this option'));
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !ticket) return <Spinner className="my-16" />;
  if (!ticket) return null;

  const hasOptions = ticket.options.length > 0;
  const steps = [
    { label: 'Request sent', done: true },
    { label: `Quotes received${ticket.quotes_received ? ` (${ticket.quotes_received})` : ''}`, done: ticket.quotes_received > 0 },
    { label: 'Options ready', done: hasOptions },
    { label: 'Option selected', done: ticket.selected_reply_id !== null },
  ];

  return (
    <div>
      <div className="flex items-start justify-between border-b border-navy-border p-5">
        <div>
          <p className="font-mono text-sm font-bold text-gold">{ticket.ticket_number}</p>
          <p className="mt-1 text-white font-semibold">{ticket.part_name}</p>
          <div className="mt-2"><StageBadge t={ticket} /></div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Close">
          <X size={18} />
        </button>
      </div>

      {/* progress */}
      <ol className="border-b border-navy-border p-5">
        {steps.map((s, i) => (
          <li key={s.label} className="flex items-center gap-3 py-1.5 text-sm">
            <span className={cn(
              'flex h-5 w-5 items-center justify-center rounded-full border text-[10px]',
              s.done ? 'border-green-500 bg-green-500/20 text-green-400' : 'border-slate-600 text-slate-500',
            )}>
              {s.done ? <Check size={12} /> : i + 1}
            </span>
            <span className={s.done ? 'text-slate-200' : 'text-slate-500'}>{s.label}</span>
          </li>
        ))}
      </ol>

      {/* options */}
      <div className="border-b border-navy-border p-5">
        <h3 className="mb-3 text-sm font-semibold text-white">Your options</h3>
        {!hasOptions ? (
          <p className="flex gap-2 text-sm text-slate-400">
            <Clock size={16} className="mt-0.5 shrink-0" />
            {ticket.status === 'closed'
              ? 'This request is closed.'
              : 'We are collecting and checking quotes. We will email you when your options are ready, and they will appear here too.'}
          </p>
        ) : (
          <div className="space-y-3">
            {ticket.options.map((o) => {
              const chosen = ticket.selected_reply_id === o.reply_id;
              const closed = ticket.status === 'closed';
              return (
                <div
                  key={o.reply_id}
                  className={cn(
                    'rounded-xl border p-4',
                    chosen ? 'border-green-500 bg-green-500/5' : 'border-navy-border',
                    closed && !chosen && 'opacity-50',
                  )}
                >
                  {chosen && (
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-green-400">
                      <CheckCircle2 size={14} /> You selected this option
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-bold text-navy">OPTION {o.option_number}</span>
                      <p className="mt-2 text-xl font-bold text-gold">{formatPrice(o.admin_price)}</p>
                      <p className="text-xs text-slate-400">Delivery: {o.delivery_days} day{o.delivery_days === 1 ? '' : 's'} after payment</p>
                    </div>
                    {!closed && confirmingId !== o.reply_id && (
                      <Button size="sm" onClick={() => setConfirmingId(o.reply_id)}>Select</Button>
                    )}
                  </div>
                  {!closed && confirmingId === o.reply_id && (
                    <div className="mt-3 border-t border-navy-border pt-3">
                      <p className="mb-3 text-xs text-slate-300">
                        Confirm Option {o.option_number}? This places your order and closes the request — it can't be changed afterwards.
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setConfirmingId(null)} disabled={submitting}>Cancel</Button>
                        <Button size="sm" className="flex-1" loading={submitting} onClick={() => select(o.reply_id)}>
                          Confirm &amp; place order
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {ticket.selected_reply_id && (
              <p className="text-xs text-slate-400">
                Payment details have been sent to your email and phone. Your order is processed once payment is received.
              </p>
            )}
          </div>
        )}
      </div>

      {/* request details */}
      <div className="space-y-2 p-5 text-sm">
        <p className="flex items-center gap-2 text-slate-300"><Car size={14} className="text-slate-500" /> {ticket.car_year} {ticket.car_make} {ticket.car_model}{ticket.car_vin ? ` · VIN ${ticket.car_vin}` : ''}</p>
        <p className="flex items-center gap-2 text-slate-300"><Wrench size={14} className="text-slate-500" /> {ticket.part_category}</p>
        {ticket.part_description && <p className="text-slate-400">{ticket.part_description}</p>}
        <p className="flex items-center gap-2 text-slate-400"><User size={14} className="text-slate-500" /> SMS to {ticket.phone || '—'}</p>
        <p className="text-xs text-slate-500">Requested {formatDateTime(ticket.created_at)}</p>
      </div>
    </div>
  );
}

/* ───────────────────────── Account ───────────────────────── */

function AccountView() {
  const [profile, setProfile] = useState<{ email: string; phone: string | null; created_at: string } | null>(null);
  const [phone, setPhone] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [saving, setSaving] = useState<'phone' | 'password' | null>(null);

  useEffect(() => {
    api.get('/api/customer/profile')
      .then((res) => { setProfile(res.data); setPhone(res.data.phone || ''); })
      .catch(() => toast.error('Failed to load your account'));
  }, []);

  const savePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving('phone');
    try {
      await api.patch('/api/customer/profile', { phone });
      toast.success('Phone number updated');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update phone number'));
    } finally {
      setSaving(null);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 8) return toast.error('New password must be at least 8 characters');
    if (newPw !== confirmPw) return toast.error('New passwords do not match');
    setSaving('password');
    try {
      await api.patch('/api/customer/profile', { current_password: currentPw, new_password: newPw });
      toast.success('Password changed');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not change password'));
    } finally {
      setSaving(null);
    }
  };

  if (!profile) return <Spinner className="mt-16" />;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-white">My Account</h1>
      <p className="mb-8 mt-0.5 text-sm text-slate-400">Signed in as {profile.email}</p>

      <form onSubmit={savePhone} className="mb-6 rounded-2xl border border-navy-border bg-navy-card p-6">
        <h2 className="mb-4 font-semibold text-white">Contact</h2>
        <label className="field-label">Email</label>
        <input value={profile.email} disabled className="input-base mb-5 opacity-60" />
        <label className="field-label">Phone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" className="input-base mb-5" placeholder="+94 77 000 0000" />
        <Button type="submit" size="sm" loading={saving === 'phone'}>Save phone</Button>
      </form>

      <form onSubmit={savePassword} className="rounded-2xl border border-navy-border bg-navy-card p-6">
        <h2 className="mb-1 font-semibold text-white">Change password</h2>
        <p className="mb-4 text-xs text-slate-400">If this email also has a supplier account, use a different password here.</p>
        <label className="field-label">Current password</label>
        <input value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} type="password" className="input-base mb-5" />
        <label className="field-label">New password</label>
        <input value={newPw} onChange={(e) => setNewPw(e.target.value)} type="password" className="input-base mb-5" placeholder="At least 8 characters" />
        <label className="field-label">Confirm new password</label>
        <input value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} type="password" className="input-base mb-5" />
        <Button type="submit" size="sm" loading={saving === 'password'}>Change password</Button>
      </form>
    </div>
  );
}
