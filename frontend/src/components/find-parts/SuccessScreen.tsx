import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, Mail, Clock } from 'lucide-react';
import Button from '../ui/Button';

interface Props {
  ticketNumber: string;
}

export default function SuccessScreen({ ticketNumber }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="text-center py-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle size={36} className="text-green-400" />
      </motion.div>

      <h2 className="text-2xl font-bold text-white mb-2">Request Submitted!</h2>
      <p className="text-slate-400 mb-8">Your part request has been sent to our supplier network.</p>

      <div className="bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20 rounded-2xl p-6 mb-8">
        <p className="text-slate-400 text-sm mb-1">Your Ticket Number</p>
        <p className="text-3xl font-black text-gold tracking-widest">{ticketNumber}</p>
        <p className="text-slate-500 text-xs mt-2">Save this for your reference</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
        {[
          { icon: Mail, title: 'Confirmation Email', desc: "We've sent a confirmation to your email with your ticket details." },
          { icon: Clock, title: "What's Next", desc: 'Suppliers will review your request and submit quotes. We\'ll contact you soon.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-navy-card border border-navy-border rounded-xl p-4 flex gap-3">
            <Icon size={18} className="text-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white text-sm font-semibold">{title}</p>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <Link to="/">
        <Button variant="secondary" size="lg">Return to Home</Button>
      </Link>
    </motion.div>
  );
}
