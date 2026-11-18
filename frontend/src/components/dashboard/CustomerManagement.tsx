import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, ToggleLeft, ToggleRight, Search, Pencil, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';
import api from '../../services/api';
import type { CustomerAccount } from '../../types';
import { formatDate, formatDateTime, statusColor, formatStatus } from '../../utils/formatters';

const createSchema = z.object({
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Valid phone required'),
  password: z.string().min(8, 'Minimum 8 characters'),
});
type CreateData = z.infer<typeof createSchema>;

interface CustomerTicketRow {
  id: number;
  ticket_number: string;
  car_make: string;
  car_model: string;
  car_year: number;
  part_name: string;
  status: string;
  created_at: string;
  selected_reply_id: number | null;
  reply_count: number;
}

interface Props {
  customers: CustomerAccount[];
  onRefresh: () => void;
  /** Opens the normal admin ticket window */
  onOpenTicket: (ticketId: number) => void;
}

function apiError(err: unknown, fallback: string): string {
  const msg = err && typeof err === 'object' && 'response' in err
    ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
    : undefined;
  return msg || fallback;
}

export default function CustomerManagement({ customers, onRefresh, onOpenTicket }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateData>({
    resolver: zodResolver(createSchema),
  });

  const onCreate = async (data: CreateData) => {
    setLoading(true);
    try {
      await api.post('/api/admin/customers', data);
      toast.success('Customer account created');
      reset();
      setShowForm(false);
      onRefresh();
    } catch (err) {
      toast.error(apiError(err, 'Failed to create customer'));
    } finally {
      setLoading(false);
    }
  };

  const q = search.trim().toLowerCase();
  const filtered = customers.filter((c) =>
    (q === '' || c.email.toLowerCase().includes(q) || (c.phone || '').replace(/\s/g, '').includes(q.replace(/\s/g, ''))) &&
    (statusFilter === 'all' || (statusFilter === 'active' ? c.is_active : !c.is_active)),
  );

  const totals = {
    customers: customers.length,
    active: customers.filter((c) => c.is_active).length,
    requests: customers.reduce((n, c) => n + c.ticket_count, 0),
    orders: customers.reduce((n, c) => n + c.order_count, 0),
  };

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-xl font-bold text-white">Customer Accounts ({customers.length})</h2>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onRefresh}><RefreshCw size={14} /></Button>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> Add Customer
          </Button>
        </div>
      </div>

      {/* stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Customers', value: totals.customers, color: 'text-white' },
          { label: 'Active', value: totals.active, color: 'text-green-400' },
          { label: 'Requests', value: totals.requests, color: 'text-blue-400' },
          { label: 'Orders placed', value: totals.orders, color: 'text-gold' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-navy-border bg-navy-card p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="rounded-2xl border border-gold/20 bg-navy-card p-6">
              <h3 className="mb-1 font-semibold text-white">Create New Customer Account</h3>
              <p className="mb-4 text-xs text-slate-400">
                Share the login details with the customer. If this email also has a supplier account, the password must be different.
              </p>
              <form onSubmit={handleSubmit(onCreate)} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm text-slate-300">Email *</label>
                  <input {...register('email')} type="email" placeholder="customer@example.com" className="input-base" />
                  {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-300">Phone *</label>
                  <input {...register('phone')} type="tel" placeholder="+94 77 000 0000" className="input-base" />
                  {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-300">Password *</label>
                  <input {...register('password')} type="password" placeholder="Min. 8 characters" className="input-base" />
                  {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
                </div>
                <div className="flex gap-3 sm:col-span-3">
                  <Button type="submit" loading={loading}>Create Account</Button>
                  <Button type="button" variant="ghost" onClick={() => { setShowForm(false); reset(); }}>Cancel</Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by email or phone..." className="input-base pl-9" />
        </div>
        <div className="flex flex-shrink-0 gap-2">
          {(['all', 'active', 'inactive'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={
                'rounded-lg px-3 py-2 text-sm font-medium capitalize transition-all ' +
                (statusFilter === s ? 'bg-gold text-navy' : 'border border-navy-border bg-navy-card text-slate-400 hover:text-white')
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            {customers.length === 0 ? 'No customers yet. They appear here when they register.' : 'No customers match your search.'}
          </div>
        ) : (
          filtered.map((c, i) => (
            <CustomerRow key={c.id} customer={c} index={i} onRefresh={onRefresh} onOpenTicket={onOpenTicket} />
          ))
        )}
      </div>
    </div>
  );
}

function CustomerRow({
  customer: c,
  index,
  onRefresh,
  onOpenTicket,
}: {
  customer: CustomerAccount;
  index: number;
  onRefresh: () => void;
  onOpenTicket: (id: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(c.phone || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [tickets, setTickets] = useState<CustomerTicketRow[] | null>(null);

  const toggleActive = async () => {
    try {
      await api.patch(`/api/admin/customers/${c.id}`, { is_active: !c.is_active });
      toast.success(`Customer ${c.is_active ? 'deactivated' : 'activated'}`);
      onRefresh();
    } catch (err) {
      toast.error(apiError(err, 'Failed to update customer'));
    }
  };

  const save = async () => {
    const body: Record<string, string> = {};
    if (phone.trim() !== (c.phone || '')) body.phone = phone.trim();
    if (password) body.password = password;
    if (Object.keys(body).length === 0) { setEditing(false); return; }
    setSaving(true);
    try {
      await api.patch(`/api/admin/customers/${c.id}`, body);
      toast.success(password ? 'Customer updated — share the new password with them' : 'Customer updated');
      setPassword('');
      setEditing(false);
      onRefresh();
    } catch (err) {
      toast.error(apiError(err, 'Failed to update customer'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Delete customer account "${c.email}"?\n\nTheir login is removed. Their ${c.ticket_count} request(s) stay in Tickets.`)) return;
    try {
      await api.delete(`/api/admin/customers/${c.id}`);
      toast.success('Customer deleted');
      onRefresh();
    } catch (err) {
      toast.error(apiError(err, 'Failed to delete customer'));
    }
  };

  const toggleRequests = async () => {
    const next = !open;
    setOpen(next);
    if (next && tickets === null) {
      try {
        const res = await api.get(`/api/admin/customers/${c.id}/tickets`);
        setTickets(res.data.tickets);
      } catch {
        toast.error('Failed to load requests');
        setTickets([]);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 10) * 0.04 }}
      className="rounded-xl border border-navy-border bg-navy-card"
    >
      <div className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-semibold text-white">{c.email}</span>
            <Badge className={c.is_active ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}>
              {c.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-slate-400">{c.phone || 'No phone'} · Member since {formatDate(c.created_at)}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {c.ticket_count} request{c.ticket_count === 1 ? '' : 's'} · {c.active_count} in progress · {c.order_count} order{c.order_count === 1 ? '' : 's'}
            {c.last_request_at ? ` · last request ${formatDate(c.last_request_at)}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={toggleRequests}>
            Requests {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)} title="Edit">
            <Pencil size={15} />
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleActive} title={c.is_active ? 'Deactivate' : 'Activate'}>
            {c.is_active ? <ToggleRight size={18} className="text-green-400" /> : <ToggleLeft size={18} className="text-slate-500" />}
          </Button>
          <Button variant="danger" size="sm" onClick={remove} title="Delete">
            <Trash2 size={15} />
          </Button>
        </div>
      </div>

      {editing && (
        <div className="grid grid-cols-1 gap-4 border-t border-navy-border p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Phone (used for SMS)</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" className="input-base" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">New password <span className="text-slate-500">(optional)</span></label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Leave blank to keep" className="input-base" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" loading={saving} onClick={save}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setPhone(c.phone || ''); setPassword(''); }}>Cancel</Button>
          </div>
        </div>
      )}

      {open && (
        <div className="border-t border-navy-border p-4">
          {tickets === null ? (
            <Spinner className="my-4" />
          ) : tickets.length === 0 ? (
            <p className="text-sm text-slate-500">No requests yet.</p>
          ) : (
            <div className="space-y-2">
              {tickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onOpenTicket(t.id)}
                  className="flex w-full flex-col gap-1 rounded-lg border border-navy-border px-3 py-2 text-left transition-colors hover:border-gold sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm">
                    <span className="mr-2 font-mono font-bold text-gold">{t.ticket_number}</span>
                    <span className="text-white">{t.car_year} {t.car_make} {t.car_model}</span>
                    <span className="text-slate-400"> — {t.part_name}</span>
                  </span>
                  <span className="flex items-center gap-2 text-xs text-slate-400">
                    {t.reply_count} quote{t.reply_count === 1 ? '' : 's'}
                    <Badge className={statusColor(t.status)}>{formatStatus(t.status)}</Badge>
                    {formatDateTime(t.created_at)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
