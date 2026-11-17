import { Link } from 'react-router-dom';
import { ArrowUp, ArrowUpRight } from 'lucide-react';
import { BRAND, NAV_LINKS } from '../../constants/brand';
import { Reveal } from '../ui/Reveal';
import Button from '../ui/Button';

const WORDMARK = 'CARPARTS FINDER'.split('');

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-ink-line bg-ink">
      {/* Pre-footer call */}
      <div className="shell grid gap-10 py-20 lg:grid-cols-12 lg:py-28">
        <Reveal className="lg:col-span-8">
          <p className="label mb-6 text-signal">Still stuck?</p>
          <h2 className="display text-[clamp(2.6rem,6vw,5.5rem)] text-bone">
            Got a part number,
            <br />
            or just a photo of
            <br />
            <span className="text-steel">the broken bit?</span>
          </h2>
        </Reveal>
        <Reveal className="flex flex-col justify-end gap-5 lg:col-span-4" delay={0.15}>
          <p className="max-w-sm leading-relaxed text-steel">
            Either is enough to start. Describe what you have and our suppliers will work out the rest.
          </p>
          <Link to="/find-parts" tabIndex={-1} className="self-start">
            <Button size="lg" arrow>
              Start a request
            </Button>
          </Link>
        </Reveal>
      </div>

      <div className="shell grid grid-cols-2 gap-10 border-t border-ink-line py-14 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <p className="label mb-5 text-steel">About</p>
          <p className="max-w-xs text-sm leading-relaxed text-steel">{BRAND.description}</p>
        </div>

        <div>
          <p className="label mb-5 text-steel">Pages</p>
          <ul className="space-y-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link to={link.href} className="link-draw text-sm text-bone/90 hover:text-bone">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="label mb-5 text-steel">Suppliers</p>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link to="/dashboard/login" className="link-draw text-bone/90 hover:text-bone">
                Supplier portal
              </Link>
            </li>
            <li>
              <Link to="/contact" className="link-draw text-bone/90 hover:text-bone">
                Join the network
              </Link>
            </li>
            <li>
              <Link to="/faq" className="link-draw text-bone/90 hover:text-bone">
                Supplier FAQ
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="label mb-5 text-steel">Reach us</p>
          <ul className="space-y-2.5 text-sm text-bone/90">
            <li>
              <a href={`mailto:${BRAND.email}`} className="group inline-flex items-center gap-1 hover:text-signal">
                {BRAND.email}
                <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </li>
            <li>
              <a href={`tel:${BRAND.phone.replace(/\s/g, '')}`} className="hover:text-signal">
                {BRAND.phone}
              </a>
            </li>
            <li className="text-steel">{BRAND.address}</li>
          </ul>
        </div>
      </div>

      {/* Oversized wordmark — letters lift individually on hover */}
      <div className="shell select-none pb-4" aria-hidden>
        <div className="flex justify-between font-display text-[clamp(2.5rem,12.4vw,11.2rem)] font-black uppercase leading-[0.8] text-ink-3">
          {WORDMARK.map((ch, i) =>
            ch === ' ' ? (
              <span key={i} className="w-[0.2em]" />
            ) : (
              <span
                key={i}
                className="inline-block transition-[transform,color] duration-500 ease-out hover:-translate-y-3 hover:text-signal"
              >
                {ch}
              </span>
            ),
          )}
        </div>
      </div>

      <div className="shell flex flex-col items-start justify-between gap-4 border-t border-ink-line py-6 sm:flex-row sm:items-center">
        <p className="label text-steel/80">
          © {new Date().getFullYear()} {BRAND.name}
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="label group inline-flex items-center gap-2 text-steel hover:text-bone"
        >
          Back to top
          <ArrowUp size={13} className="transition-transform group-hover:-translate-y-1" />
        </button>
      </div>
    </footer>
  );
}
