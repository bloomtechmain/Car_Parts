import { useCallback, useEffect, useState } from 'react';
import { Check, X, RefreshCw, Mail, Phone, MapPin, Building2, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import api from '../../services/api';
import { formatDateTime } from '../../utils/formatters';
import { cn } from '../../utils/cn';

interface SupplierRequest {
  id: number;
  email: string;
  company_name: string | null;
  phone: string | null;
  address: string | null;
  business_details: string | null;
  approval_status: 'pending' | 'rejected';
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
}

interface Props {
  /** Pending count for the tab badge */
  onCountChange?: (n: number) => void;
  /** A supplier was approved — the Suppliers tab should reload */
  onApproved?: () => void;
}

function apiError(err: unknown, fallback: string): string {
  const msg = err && typeof err === 'object' && 'response' in err
    ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
    : undefined;
  return msg || fallback;
}

/** Admin: approve or reject supplier account applications. */
export default function SupplierRequests({ onCountChange, onApproved }: Props) {
  const [view, setView] = useState<'pending' | 'rejected'>('pending');
  const [requests, setRequests] = useState<SupplierRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [reason, setReason] = useState('');

  const fetchRequests = useCallback(
    () => api.get(`/api/admin/supplier-requests?status=${view}`)
      .then((res) => {
        setRequests(res.data.requests);
        onCountChange?.(res.data.pending_count);
      })
      .catch(() => toast.error('Failed to load supplier requests'))
      .finally(() => setLoading(false)),
    [view, onCountChange],
  );

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const refresh = () => { setLoading(true); fetchRequests(); };

  const approve = async (r: SupplierRequest) => {
    if (!confirm(`Approve "${r.company_name || r.email}"? They will be able to log in and receive part requests.`)) return;
    setBusyId(r.id);
    try {
      await api.post(`/api/admin/supplier-requests/${r.id}/approve`);
      toast.success(`${r.company_name || r.email} approved — they've been emailed`);
      onApproved?.();
      await fetchRequests();
    } catch (err) {
      toast.error(apiError(err, 'Failed to approve'));
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (r: SupplierRequest) => {
    setBusyId(r.id);
    try {
      await api.post(`/api/admin/supplier-requests/${r.id}/reject`, { reason: reason.trim() || undefined });
      toast.success('Application rejected — the supplier has been emailed');
      setRejectingId(null);
      setReason('');
      await fetchRequests();
    } catch (err) {
      toast.error(apiError(err, 'Failed to reject'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Supplier Account Requests</h2>
          <p className="mt-0.5 text-sm text-slate-400">Suppliers who applied on the website. Approved suppliers move to the Suppliers tab.</p>
        </div>
        <div className="flex gap-2">
          {(['pending', 'rejected'] as const).map((v) => (
            <button
              key={v}
              onClick={() => { if (v !== view) { setLoading(true); setView(v); } }}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium capitalize transition-all',
                view === v ? 'bg-gold text-navy' : 'border border-navy-border bg-navy-card text-slate-400 hover:text-white',
              )}
            >
              {v}
            </button>
          ))}
          <Button variant="secondary" size="sm" onClick={refresh}><RefreshCw size={14} /></Button>
        </div>
      </div>

      {loading ? (
        <Spinner className="mt-16" />
      ) : requests.length === 0 ? (
        <div className="py-16 text-center text-slate-500">
          <Inbox size={40} className="mx-auto mb-3 opacity-30" />
          <p>{view === 'pending' ? 'No applications waiting for approval.' : 'No rejected applications.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 10) * 0.04 }}
              className="rounded-xl border border-navy-border bg-navy-card p-5"
            >
              <div className="flex flex-col justify-between gap-4 lg:flex-row">
                <div className="min-w-0 flex-1 space-y-1.5 text-sm">
                  <p className="flex items-center gap-2 text-base font-semibold text-white">
                    <Building2 size={16} className="text-gold" /> {r.company_name || '—'}
                  </p>
                  <p className="flex items-center gap-2 text-slate-300"><Mail size={14} className="text-slate-500" /> {r.email}</p>
                  <p className="flex items-center gap-2 text-slate-300"><Phone size={14} className="text-slate-500" /> {r.phone || '—'}</p>
                  <p className="flex items-center gap-2 text-slate-300"><MapPin size={14} className="text-slate-500" /> {r.address || '—'}</p>
                  {r.business_details && (
                    <p className="whitespace-pre-line rounded-lg bg-navy-light/60 p-3 text-slate-400">{r.business_details}</p>
                  )}
                  <p className="text-xs text-slate-500">
                    Applied {formatDateTime(r.created_at)}
                    {r.reviewed_at ? ` · rejected ${formatDateTime(r.reviewed_at)}` : ''}
                  </p>
                  {r.rejection_reason && <p className="text-xs text-red-300">Reason: {r.rejection_reason}</p>}
                </div>

                <div className="flex flex-shrink-0 items-start gap-2">
                  <Button size="sm" loading={busyId === r.id && rejectingId !== r.id} onClick={() => approve(r)}>
                    <Check size={15} /> Approve
                  </Button>
                  {view === 'pending' && rejectingId !== r.id && (
                    <Button size="sm" variant="danger" onClick={() => { setRejectingId(r.id); setReason(''); }}>
                      <X size={15} /> Reject
                    </Button>
                  )}
                </div>
              </div>

              {rejectingId === r.id && (
                <div className="mt-4 border-t border-navy-border pt-4">
                  <label className="mb-1 block text-sm text-slate-300">Reason <span className="text-slate-500">(optional — included in the email to the supplier)</span></label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    className="input-base mb-3 resize-none"
                    placeholder="e.g. We could not verify your business registration."
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="danger" loading={busyId === r.id} onClick={() => reject(r)}>Confirm reject</Button>
                    <Button size="sm" variant="ghost" onClick={() => setRejectingId(null)}>Cancel</Button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
