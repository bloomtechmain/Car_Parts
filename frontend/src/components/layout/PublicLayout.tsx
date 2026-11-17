import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';

const EASE = [0.76, 0, 0.24, 1] as const;

/*
 * Page change: a shutter drops over the old page, the route swaps
 * underneath, then the shutter lifts off the new one.
 */
export default function PublicLayout() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
        <motion.main key={location.pathname} className="flex-1">
          {outlet}

          {/* shutter coming down over the page that is leaving */}
          <motion.div
            className="pointer-events-none fixed inset-0 z-[70] origin-bottom border-t-2 border-signal bg-ink-2"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 0 }}
            exit={{ scaleY: 1 }}
            transition={{ duration: 0.5, ease: EASE }}
          />
          {/* shutter lifting off the page that arrived */}
          <motion.div
            className="pointer-events-none fixed inset-0 z-[70] origin-top border-b-2 border-signal bg-ink-2"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            exit={{ scaleY: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
          />
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
}
