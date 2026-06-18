import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Car, Wrench, DollarSign, Clock, Loader2 } from 'lucide-react';
import api from '../../services/api';

interface OptionPreview {
  ticket_number: string;
  car_make: string;
  car_model: string;
  car_year: number;
  part_name: string;
  part_category: string;
  option: {
    reply_id: number;
    admin_price: number;
    delivery_days: number;
    option_number: number;
  };
}

type PageState = 'loading' | 'preview' | 'confirming' | 'confirmed' | 'error' | 'already_done';

export default function SelectOptionPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const reply = searchParams.get('reply') ?? '';

  const [state, setState] = useState<PageState>('loading');
  const [preview, setPreview] = useState<OptionPreview | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token || !reply) {
      setErrorMsg('This link is invalid or incomplete.');
      setState('error');
      return;
    }

    api.get(`/api/tickets/select-option?token=${encodeURIComponent(token)}&reply=${encodeURIComponent(reply)}`)
      .then((res) => {
        setPreview(res.data);
        setState('preview');
      })
      .catch((err) => {
        const data = err?.response?.data;
        if (data?.already_selected) {
          setState('already_done');
        } else {
          setErrorMsg(data?.error || 'This link is invalid or has expired.');
          setState('error');
        }
      });
  }, [token, reply]);

  const handleConfirm = async () => {
    setState('confirming');
    try {
      await api.post('/api/tickets/confirm-selection', {
        token,
        reply_id: Number(reply),
      });
      setState('confirmed');
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: string; already_selected?: boolean } } })?.response?.data;
      if (data?.already_selected) {
        setState('already_done');
      } else {
        setErrorMsg(data?.error || 'Failed to confirm selection. Please try again.');
        setState('error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Loading */}
        {state === 'loading' && (
          <div className="bg-navy-light border border-navy-border rounded-2xl p-10 text-center">
            <Loader2 size={40} className="text-gold animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading your option details...</p>
          </div>
        )}

        {/* Preview / Confirm */}
        {(state === 'preview' || state === 'confirming') && preview && (
          <div className="bg-navy-light border border-navy-border rounded-2xl overflow-hidden">
            <div className="bg-gold px-6 py-5">
              <h1 className="text-navy font-bold text-xl">Confirm Your Selection</h1>
              <p className="text-navy/70 text-sm mt-1">Review the details before placing your order</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Ticket */}
              <div className="text-center">
                <p className="text-slate-500 text-xs mb-1">TICKET NUMBER</p>
                <p className="text-gold font-mono font-bold text-xl tracking-widest">{preview.ticket_number}</p>
              </div>

              {/* Vehicle */}
              <div className="bg-navy-card border border-navy-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Car size={14} className="text-slate-400" />
                  <span className="text-slate-400 text-xs uppercase tracking-wide font-semibold">Vehicle</span>
                </div>
                <p className="text-white font-medium">{preview.car_year} {preview.car_make} {preview.car_model}</p>
              </div>

              {/* Part */}
              <div className="bg-navy-card border border-navy-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench size={14} className="text-slate-400" />
                  <span className="text-slate-400 text-xs uppercase tracking-wide font-semibold">Part</span>
                </div>
                <p className="text-white font-medium">{preview.part_name}</p>
                <p className="text-slate-400 text-sm">{preview.part_category}</p>
              </div>

              {/* Selected Option */}
              <div className="bg-navy-card border border-gold/40 rounded-xl p-4">
                <p className="text-gold text-xs uppercase tracking-wide font-semibold mb-3">
                  Option {preview.option.option_number} — Your Selection
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={15} className="text-gold" />
                  <span className="text-white font-bold text-2xl">
                    Rs. {Number(preview.option.admin_price).toLocaleString('si-LK')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-slate-400" />
                  <span className="text-slate-300 text-sm">
                    Estimated delivery: {preview.option.delivery_days} day{preview.option.delivery_days !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <button
                onClick={handleConfirm}
                disabled={state === 'confirming'}
                className="w-full bg-gold text-navy font-bold py-3 rounded-xl hover:bg-gold/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {state === 'confirming' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Confirming...
                  </>
                ) : (
                  'Confirm & Place Order'
                )}
              </button>

              <p className="text-slate-500 text-xs text-center">
                By confirming, your order will be placed and you will receive a confirmation email and SMS.
              </p>
            </div>
          </div>
        )}

        {/* Success */}
        {state === 'confirmed' && (
          <div className="bg-navy-light border border-green-500/30 rounded-2xl p-10 text-center">
            <CheckCircle size={56} className="text-green-400 mx-auto mb-4" />
            <h2 className="text-white font-bold text-xl mb-2">Order Confirmed!</h2>
            <p className="text-slate-400 leading-relaxed">
              Your order has been placed successfully. You will receive a confirmation email and SMS shortly.
            </p>
            <p className="text-slate-500 text-sm mt-4">Our team will be in touch with delivery details.</p>
          </div>
        )}

        {/* Already selected */}
        {state === 'already_done' && (
          <div className="bg-navy-light border border-gold/30 rounded-2xl p-10 text-center">
            <CheckCircle size={56} className="text-gold mx-auto mb-4" />
            <h2 className="text-white font-bold text-xl mb-2">Order Already Placed</h2>
            <p className="text-slate-400 leading-relaxed">
              An option has already been selected for this ticket. Your order is confirmed.
            </p>
          </div>
        )}

        {/* Error */}
        {state === 'error' && (
          <div className="bg-navy-light border border-red-500/30 rounded-2xl p-10 text-center">
            <XCircle size={56} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-white font-bold text-xl mb-2">Link Invalid</h2>
            <p className="text-slate-400 leading-relaxed">{errorMsg}</p>
          </div>
        )}

        <p className="text-center text-slate-600 text-xs mt-6">CarParts Finder</p>
      </div>
    </div>
  );
}
