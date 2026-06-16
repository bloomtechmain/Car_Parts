import { motion } from 'framer-motion';
import { Target, Eye, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

const values = [
  {
    icon: Target,
    title: 'Our Mission',
    description: 'To eliminate the frustration of sourcing car parts by connecting customers directly with a trusted network of suppliers — making the process fast, transparent, and fair.',
  },
  {
    icon: Eye,
    title: 'Our Vision',
    description: 'To become the most trusted car parts marketplace in the region, where every driver can find any part they need, at the best price, with confidence.',
  },
  {
    icon: Heart,
    title: 'Our Values',
    description: 'Transparency, reliability, and customer-first thinking. We never take a commission from customers. Our revenue comes from suppliers who value our platform.',
  },
];

export default function AboutUsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gold font-semibold text-sm tracking-widest uppercase mb-4"
          >
            About Us
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-white mb-6"
          >
            Built for Car Owners,<br />Powered by Trust
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            CarParts Finder was born from a simple frustration: finding the right car part at the right price
            shouldn't be a full-time job. We built a platform that does the hard work for you.
          </motion.p>
        </div>

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
            <div className="space-y-4 text-slate-400 leading-relaxed">
              <p>
                We started CarParts Finder after seeing how difficult the car parts sourcing process was for everyday drivers in the UAE. Calling multiple suppliers, getting inconsistent quotes, not knowing if you're getting a fair price — it was exhausting.
              </p>
              <p>
                So we built a better way. Submit one request, and our network of verified suppliers competes to give you the best deal. You get options. Suppliers get qualified leads. Everyone wins.
              </p>
              <p>
                Today we work with over 500 suppliers across the UAE, covering everything from everyday wear parts to rare OEM components for classic and luxury vehicles.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-navy-card border border-navy-border rounded-3xl p-8"
          >
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: '2019', label: 'Founded' },
                { value: '500+', label: 'Suppliers' },
                { value: '50K+', label: 'Requests Handled' },
                { value: 'UAE', label: 'Based' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-3xl font-black text-gold">{value}</p>
                  <p className="text-slate-400 text-sm mt-1">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">What Drives Us</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-navy-card border border-navy-border rounded-2xl p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
                  <v.icon size={22} className="text-gold" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{v.title}</h3>
                <p className="text-slate-400 leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/find-parts">
            <Button size="lg">Start Your Search</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
