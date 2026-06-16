import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Wrench } from 'lucide-react';
import { cn } from '../../utils/cn';
import { BRAND, NAV_LINKS } from '../../constants/brand';
import Button from '../ui/Button';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-navy/90 backdrop-blur-xl border-b border-navy-border shadow-xl'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gold flex items-center justify-center">
                <Wrench size={18} className="text-navy" />
              </div>
              <span className="font-bold text-lg text-white group-hover:text-gold transition-colors">
                {BRAND.name}
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    location.pathname === link.href
                      ? 'text-gold bg-gold/10'
                      : 'text-slate-400 hover:text-white hover:bg-navy-card'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <Link to="/dashboard/login">
                <Button variant="secondary" size="sm">Supplier Login</Button>
              </Link>
              <Link to="/find-parts">
                <Button size="sm">Find My Part</Button>
              </Link>
            </div>

            <button
              className="lg:hidden text-slate-400 hover:text-white p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-navy/95 backdrop-blur-xl border-b border-navy-border lg:hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'block px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    location.pathname === link.href
                      ? 'text-gold bg-gold/10'
                      : 'text-slate-400 hover:text-white hover:bg-navy-card'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                <Link to="/dashboard/login" className="block">
                  <Button variant="secondary" className="w-full">Supplier Login</Button>
                </Link>
                <Link to="/find-parts" className="block">
                  <Button className="w-full">Find My Part</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
