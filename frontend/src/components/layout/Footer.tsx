import { Link } from 'react-router-dom';
import { Wrench, Mail, Phone, MapPin } from 'lucide-react';
import { BRAND, NAV_LINKS } from '../../constants/brand';

export default function Footer() {
  return (
    <footer className="bg-navy-light border-t border-navy-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gold flex items-center justify-center">
                <Wrench size={18} className="text-navy" />
              </div>
              <span className="font-bold text-lg text-white">{BRAND.name}</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              {BRAND.description}
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-gold text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-400 text-sm">
                <Mail size={15} className="text-gold flex-shrink-0" />
                {BRAND.email}
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-sm">
                <Phone size={15} className="text-gold flex-shrink-0" />
                {BRAND.phone}
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-sm">
                <MapPin size={15} className="text-gold flex-shrink-0" />
                {BRAND.address}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-navy-border mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <Link to="/dashboard/login" className="text-slate-500 hover:text-gold text-sm transition-colors">
            Supplier Portal
          </Link>
        </div>
      </div>
    </footer>
  );
}
