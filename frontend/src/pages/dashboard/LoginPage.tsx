import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Wrench, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { BRAND } from '../../constants/brand';

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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-gold/3 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center">
              <Wrench size={20} className="text-navy" />
            </div>
            <span className="font-bold text-lg text-white">{BRAND.name}</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">Supplier & Admin Portal</h1>
          <p className="text-slate-400 text-sm">Sign in to access your dashboard</p>
        </div>

        <div className="bg-navy-card border border-navy-border rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <input {...register('email')} type="email" placeholder="you@example.com" className="input-base" autoFocus />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <input {...register('password')} type="password" placeholder="Your password" className="input-base" />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <Button type="submit" size="lg" className="w-full" loading={loading}>
              <LogIn size={16} />
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center mt-6 text-slate-500 text-sm">
          Not a supplier yet?{' '}
          <Link to="/contact" className="text-gold hover:underline">Contact us to join</Link>
        </p>
      </motion.div>
    </div>
  );
}
