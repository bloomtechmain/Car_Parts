import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Car, Wrench, User, DollarSign, FileText, Image as ImageIcon } from 'lucide-react';
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

  useEffect(() => {
    const load = async () => {
      try {
        const endpoint = isAdmin ? `/api/admin/tickets/${ticketId}` : `/api/supplier/tickets/${ticketId}`;
        const res = await api.get(endpoint);
        setTicket(res.data);
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
                    {ticket.replies.map((reply) => (
                      <div key={reply.id} className="bg-navy-card border border-navy-border rounded-xl p-4">
                        {isAdmin && reply.company_name && (
                          <p className="text-gold text-sm font-semibold mb-2">{reply.company_name}</p>
                        )}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          {reply.price !== null && (
                            <div className="flex items-center gap-1.5">
                              <DollarSign size={15} className="text-gold" />
                              <span className="text-white font-bold text-lg">{formatPrice(reply.price)}</span>
                            </div>
                          )}
                          <span className="text-slate-500 text-xs">{formatDateTime(reply.created_at)}</span>
                        </div>
                        {reply.notes && <p className="text-slate-400 text-sm leading-relaxed mb-3">{reply.notes}</p>}
                        {reply.image_url && (
                          <a href={reply.image_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-gold text-sm hover:underline">
                            <ImageIcon size={14} /> View Image
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
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
