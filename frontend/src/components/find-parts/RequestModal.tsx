import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import RequestWizard, { RequestBlockedNotice } from './RequestWizard';
import Docket from './Docket';
import { useRequestBlock } from './useRequestBlock';
import { useAuthStore } from '../../store/authStore';

/** Fired on window after a request is created from the popup (the customer portal refreshes its list) */
export const REQUEST_CREATED_EVENT = 'cpf:request-created';
/** Fire on window to open the request popup from anywhere inside a dashboard */
export const OPEN_REQUEST_EVENT = 'cpf:open-request';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

/** The 3-step part request in a popup (opened from the home page). */
export default function RequestModal({ open, onClose, onSubmitted }: Props) {
  const blocked = useRequestBlock();
  const logout = useAuthStore((s) => s.logout);
  const panelRef = useRef<HTMLDivElement>(null);

  // Esc closes; the page behind doesn't scroll while the popup is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = prev;
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="request-modal"
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Request a part"
            className="relative max-h-[92svh] w-full max-w-2xl overflow-y-auto lg:max-w-5xl border border-ink-line bg-ink px-5 pb-8 pt-14 sm:px-10 sm:pb-10"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center border border-ink-line text-steel transition-colors hover:border-signal hover:text-bone"
            >
              <X size={18} />
            </button>

            {blocked ? (
              <RequestBlockedNotice role={blocked} onLogout={logout} />
            ) : (
              <RequestWizard
                onClose={onClose}
                onSubmitted={() => {
                  panelRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  onSubmitted?.();
                }}
              >
                {({ form, docketData, step, ticketNumber }) => (
                  <div className="grid gap-10 lg:grid-cols-12">
                    <div className="lg:col-span-7">{form}</div>
                    {/* the live request docket — on wide screens, next to the steps */}
                    <aside className="hidden lg:col-span-5 lg:block">
                      <div className="sticky top-0 pt-2">
                        <motion.div
                          initial={{ opacity: 0, y: 24, rotate: 2 }}
                          animate={{ opacity: 1, y: 0, rotate: step === 4 ? -1.5 : 0.6 }}
                          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                        >
                          <Docket data={docketData} ticketNumber={ticketNumber} />
                        </motion.div>
                        <p className="mt-8 text-sm leading-relaxed text-steel">
                          This is what suppliers will see — minus anything personal. The more of it is filled in, the
                          quicker and closer the quotes.
                        </p>
                      </div>
                    </aside>
                  </div>
                )}
              </RequestWizard>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
