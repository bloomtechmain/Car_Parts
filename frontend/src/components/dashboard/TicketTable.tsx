import { motion } from 'framer-motion';
import { MessageSquare, Clock } from 'lucide-react';
import Badge from '../ui/Badge';
import { formatDate, statusColor, formatStatus } from '../../utils/formatters';
import type { Ticket, AdminTicket } from '../../types';
import { cn } from '../../utils/cn';

interface Props {
  tickets: (Ticket | AdminTicket)[];
  isAdmin?: boolean;
  onSelect: (ticket: Ticket | AdminTicket) => void;
  selectedId?: number;
}

export default function TicketTable({ tickets, isAdmin, onSelect, selectedId }: Props) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
        <p>No tickets found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tickets.map((ticket, i) => (
        <motion.div
          key={ticket.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          onClick={() => onSelect(ticket)}
          className={cn(
            'bg-navy-card border rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-200 hover:border-gold/30 hover:-translate-y-px',
            selectedId === ticket.id ? 'border-gold/50 bg-gold/5' : 'border-navy-border'
          )}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-gold font-mono font-bold text-sm">{ticket.ticket_number}</span>
                <Badge className={statusColor(ticket.status)}>{formatStatus(ticket.status)}</Badge>
                {ticket.reply_count !== undefined && ticket.reply_count > 0 && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <MessageSquare size={12} />
                    {ticket.reply_count} {ticket.reply_count === 1 ? 'reply' : 'replies'}
                  </span>
                )}
              </div>
              <p className="text-white font-semibold mt-1">
                {ticket.car_year} {ticket.car_make} {ticket.car_model}
                <span className="text-slate-400 font-normal"> — {ticket.part_name}</span>
              </p>
              {isAdmin && 'customer_name' in ticket && (
                <p className="text-slate-500 text-sm mt-0.5">{(ticket as AdminTicket).customer_name} · {(ticket as AdminTicket).customer_email}</p>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-slate-500 text-xs sm:text-right">
              <Clock size={12} />
              {formatDate(ticket.created_at)}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
