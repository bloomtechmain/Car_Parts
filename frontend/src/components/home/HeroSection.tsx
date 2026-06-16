import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Shield, Star } from 'lucide-react';
import Button from '../ui/Button';
import HeroAnimationPanel from './animations/HeroAnimationPanel';

const words = ['Find', 'Any', 'Car', 'Part,', 'Fast.'];

// Background slideshow images
const bgSlides = [
  '/assets/dark-blue-suv-wet-road-power-safety-modern-design.jpg',
  '/assets/engine-piston-cross-section.jpg',
  '/assets/various-work-tools-worktop.jpg',
  '/assets/composition-different-car-accessories.jpg',
];


export default function HeroSection() {
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setBgIndex((i) => (i + 1) % bgSlides.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">

      {/* ── Background image slideshow ── */}
      <AnimatePresence>
        <motion.div
          key={bgIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
          className="absolute inset-0 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: `url(${bgSlides[bgIndex]})` }}
        />
      </AnimatePresence>

      {/* Deep gradient overlays — keeps text readable + maintains brand colors */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/92 to-navy/60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/80 pointer-events-none" />

      {/* Gold grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(245,158,11,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.6) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Main content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">

          {/* Left — text */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm"
            >
              <Zap size={14} className="text-gold" />
              <span className="text-gold text-sm font-medium">Instant quotes from verified suppliers</span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none mb-6 tracking-tight">
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 50, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.7, delay: 0.15 + i * 0.12, ease: 'easeOut' }}
                  className={`inline-block mr-3 ${i >= 3 ? 'text-gold drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 'text-white'}`}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-lg text-slate-300 mb-10 max-w-xl leading-relaxed"
            >
              Submit your car part request in under 2 minutes. Our network of verified suppliers will
              compete to give you the best price — fast, simple, and free.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/find-parts">
                <Button size="lg" className="w-full sm:w-auto group shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                  Find My Part Now
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto backdrop-blur-sm">
                  How It Works
                </Button>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.3 }}
              className="flex flex-wrap items-center gap-6 mt-12"
            >
              {[
                { icon: Shield, text: '100% Free to Request' },
                { icon: Zap, text: 'Replies Within Hours' },
                { icon: Star, text: '500+ Verified Suppliers' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-slate-400 text-sm">
                  <Icon size={15} className="text-gold" />
                  {text}
                </div>
              ))}
            </motion.div>

            {/* Slideshow dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="flex gap-2 mt-8"
            >
              {bgSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setBgIndex(i)}
                  className={`h-1 rounded-full transition-all duration-500 ${i === bgIndex ? 'bg-gold w-8' : 'bg-white/20 w-2'}`}
                />
              ))}
            </motion.div>
          </div>

          {/* Right — Remotion animation panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
            className="relative hidden lg:block"
          >
            <HeroAnimationPanel />
            <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
              <div className="w-96 h-96 rounded-full bg-gold/8 blur-3xl" />
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4, type: 'spring', stiffness: 200 }}
              className="absolute top-4 right-[-14px] bg-navy-card border border-gold/30 rounded-xl px-3 py-2 shadow-xl backdrop-blur-sm z-10"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white text-xs font-semibold">Suppliers Online</span>
              </div>
              <p className="text-gold text-lg font-black mt-0.5">500+</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
