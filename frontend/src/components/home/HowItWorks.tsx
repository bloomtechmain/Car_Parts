import { motion } from 'framer-motion';
import { ClipboardList, Users, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: ClipboardList,
    step: '01',
    title: 'Submit Your Request',
    description: 'Tell us about your car and the part you need. It takes less than 2 minutes and is completely free.',
    color: 'from-blue-500/20 to-blue-600/10',
    iconColor: 'text-blue-400',
  },
  {
    icon: Users,
    step: '02',
    title: 'Suppliers Respond',
    description: 'Our network of verified suppliers reviews your request and submits competitive quotes with images and pricing.',
    color: 'from-gold/20 to-gold/10',
    iconColor: 'text-gold',
  },
  {
    icon: CheckCircle,
    step: '03',
    title: 'Choose Your Deal',
    description: 'We contact you with the best offers. Compare prices, ask questions, and choose the deal that suits you.',
    color: 'from-green-500/20 to-green-600/10',
    iconColor: 'text-green-400',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-gold font-semibold text-sm tracking-widest uppercase mb-3"
        >
          Simple Process
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold text-white"
        >
          How It Works
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        <div className="hidden md:block absolute top-12 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-transparent via-navy-border to-transparent" />

        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="relative bg-navy-card border border-navy-border rounded-2xl p-8 hover:border-gold/30 transition-all duration-300 group"
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6`}>
              <step.icon size={26} className={step.iconColor} />
            </div>
            <span className="absolute top-6 right-6 text-5xl font-black text-navy-border group-hover:text-gold/10 transition-colors font-mono">
              {step.step}
            </span>
            <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
            <p className="text-slate-400 leading-relaxed">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
