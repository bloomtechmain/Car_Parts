import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, RefreshCw, DollarSign, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import TicketTable from '../../components/dashboard/TicketTable';
import TicketDetailModal from '../../components/dashboard/TicketDetailModal';
import ReplyForm from '../../components/dashboard/ReplyForm';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';
import type { Ticket, SupplierReply } from '../../types';
import { formatPrice, formatDateTime, statusColor, formatStatus } from '../../utils/formatters';
import { motion } from 'framer-motion';

export default function SupplierDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const isRepliesView = location.pathname.includes('/replies');

  // Part Requests state
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showReplyForm, setShowReplyForm] = useState(false);

  // My Replies state
  const [replies, setReplies] = useState<(SupplierReply & { ticket_number: string; car_make: string; car_model: string; part_name: string; ticket_status: string })[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const loadTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await api.get('/api/supplier/tickets');
      setTickets(res.data.tickets);
    } catch {
      toast.error('Failed to load tickets');
    } finally {
      setLoadingTickets(false);
    }
  };

  const loadReplies = async () => {
    setLoadingReplies(true);
    try {
      const res = await api.get('/api/supplier/replies');
      setReplies(res.data.replies);
    } catch {
      toast.error('Failed to load replies');
    } finally {
      setLoadingReplies(false);
    }
  };

  useEffect(() => {
    if (isRepliesView) {
      loadReplies();
    } else {
      loadTickets();
    }
  }, [isRepliesView]);

  const filtered = tickets.filter((t) =>
    search === '' ||
    t.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
    t.part_name.toLowerCase().includes(search.toLowerCase()) ||
    t.car_make.toLowerCase().includes(search.toLowerCase()) ||
    t.car_model.toLowerCase().includes(search.toLowerCase())
  );

  const selectedTicket = tickets.find((t) => t.id === selectedId);

  return (
    <DashboardLayout>
      {isRepliesView ? (
        /* ── My Replies view ── */
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">My Replies</h1>
              <p className="text-slate-400 text-sm mt-0.5">Quotes you've submitted to customers</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard/supplier')}>
                ← Part Requests
              </Button>
              <Button variant="secondary" size="sm" onClick={loadReplies}>
                <RefreshCw size={15} />
                Refresh
              </Button>
            </div>
          </div>

          {loadingReplies ? (
            <Spinner className="mt-16" />
          ) : replies.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <DollarSign size={40} className="mx-auto mb-3 opacity-30" />
              <p>You haven't submitted any quotes yet.</p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate('/dashboard/supplier')}>
                Browse Part Requests
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {replies.map((reply, i) => (
                <motion.div
                  key={reply.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-navy-card border border-navy-border rounded-xl p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap mb-1">
                        <span className="text-gold font-mono font-bold text-sm">{reply.ticket_number}</span>
                        <Badge className={statusColor(reply.ticket_status)}>{formatStatus(reply.ticket_status)}</Badge>
                      </div>
                      <p className="text-white font-semibold">
                        {reply.car_make} {reply.car_model}
                        <span className="text-slate-400 font-normal"> — {reply.part_name}</span>
                      </p>
                      {reply.notes && (
                        <p className="text-slate-400 text-sm mt-1 line-clamp-2">{reply.notes}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {reply.price !== null && (
                        <span className="text-gold font-bold text-lg">{formatPrice(reply.price)}</span>
                      )}
                      {reply.image_url && (
                        <a
                          href={reply.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-gold text-xs transition-colors"
                        >
                          <ImageIcon size={13} /> View Image
                        </a>
                      )}
                      <span className="text-slate-500 text-xs">{formatDateTime(reply.created_at)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── Part Requests view ── */
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Part Requests</h1>
                <p className="text-slate-400 text-sm mt-0.5">Open tickets from customers</p>
              </div>
              <Button variant="secondary" size="sm" onClick={loadTickets}>
                <RefreshCw size={15} />
                Refresh
              </Button>
            </div>

            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tickets..."
                className="input-base pl-9"
              />
            </div>

            {loadingTickets ? (
              <Spinner className="mt-16" />
            ) : (
              <TicketTable
                tickets={filtered}
                onSelect={(t) => { setSelectedId(t.id); setShowReplyForm(false); }}
                selectedId={selectedId || undefined}
              />
            )}
          </div>

          {selectedId && selectedTicket && (
            <div className="lg:w-96 xl:w-[440px] flex-shrink-0">
              <div className="sticky top-24 bg-navy-card border border-navy-border rounded-2xl overflow-hidden">
                <TicketDetailModal
                  ticketId={selectedId}
                  isAdmin={false}
                  inline
                  onClose={() => { setSelectedId(null); setShowReplyForm(false); }}
                />
                {!selectedTicket.i_replied && (
                  <div className="p-5 border-t border-navy-border">
                    {showReplyForm ? (
                      <ReplyForm
                        ticketId={selectedId}
                        ticketNumber={selectedTicket.ticket_number}
                        onSuccess={() => { setShowReplyForm(false); loadTickets(); }}
                        onCancel={() => setShowReplyForm(false)}
                      />
                    ) : (
                      <Button className="w-full" onClick={() => setShowReplyForm(true)}>
                        Submit Quote
                      </Button>
                    )}
                  </div>
                )}
                {selectedTicket.i_replied && (
                  <div className="p-4 border-t border-navy-border bg-green-500/5">
                    <p className="text-green-400 text-sm text-center font-medium">You have already replied to this ticket</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
