import { motion } from 'framer-motion';
import { ShieldCheck, Clock, DollarSign, Truck } from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    image: '/assets/composition-different-car-accessories.jpg',
    title: 'Verified Supplier Network',
    description: 'Every supplier is verified and vetted. You only get quotes from trusted businesses, not random sellers.',
    tag: 'Trust',
  },
  {
    icon: Clock,
    image: '/assets/engine-piston-cross-section.jpg',
    title: 'Fast Response Times',
    description: 'Suppliers are notified instantly. Most customers receive their first quote within a few hours.',
    tag: 'Speed',
  },
  {
    icon: DollarSign,
    image: '/assets/different-car-accessories-assortment.jpg',
    title: 'Competitive Pricing',
    description: 'Multiple suppliers compete for your business, driving prices down. Compare all options before deciding.',
    tag: 'Value',
  },
  {
    icon: Truck,
    image: '/assets/close-up-tyres.jpg',
    title: 'OEM & Aftermarket',
    description: 'Whether you need genuine OEM parts or quality aftermarket alternatives, our suppliers stock it all.',
    tag: 'Selection',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-navy-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-gold font-semibold text-sm tracking-widest uppercase mb-3"
          >
            Why Choose Us
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-white"
          >
            The Smarter Way to Source Parts
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="group bg-navy border border-navy-border rounded-2xl overflow-hidden hover:border-gold/40 hover:-translate-y-2 transition-all duration-400"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={f.image}
                  alt={f.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
                {/* Icon badge */}
                <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-gold flex items-center justify-center shadow-lg">
                  <f.icon size={18} className="text-navy" />
                </div>
                {/* Tag */}
                <div className="absolute top-3 right-3 bg-navy/70 backdrop-blur-sm border border-white/10 rounded-full px-2.5 py-0.5 text-xs text-slate-400">
                  {f.tag}
                </div>
              </div>

              {/* Text */}
              <div className="p-5">
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-gold transition-colors duration-300">
                  {f.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
