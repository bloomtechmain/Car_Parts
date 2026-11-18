import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

interface Props {
  ticketNumber: string;
  /** In the popup: show "Close" instead of "Back to home" */
  onClose?: () => void;
}

const NEXT = [
  ['Now', 'A confirmation with your ticket number is on its way to your inbox.'],
  ['Next few hours', 'Suppliers see the request and send in prices.'],
  ['When quotes are in', 'We check them and send you the best options by email — they also appear in My requests.'],
];

export default function SuccessScreen({ ticketNumber, onClose }: Props) {
  return (
    <div className="py-4">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="label mb-6 flex items-center gap-2 text-signal"
      >
        <span className="h-1.5 w-1.5 bg-signal" /> Request received
      </motion.p>

      <h2 className="display mb-8 text-[clamp(2.6rem,6vw,4.6rem)] text-bone">
        It’s out with
        <br />
        the suppliers.
      </h2>

      {/* the ticket number, stamped in */}
      <motion.div
        initial={{ scale: 1.6, rotate: -8, opacity: 0 }}
        animate={{ scale: 1, rotate: -2, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.2 }}
        className="mb-10 inline-block border-2 border-signal px-6 py-4"
      >
        <p className="label text-[10px] text-signal">Ticket</p>
        <p className="font-mono text-3xl font-medium tracking-[0.12em] text-signal sm:text-4xl">{ticketNumber}</p>
      </motion.div>

      <ol className="mb-10 border-t border-ink-line">
        {NEXT.map(([when, what], i) => (
          <motion.li
            key={when}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.12 }}
            className="grid grid-cols-[8.5rem_1fr] gap-4 border-b border-ink-line py-4 text-sm"
          >
            <span className="label pt-0.5 text-[10px] text-steel">{when}</span>
            <span className="text-bone/90">{what}</span>
          </motion.li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-3">
        <Link to="/dashboard/customer" tabIndex={-1} onClick={() => onClose?.()}>
          <Button size="lg" arrow>Track it in My requests</Button>
        </Link>
        {onClose ? (
          <Button variant="secondary" size="lg" onClick={onClose}>Close</Button>
        ) : (
          <Link to="/" tabIndex={-1}>
            <Button variant="secondary" size="lg">Back to home</Button>
          </Link>
        )}
        <Link to="/faq" tabIndex={-1}>
          <Button variant="ghost" size="lg">What happens next?</Button>
        </Link>
      </div>
    </div>
  );
}
