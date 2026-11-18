import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { cn } from '../../utils/cn';
import { BRAND, NAV_LINKS } from '../../constants/brand';
import Logo from '../ui/Logo';
import Button from '../ui/Button';
import { LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const EASE = [0.76, 0, 0.24, 1] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const location = useLocation();
  // the menu belongs to the page it was opened on, so navigating closes it
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === location.pathname;
  const { scrollY } = useScroll();

  // Logged-in suppliers/admins get a way back to their dashboard instead of a login link
  const { token, user } = useAuthStore();
  const loggedIn = Boolean(token && user);
  const portalHref = loggedIn ? `/dashboard/${user!.role}` : '/dashboard/login';
  const portalLabel = loggedIn
    ? user!.role === 'admin' ? 'Admin dashboard' : user!.role === 'customer' ? 'My portal' : 'Supplier dashboard'
    : 'Log in';

  // Slide away when scrolling down, come back on the way up
  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > 240 && y > prev && !menuOpen);
  });

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? 'hidden' : '';
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  return (
    <>
      <motion.header
        animate={{ y: hidden ? '-100%' : '0%' }}
        transition={{ duration: 0.45, ease: EASE }}
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300',
          scrolled && !menuOpen ? 'border-b border-ink-line bg-ink/90 backdrop-blur-md' : 'border-b border-transparent',
        )}
      >
        <div className="shell flex h-[72px] items-center justify-between">
          <Logo />

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'group relative flex items-baseline gap-1.5 py-2 text-sm transition-colors',
                  isActive(link.href) ? 'text-bone' : 'text-steel hover:text-bone',
                )}
              >
                <span className="font-mono text-[10px] text-steel/60 transition-colors group-hover:text-signal">
                  0{i + 1}
                </span>
                {link.label}
                {isActive(link.href) && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute -bottom-0.5 left-0 right-0 h-px bg-signal"
                    transition={{ duration: 0.4, ease: EASE }}
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-6 lg:flex">
            {loggedIn ? (
              <Link
                to={portalHref}
                className="flex items-center gap-2 rounded-full border border-signal/60 px-3.5 py-1.5 text-sm text-bone transition-colors hover:bg-signal hover:text-ink"
                title={`Back to your ${portalLabel.toLowerCase()}`}
              >
                <LayoutDashboard size={15} />
                {portalLabel}
              </Link>
            ) : (
              <Link to={portalHref} className="link-draw text-sm text-steel transition-colors hover:text-bone">
                {portalLabel}
              </Link>
            )}
            <Link to="/find-parts" tabIndex={-1}>
              <Button size="sm" arrow>
                Request a part
              </Button>
            </Link>
          </div>

          <button
            className="flex items-center gap-3 py-2 text-bone lg:hidden"
            onClick={() => setMenuPath(menuOpen ? null : location.pathname)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className="label">{menuOpen ? 'Close' : 'Menu'}</span>
            <span className="relative block h-3 w-6">
              <motion.span
                className="absolute left-0 top-0 h-px w-6 bg-current"
                animate={menuOpen ? { y: 6, rotate: 45 } : { y: 0, rotate: 0 }}
              />
              <motion.span
                className="absolute bottom-0 left-0 h-px w-6 bg-current"
                animate={menuOpen ? { y: -5, rotate: -45 } : { y: 0, rotate: 0 }}
              />
            </span>
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: EASE }}
            className="fixed inset-0 z-40 flex flex-col bg-ink pt-[72px] lg:hidden"
          >
            <nav className="shell flex flex-1 flex-col justify-center gap-1" aria-label="Mobile">
              {NAV_LINKS.map((link, i) => (
                <div key={link.href} className="overflow-hidden">
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 0.6, delay: 0.15 + i * 0.06, ease: EASE }}
                  >
                    <Link
                      to={link.href}
                      className={cn(
                        'flex items-baseline gap-4 py-1 font-display text-5xl font-extrabold uppercase sm:text-6xl',
                        isActive(link.href) ? 'text-signal' : 'text-bone',
                      )}
                    >
                      <span className="font-mono text-xs font-normal text-steel">0{i + 1}</span>
                      {link.label}
                    </Link>
                  </motion.div>
                </div>
              ))}
            </nav>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="shell flex flex-col gap-4 border-t border-ink-line py-6"
            >
              <Link to="/find-parts">
                <Button className="w-full" size="lg" arrow>
                  Request a part
                </Button>
              </Link>
              <div className="flex justify-between text-sm text-steel">
                <Link to={portalHref} className={cn('flex items-center gap-2', loggedIn && 'text-signal')}>
                  {loggedIn && <LayoutDashboard size={15} />}
                  {portalLabel}
                </Link>
                <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
