import { useState } from 'react';
import { useNavigate, Link, Navigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';
import { MaskLines } from '../../components/ui/Reveal';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { PHOTOS } from '../../constants/brand';
import { safeNext, afterLoginPath } from '../../utils/authRedirect';

const schema = z
  .object({
    email: z.string().trim().email('Valid email required'),
    phone: z.string().trim().min(7, 'Valid phone number required').max(50),
    password: z.string().min(8, 'At least 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get('next'));
  const login = useAuthStore((s) => s.login);
  const { token, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  if (token && user) {
    return <Navigate to={afterLoginPath(user.role, next)} replace />;
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setServerError(null);
    try {
      const res = await api.post('/api/auth/register', {
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      login(res.data.token, res.data.user);
      toast.success('Account created');
      navigate(afterLoginPath('customer', next), { replace: true });
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      setServerError(msg || 'Could not create the account. Please try again.');
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
          <p className="label mb-6 text-signal">Customer account</p>
          <h2 className="display text-[clamp(3rem,5vw,5rem)] text-bone">
            <MaskLines animateOnMount delay={0.3} lines={['Request parts.', 'Track quotes.']} />
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
          className="mx-auto my-auto w-full max-w-sm py-16"
        >
          <p className="label mb-4 text-steel">Create account</p>
          <h1 className="display mb-4 text-6xl text-bone">Get started.</h1>
          <p className="mb-10 text-sm text-steel">Just your email, phone and a password. Takes 30 seconds.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
            <div>
              <label className="field-label">Email</label>
              <input {...register('email')} type="email" placeholder="you@example.com" className="input-base" autoFocus />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>

            <div>
              <label className="field-label">Phone</label>
              <input {...register('phone')} type="tel" placeholder="+94 77 000 0000" className="input-base" />
              {errors.phone && <p className="field-error">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="field-label">Password</label>
              <input {...register('password')} type="password" placeholder="At least 8 characters" className="input-base" />
              {errors.password && <p className="field-error">{errors.password.message}</p>}
            </div>

            <div>
              <label className="field-label">Confirm password</label>
              <input {...register('confirm')} type="password" placeholder="••••••••" className="input-base" />
              {errors.confirm && <p className="field-error">{errors.confirm.message}</p>}
            </div>

            {serverError && (
              <p role="alert" className="border-l-2 border-red-500 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {serverError}
              </p>
            )}

            <div className="flex gap-3 border-l-2 border-signal bg-ink-2 px-4 py-3 text-xs text-steel">
              <Lock size={14} className="mt-0.5 shrink-0 text-signal" />
              <p>
                Already a supplier with us? You can use the same email — just pick a <span className="text-bone">different password</span> for
                your customer account.
              </p>
            </div>

            <Button type="submit" size="lg" className="w-full" loading={loading} arrow>
              {loading ? 'Creating account' : 'Create account'}
            </Button>
          </form>

          <p className="mt-10 border-t border-ink-line pt-6 text-sm text-steel">
            Already have an account?{' '}
            <Link to={next ? `/dashboard/login?next=${encodeURIComponent(next)}` : '/dashboard/login'} className="link-draw text-bone">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
