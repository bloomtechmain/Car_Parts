import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Car, Wrench, User, DollarSign, FileText, Image as ImageIcon, Clock, Send, Check, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { TicketDetail } from '../../types';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { formatDateTime, formatPrice, statusColor, formatStatus } from '../../utils/formatters';

interface Props {
  ticketId: number;
  isAdmin?: boolean;
  inline?: boolean;
  onClose: () => void;
  onStatusChange?: (id: number, status: string) => void;
}

export default function TicketDetailModal({ ticketId, isAdmin, inline, onClose, onStatusChange }: Props) {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminPrices, setAdminPrices] = useState<Record<number, string>>({});
  const [savingPrice, setSavingPrice] = useState<Record<number, boolean>>({});
  const [savedPrice, setSavedPrice] = useState<Record<number, boolean>>({});
  const [sendingOptions, setSendingOptions] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const endpoint = isAdmin ? `/api/admin/tickets/${ticketId}` : `/api/supplier/tickets/${ticketId}`;
        const res = await api.get(endpoint);
        setTicket(res.data);
        if (isAdmin && res.data.replies) {
          const initial: Record<number, string> = {};
          res.data.replies.forEach((r: { id: number; admin_price: number | null }) => {
            if (r.admin_price !== null) initial[r.id] = String(r.admin_price);
          });
          setAdminPrices(initial);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [ticketId, isAdmin]);

  const handleStatusChange = async (status: string) => {
    await api.patch(`/api/admin/tickets/${ticketId}/status`, { status });
    setTicket((t) => t ? { ...t, status: status as TicketDetail['status'] } : t);
    onStatusChange?.(ticketId, status);
  };

  const handleSaveAdminPrice = async (replyId: number) => {
    const price = parseFloat(adminPrices[replyId] || '');
    if (!price || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    setSavingPrice((s) => ({ ...s, [replyId]: true }));
    try {
      await api.patch(`/api/admin/tickets/${ticketId}/replies/${replyId}`, { admin_price: price });
      setTicket((t) => {
        if (!t) return t;
        return {
          ...t,
          replies: t.replies.map((r) => r.id === replyId ? { ...r, admin_price: price } : r),
        };
      });
      setSavedPrice((s) => ({ ...s, [replyId]: true }));
      toast.success('Price saved');
      setTimeout(() => setSavedPrice((s) => ({ ...s, [replyId]: false })), 2000);
    } catch {
      toast.error('Failed to save price');
    } finally {
      setSavingPrice((s) => ({ ...s, [replyId]: false }));
    }
  };

  const handleSendOptions = async () => {
    setSendingOptions(true);
    try {
      const res = await api.post(`/api/admin/tickets/${ticketId}/send-options`);
      toast.success(`Options email sent to customer (${res.data.options_count} option${res.data.options_count !== 1 ? 's' : ''})`);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : 'Failed to send options';
      toast.error(msg || 'Failed to send options');
    } finally {
      setSendingOptions(false);
    }
  };

  const repliesWithAdminPrice = ticket?.replies?.filter((r) => r.admin_price !== null) ?? [];

  const content = (
    <div className={inline ? 'overflow-y-auto max-h-[70vh]' : 'bg-navy-light border border-navy-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'} onClick={inline ? undefined : (e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-5 border-b border-navy-border sticky top-0 bg-navy-light">
            <div className="flex items-center gap-2">
              {ticket && <span className="text-gold font-mono font-bold">{ticket.ticket_number}</span>}
              {ticket && <Badge className={statusColor(ticket.status)}>{formatStatus(ticket.status)}</Badge>}
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
              <X size={20} />
            </button>
          </div>

          {loading ? (
            <div className="p-8"><Spinner /></div>
          ) : ticket ? (
            <div className="p-5 space-y-5">
              {/* Car info */}
              <section>
                <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  <Car size={14} /> Vehicle
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Make', value: ticket.car_make },
                    { label: 'Model', value: ticket.car_model },
                    { label: 'Year', value: String(ticket.car_year) },
                    ticket.car_vin ? { label: 'VIN', value: ticket.car_vin } : null,
                  ].filter(Boolean).map((item) => (
                    <div key={item!.label} className="bg-navy-card border border-navy-border rounded-xl p-3">
                      <p className="text-slate-500 text-xs">{item!.label}</p>
                      <p className="text-white font-medium mt-0.5">{item!.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Part info */}
              <section>
                <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  <Wrench size={14} /> Part Request
                </h4>
                <div className="bg-navy-card border border-navy-border rounded-xl p-4">
                  <p className="text-white font-semibold">{ticket.part_name}</p>
                  <p className="text-slate-400 text-sm">{ticket.part_category}</p>
                  {ticket.part_description && (
                    <p className="text-slate-400 text-sm mt-2 leading-relaxed">{ticket.part_description}</p>
                  )}
                </div>
              </section>

              {/* Customer info (admin only) */}
              {isAdmin && ticket.customer && (
                <section>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    <User size={14} /> Customer Details
                  </h4>
                  <div className="bg-navy-card border border-gold/20 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Name', value: ticket.customer.full_name },
                      { label: 'Email', value: ticket.customer.email },
                      { label: 'Phone', value: ticket.customer.phone },
                      { label: 'Location', value: ticket.customer.location },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-slate-500 text-xs">{label}</p>
                        <p className="text-white font-medium mt-0.5 break-all">{value}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Status control (admin only) */}
              {isAdmin && (
                <section>
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Update Status</h4>
                  <div className="flex gap-2 flex-wrap">
                    {(['open', 'replied', 'closed'] as const).map((s) => (
                      <Button
                        key={s}
                        variant={ticket.status === s ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => handleStatusChange(s)}
                      >
                        {formatStatus(s)}
                      </Button>
                    ))}
                  </div>
                </section>
              )}

              {/* Supplier replies */}
              {ticket.replies && ticket.replies.length > 0 && (
                <section>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    <FileText size={14} /> Supplier Replies ({ticket.replies.length})
                  </h4>
                  <div className="space-y-3">
                    {ticket.replies.map((reply) => {
                      const isSelected = isAdmin && ticket.selected_reply_id != null && reply.id === ticket.selected_reply_id;
                      return (
                      <div key={reply.id} className={`rounded-xl p-4 ${isSelected ? 'bg-green-950/40 border-2 border-green-500' : 'bg-navy-card border border-navy-border'}`}>
                        {isSelected && (
                          <div className="flex items-center gap-2 mb-3 px-3 py-1.5 bg-green-500/20 border border-green-500/40 rounded-lg w-fit">
                            <CheckCircle2 size={14} className="text-green-400" />
                            <span className="text-green-400 text-xs font-semibold uppercase tracking-wide">Customer Selected This Option</span>
                          </div>
                        )}
                        {isAdmin && reply.company_name && (
                          <p className="text-gold text-sm font-semibold mb-2">{reply.company_name}</p>
                        )}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex flex-col gap-1">
                            {reply.price !== null && (
                              <div className="flex items-center gap-1.5">
                                <DollarSign size={15} className="text-gold" />
                                <span className="text-white font-bold text-lg">{formatPrice(reply.price)}</span>
                                <span className="text-slate-500 text-xs">(supplier price)</span>
                              </div>
                            )}
                            {reply.delivery_days !== null && (
                              <div className="flex items-center gap-1.5">
                                <Clock size={13} className="text-slate-400" />
                                <span className="text-slate-300 text-sm">{reply.delivery_days} day{reply.delivery_days !== 1 ? 's' : ''} delivery</span>
                              </div>
                            )}
                          </div>
                          <span className="text-slate-500 text-xs flex-shrink-0">{formatDateTime(reply.created_at)}</span>
                        </div>
                        {reply.notes && <p className="text-slate-400 text-sm leading-relaxed mb-3">{reply.notes}</p>}
                        {reply.image_url && (
                          <a href={reply.image_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-gold text-sm hover:underline mb-3">
                            <ImageIcon size={14} /> View Image
                          </a>
                        )}

                        {/* Admin price input */}
                        {isAdmin && (
                          <div className="mt-3 pt-3 border-t border-navy-border">
                            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Admin Price (sent to customer)</p>
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Rs.</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="Set your price"
                                  value={adminPrices[reply.id] ?? ''}
                                  onChange={(e) => setAdminPrices((p) => ({ ...p, [reply.id]: e.target.value }))}
                                  className="input-base pl-10 text-sm"
                                />
                              </div>
                              <Button
                                size="sm"
                                variant={savedPrice[reply.id] ? 'secondary' : 'primary'}
                                loading={savingPrice[reply.id]}
                                onClick={() => handleSaveAdminPrice(reply.id)}
                              >
                                {savedPrice[reply.id] ? <Check size={14} /> : 'Save'}
                              </Button>
                            </div>
                            {reply.admin_price !== null && (
                              <p className="text-green-400 text-xs mt-1.5">
                                Current: {formatPrice(reply.admin_price)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      );
                    })}
                  </div>

                  {/* Send Options to Customer button */}
                  {isAdmin && ticket.status !== 'closed' && (
                    <div className="mt-4 p-4 bg-navy-card border border-gold/30 rounded-xl">
                      <p className="text-sm text-slate-300 mb-1 font-medium">Send Options to Customer</p>
                      <p className="text-xs text-slate-500 mb-3">
                        {repliesWithAdminPrice.length === 0
                          ? 'Set an admin price on at least one reply before sending.'
                          : `${repliesWithAdminPrice.length} option${repliesWithAdminPrice.length !== 1 ? 's' : ''} with admin price ready. Customer will not see supplier names.`}
                      </p>
                      <Button
                        onClick={handleSendOptions}
                        loading={sendingOptions}
                        disabled={repliesWithAdminPrice.length === 0}
                      >
                        <Send size={14} className="mr-2" />
                        Send Options Email to Customer
                      </Button>
                    </div>
                  )}
                </section>
              )}

              <p className="text-slate-500 text-xs">Submitted {formatDateTime(ticket.created_at)}</p>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">Ticket not found</div>
          )}
        </div>
  );

  if (inline) return content;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
