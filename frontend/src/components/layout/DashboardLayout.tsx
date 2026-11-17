import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, TicketCheck, Users, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';
import Logo from '../ui/Logo';

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
    <div className="flex min-h-screen flex-col bg-ink">
      <header className="sticky top-0 z-40 border-b border-ink-line bg-ink/95 backdrop-blur-md">
        <div className="shell flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />
            <span className="label hidden border-l border-ink-line pl-6 text-steel md:block">
              {user?.role === 'admin' ? 'Admin desk' : 'Supplier portal'}
            </span>
            <nav className="flex items-center gap-1">
              {links.map((link) => {
                const active = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      'relative flex items-center gap-1.5 px-3 py-2 text-sm transition-colors',
                      active ? 'text-bone' : 'text-steel hover:text-bone',
                    )}
                  >
                    <link.icon size={15} className={active ? 'text-signal' : undefined} />
                    <span className="hidden sm:inline">{link.label}</span>
                    {active && (
                      <motion.span layoutId="dash-active" className="absolute inset-x-3 -bottom-[13px] h-0.5 bg-signal" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm text-bone">{user?.company_name || user?.email}</p>
              <p className="label text-[10px] text-steel">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 border border-ink-line px-3 py-2 text-sm text-steel transition-colors hover:border-signal hover:text-bone"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="shell flex-1 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {children}
        </motion.div>
      </main>
    </div>
  );
}
