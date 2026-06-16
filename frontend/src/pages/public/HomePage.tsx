import HeroSection from '../../components/home/HeroSection';
import HowItWorks from '../../components/home/HowItWorks';
import FeaturesSection from '../../components/home/FeaturesSection';
import StatsSection from '../../components/home/StatsSection';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <StatsSection />
      <FeaturesSection />

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-gold/10 via-navy-card to-gold/5 border border-gold/20 rounded-3xl p-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Find Your Part?
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              It takes less than 2 minutes and it's completely free. Let our supplier network do the work for you.
            </p>
            <Link to="/find-parts">
              <Button size="lg" className="group">
                Get Started Now
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
