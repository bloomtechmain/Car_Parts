import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, RefreshCw, TicketCheck, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import TicketTable from '../../components/dashboard/TicketTable';
import TicketDetailModal from '../../components/dashboard/TicketDetailModal';
import SupplierManagement from '../../components/dashboard/SupplierManagement';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import type { AdminTicket, SupplierAccount } from '../../types';
import { cn } from '../../utils/cn';

type Tab = 'tickets' | 'suppliers';

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialTab: Tab = location.pathname.includes('/suppliers') ? 'suppliers' : 'tickets';
  const [tab, setTab] = useState<Tab>(initialTab);

  const switchTab = (t: Tab) => {
    setTab(t);
    navigate(t === 'suppliers' ? '/dashboard/admin/suppliers' : '/dashboard/admin', { replace: true });
  };
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierAccount[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const loadTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await api.get('/api/admin/tickets');
      setTickets(res.data.tickets);
    } catch {
      toast.error('Failed to load tickets');
    } finally {
      setLoadingTickets(false);
    }
  };

  const loadSuppliers = async () => {
    setLoadingSuppliers(true);
    try {
      const res = await api.get('/api/admin/suppliers');
      setSuppliers(res.data.suppliers);
    } catch {
      toast.error('Failed to load suppliers');
    } finally {
      setLoadingSuppliers(false);
    }
  };

  useEffect(() => { loadTickets(); }, []);

  useEffect(() => {
    if (tab === 'suppliers' && suppliers.length === 0) loadSuppliers();
  }, [tab]);

  const filtered = tickets.filter((t) => {
    const matchSearch = search === '' ||
      t.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
      t.part_name.toLowerCase().includes(search.toLowerCase()) ||
      t.customer_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    open: tickets.filter((t) => t.status === 'open').length,
    replied: tickets.filter((t) => t.status === 'replied').length,
    closed: tickets.filter((t) => t.status === 'closed').length,
  };

  return (
    <DashboardLayout>
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-navy-card border border-navy-border rounded-xl p-1 w-fit mb-6">
        <button
          onClick={() => switchTab('tickets')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            tab === 'tickets' ? 'bg-gold text-navy' : 'text-slate-400 hover:text-white'
          )}
        >
          <TicketCheck size={15} /> Tickets
          <span className={cn('text-xs px-1.5 py-0.5 rounded-full', tab === 'tickets' ? 'bg-navy/20' : 'bg-navy-light')}>
            {tickets.length}
          </span>
        </button>
        <button
          onClick={() => switchTab('suppliers')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            tab === 'suppliers' ? 'bg-gold text-navy' : 'text-slate-400 hover:text-white'
          )}
        >
          <Users size={15} /> Suppliers
        </button>
      </div>

      {tab === 'tickets' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total', value: tickets.length, color: 'text-white' },
              { label: 'Open', value: counts.open, color: 'text-blue-400' },
              { label: 'Replied', value: counts.replied, color: 'text-gold' },
              { label: 'Closed', value: counts.closed, color: 'text-green-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-navy-card border border-navy-border rounded-xl p-4 text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ticket, part, or customer..."
                className="input-base pl-9"
              />
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {['all', 'open', 'replied', 'closed'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize',
                    statusFilter === s ? 'bg-gold text-navy' : 'bg-navy-card border border-navy-border text-slate-400 hover:text-white'
                  )}
                >
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
              <Button variant="secondary" size="sm" onClick={loadTickets}>
                <RefreshCw size={14} />
              </Button>
            </div>
          </div>

          {loadingTickets ? (
            <Spinner className="mt-16" />
          ) : (
            <TicketTable
              tickets={filtered}
              isAdmin
              onSelect={(t) => setSelectedId(t.id)}
              selectedId={selectedId || undefined}
            />
          )}
        </>
      )}

      {tab === 'suppliers' && (
        loadingSuppliers ? (
          <Spinner className="mt-16" />
        ) : (
          <SupplierManagement suppliers={suppliers} onRefresh={loadSuppliers} />
        )
      )}

      {selectedId !== null && (
        <TicketDetailModal
          ticketId={selectedId}
          isAdmin
          onClose={() => setSelectedId(null)}
          onStatusChange={() => loadTickets()}
        />
      )}
    </DashboardLayout>
  );
}
