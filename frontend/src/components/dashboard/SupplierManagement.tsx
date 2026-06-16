import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import api from '../../services/api';
import type { SupplierAccount } from '../../types';
import { formatDate } from '../../utils/formatters';

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Minimum 8 characters'),
  company_name: z.string().min(1),
  phone: z.string().optional(),
});

type CreateData = z.infer<typeof createSchema>;

interface Props {
  suppliers: SupplierAccount[];
  onRefresh: () => void;
}

export default function SupplierManagement({ suppliers, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateData>({
    resolver: zodResolver(createSchema),
  });

  const onCreateSupplier = async (data: CreateData) => {
    setLoading(true);
    try {
      await api.post('/api/admin/suppliers', data);
      toast.success('Supplier account created');
      reset();
      setShowForm(false);
      onRefresh();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : 'Failed to create supplier';
      toast.error(msg || 'Failed to create supplier');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (supplier: SupplierAccount) => {
    try {
      await api.patch(`/api/admin/suppliers/${supplier.id}`, { is_active: !supplier.is_active });
      toast.success(`Supplier ${supplier.is_active ? 'deactivated' : 'activated'}`);
      onRefresh();
    } catch {
      toast.error('Failed to update supplier');
    }
  };

  const deleteSupplier = async (id: number, name: string) => {
    if (!confirm(`Delete supplier "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/admin/suppliers/${id}`);
      toast.success('Supplier deleted');
      onRefresh();
    } catch {
      toast.error('Failed to delete supplier');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Supplier Accounts ({suppliers.length})</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} />
          Add Supplier
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-navy-card border border-gold/20 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">Create New Supplier Account</h3>
              <form onSubmit={handleSubmit(onCreateSupplier)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Company Name *</label>
                  <input {...register('company_name')} placeholder="AutoParts LLC" className="input-base" />
                  {errors.company_name && <p className="text-red-400 text-xs mt-1">{errors.company_name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Email *</label>
                  <input {...register('email')} type="email" placeholder="supplier@example.com" className="input-base" />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Password *</label>
                  <input {...register('password')} type="password" placeholder="Min. 8 characters" className="input-base" />
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Phone</label>
                  <input {...register('phone')} type="tel" placeholder="+971 50 000 0000" className="input-base" />
                </div>
                <div className="sm:col-span-2 flex gap-3">
                  <Button type="submit" loading={loading}>Create Account</Button>
                  <Button type="button" variant="ghost" onClick={() => { setShowForm(false); reset(); }}>Cancel</Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {suppliers.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No suppliers yet. Create the first one above.</div>
        ) : (
          suppliers.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-navy-card border border-navy-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-semibold">{s.company_name || '—'}</span>
                  <Badge className={s.is_active ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}>
                    {s.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-slate-400 text-sm mt-0.5">{s.email}{s.phone ? ` · ${s.phone}` : ''}</p>
                <p className="text-slate-500 text-xs mt-0.5">Member since {formatDate(s.created_at)}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => toggleActive(s)} title={s.is_active ? 'Deactivate' : 'Activate'}>
                  {s.is_active ? <ToggleRight size={18} className="text-green-400" /> : <ToggleLeft size={18} className="text-slate-500" />}
                </Button>
                <Button variant="danger" size="sm" onClick={() => deleteSupplier(s.id, s.company_name || s.email)}>
                  <Trash2 size={15} />
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
