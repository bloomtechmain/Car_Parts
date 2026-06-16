import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wrench, LogOut, TicketCheck, Users, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { BRAND } from '../../constants/brand';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/dashboard/login');
  };

  const adminLinks = [
    { label: 'Tickets', href: '/dashboard/admin', icon: TicketCheck },
    { label: 'Suppliers', href: '/dashboard/admin/suppliers', icon: Users },
  ];

  const supplierLinks = [
    { label: 'Part Requests', href: '/dashboard/supplier', icon: LayoutDashboard },
    { label: 'My Replies', href: '/dashboard/supplier/replies', icon: TicketCheck },
  ];

  const links = user?.role === 'admin' ? adminLinks : supplierLinks;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-navy-light border-b border-navy-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center">
                  <Wrench size={15} className="text-navy" />
                </div>
                <span className="font-bold text-white hidden sm:block">{BRAND.name}</span>
              </Link>

              <div className="hidden sm:flex items-center gap-1">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      location.pathname === link.href
                        ? 'text-gold bg-gold/10'
                        : 'text-slate-400 hover:text-white hover:bg-navy-card'
                    )}
                  >
                    <link.icon size={15} />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-white text-sm font-medium">{user?.company_name || user?.email}</p>
                <p className="text-slate-500 text-xs capitalize">{user?.role}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-400">
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
