import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';
import { MaskLines } from '../../components/ui/Reveal';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { PHOTOS } from '../../constants/brand';

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', data);
      login(res.data.token, res.data.user);
      navigate(`/dashboard/${res.data.user.role}`, { replace: true });
    } catch {
      toast.error('Invalid email or password');
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
          <p className="label mb-6 text-signal">Supplier &amp; admin portal</p>
          <h2 className="display text-[clamp(3rem,5vw,5rem)] text-bone">
            <MaskLines animateOnMount delay={0.3} lines={['Requests in.', 'Quotes out.']} />
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
          <p className="label mb-4 text-steel">Sign in</p>
          <h1 className="display mb-10 text-6xl text-bone">Welcome back.</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div>
              <label className="field-label">Email</label>
              <input {...register('email')} type="email" placeholder="you@example.com" className="input-base" autoFocus />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>

            <div>
              <label className="field-label">Password</label>
              <input {...register('password')} type="password" placeholder="••••••••" className="input-base" />
              {errors.password && <p className="field-error">{errors.password.message}</p>}
            </div>

            <Button type="submit" size="lg" className="w-full" loading={loading} arrow>
              {loading ? 'Signing in' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-10 border-t border-ink-line pt-6 text-sm text-steel">
            Not a supplier yet?{' '}
            <Link to="/contact" className="link-draw text-bone">
              Ask to join the network
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
