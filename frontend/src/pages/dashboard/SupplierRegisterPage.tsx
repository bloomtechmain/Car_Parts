import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, MailCheck } from 'lucide-react';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';
import { MaskLines } from '../../components/ui/Reveal';
import api from '../../services/api';
import { PHOTOS } from '../../constants/brand';

const schema = z
  .object({
    company_name: z.string().trim().min(2, 'Company name is required').max(255),
    email: z.string().trim().email('Valid email required'),
    phone: z.string().trim().min(7, 'Valid phone number required').max(50),
    address: z.string().trim().min(3, 'Business address is required').max(500),
    business_details: z.string().trim().max(2000).optional(),
    password: z.string().min(8, 'At least 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

type FormData = z.infer<typeof schema>;

/** Suppliers apply here; the account works only after an admin approves it. */
export default function SupplierRegisterPage() {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ confirm: _confirm, ...data }: FormData) => {
    void _confirm;
    setLoading(true);
    setServerError(null);
    try {
      await api.post('/api/auth/register-supplier', data);
      setSentTo(data.email);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      setServerError(msg || 'Could not send your application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-ink lg:grid-cols-2">
      {/* photo side */}
      <div className="relative hidden overflow-hidden lg:block">
        <motion.div
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${PHOTOS.toolWall})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/30" />
        <div className="absolute inset-x-0 bottom-0 p-12">
          <p className="label mb-6 text-signal">Supplier application</p>
          <h2 className="display text-[clamp(3rem,5vw,5rem)] text-bone">
            <MaskLines animateOnMount delay={0.3} lines={['Join the', 'network.']} />
          </h2>
        </div>
      </div>

      {/* form side */}
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <Logo />
          <Link to="/" className="group inline-flex items-center gap-2 text-sm text-steel hover:text-bone">
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            Back to site
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto my-auto w-full max-w-md py-12"
        >
          {sentTo ? (
            <div>
              <MailCheck size={44} className="mb-6 text-signal" />
              <p className="label mb-4 text-signal">Application sent</p>
              <h1 className="display mb-4 text-5xl text-bone">Thanks — we'll review it.</h1>
              <p className="mb-10 leading-relaxed text-steel">
                Your supplier account is waiting for admin approval. We'll email <span className="text-bone">{sentTo}</span> as
                soon as it's approved — then you can log in and start quoting.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/" tabIndex={-1}><Button variant="secondary" size="lg">Back to site</Button></Link>
                <Link to="/dashboard/login" tabIndex={-1}><Button size="lg" arrow>Go to login</Button></Link>
              </div>
            </div>
          ) : (
            <>
              <p className="label mb-4 text-steel">Become a supplier</p>
              <h1 className="display mb-4 text-6xl text-bone">Apply to join.</h1>
              <p className="mb-10 text-sm text-steel">
                Tell us about your business. An admin reviews every application — you can log in once it's approved.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
                <div>
                  <label className="field-label">Company / trading name *</label>
                  <input {...register('company_name')} placeholder="e.g. Lanka Auto Parts" className="input-base" autoFocus />
                  {errors.company_name && <p className="field-error">{errors.company_name.message}</p>}
                </div>

                <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                  <div>
                    <label className="field-label">Email *</label>
                    <input {...register('email')} type="email" placeholder="sales@company.lk" className="input-base" />
                    {errors.email && <p className="field-error">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="field-label">Phone *</label>
                    <input {...register('phone')} type="tel" placeholder="+94 77 000 0000" className="input-base" />
                    {errors.phone && <p className="field-error">{errors.phone.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="field-label">Business address *</label>
                  <input {...register('address')} placeholder="Shop no., street, city" className="input-base" />
                  {errors.address && <p className="field-error">{errors.address.message}</p>}
                </div>

                <div>
                  <label className="field-label">What you supply <span className="normal-case tracking-normal text-steel/60">— optional</span></label>
                  <textarea
                    {...register('business_details')}
                    rows={3}
                    placeholder="Makes and parts you stock, OEM / aftermarket, business registration no., etc."
                    className="input-base resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                  <div>
                    <label className="field-label">Password *</label>
                    <input {...register('password')} type="password" placeholder="At least 8 characters" className="input-base" />
                    {errors.password && <p className="field-error">{errors.password.message}</p>}
                  </div>
                  <div>
                    <label className="field-label">Confirm password *</label>
                    <input {...register('confirm')} type="password" placeholder="••••••••" className="input-base" />
                    {errors.confirm && <p className="field-error">{errors.confirm.message}</p>}
                  </div>
                </div>

                {serverError && (
                  <p role="alert" className="border-l-2 border-red-500 bg-red-500/10 px-4 py-3 text-sm text-red-300">{serverError}</p>
                )}

                <div className="flex gap-3 border-l-2 border-signal bg-ink-2 px-4 py-3 text-xs text-steel">
                  <Lock size={14} className="mt-0.5 shrink-0 text-signal" />
                  <p>
                    Already have a customer account with this email? That's fine — just use a <span className="text-bone">different password</span> for
                    your supplier account.
                  </p>
                </div>

                <Button type="submit" size="lg" className="w-full" loading={loading} arrow>
                  {loading ? 'Sending application' : 'Send for approval'}
                </Button>
              </form>

              <p className="mt-10 border-t border-ink-line pt-6 text-sm text-steel">
                Already approved?{' '}
                <Link to="/dashboard/login" className="link-draw text-bone">Sign in</Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
