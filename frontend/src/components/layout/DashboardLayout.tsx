import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, TicketCheck, Users, LayoutDashboard, PlusCircle, UserCog, UserCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';
import Logo from '../ui/Logo';
import RequestModal, { REQUEST_CREATED_EVENT, OPEN_REQUEST_EVENT } from '../find-parts/RequestModal';
import { useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [requestOpen, setRequestOpen] = useState(false);

  useEffect(() => {
    const open = () => setRequestOpen(true);
    window.addEventListener(OPEN_REQUEST_EVENT, open);
    return () => window.removeEventListener(OPEN_REQUEST_EVENT, open);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/dashboard/login');
  };

  const adminLinks = [
    { label: 'Tickets', href: '/dashboard/admin', icon: TicketCheck },
    { label: 'Suppliers', href: '/dashboard/admin/suppliers', icon: Users },
    { label: 'Supplier Requests', href: '/dashboard/admin/supplier-requests', icon: UserCheck },
    { label: 'Customers', href: '/dashboard/admin/customers', icon: UserCog },
  ];

  const supplierLinks = [
    { label: 'Part Requests', href: '/dashboard/supplier', icon: LayoutDashboard },
    { label: 'My Replies', href: '/dashboard/supplier/replies', icon: TicketCheck },
  ];

  const customerLinks = [
    { label: 'My Requests', href: '/dashboard/customer', icon: TicketCheck },
    { label: 'New Request', href: '/find-parts', icon: PlusCircle },
    { label: 'Account', href: '/dashboard/customer/account', icon: UserCog },
  ];

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'customer' ? customerLinks : supplierLinks;
  const portalName = user?.role === 'admin' ? 'Admin desk' : user?.role === 'customer' ? 'Customer portal' : 'Supplier portal';

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <header className="sticky top-0 z-40 border-b border-ink-line bg-ink/95 backdrop-blur-md">
        <div className="shell flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />
            <span className="label hidden border-l border-ink-line pl-6 text-steel md:block">
              {portalName}
            </span>
            <nav className="flex items-center gap-1">
              {links.map((link) => {
                const active = location.pathname === link.href;
                // "New Request" opens the 3-step request popup instead of leaving the portal
                if (link.href === '/find-parts') {
                  return (
                    <button
                      key={link.href}
                      type="button"
                      onClick={() => setRequestOpen(true)}
                      className="relative flex items-center gap-1.5 px-3 py-2 text-sm text-steel transition-colors hover:text-bone"
                    >
                      <link.icon size={15} />
                      <span className="hidden sm:inline">{link.label}</span>
                    </button>
                  );
                }
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

      <RequestModal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        onSubmitted={() => window.dispatchEvent(new Event(REQUEST_CREATED_EVENT))}
      />

      <main className="shell flex-1 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {children}
        </motion.div>
      </main>
    </div>
  );
}
