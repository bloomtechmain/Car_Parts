import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User } from 'lucide-react';
import Button from '../ui/Button';
import type { FindPartsFormData } from '../../types';

const schema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(255),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone is required').max(50),
  location: z.string().min(1, 'Location is required').max(255),
});

type Step3Data = z.infer<typeof schema>;

interface Props {
  defaultValues: Partial<FindPartsFormData>;
  onSubmit: (data: Step3Data) => void;
  onBack: () => void;
  loading?: boolean;
}

export default function Step3ContactInfo({ defaultValues, onSubmit, onBack, loading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<Step3Data>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
          <User size={20} className="text-gold" />
        </div>
        <div>
          <h3 className="font-bold text-white">Your Contact Information</h3>
          <p className="text-slate-400 text-sm">We'll reach out when we have quotes for you</p>
        </div>
      </div>

      <div className="bg-navy-light border border-navy-border rounded-xl p-4 text-sm text-slate-400">
        <strong className="text-gold">Privacy note:</strong> Your contact information is kept strictly confidential.
        Suppliers never see your personal details — only the part request.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name *</label>
          <input {...register('full_name')} placeholder="Your full name" className="input-base" />
          {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address *</label>
          <input {...register('email')} type="email" placeholder="you@example.com" className="input-base" />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number *</label>
          <input {...register('phone')} type="tel" placeholder="+971 50 000 0000" className="input-base" />
          {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Location *</label>
          <input {...register('location')} placeholder="e.g. Dubai, UAE" className="input-base" />
          {errors.location && <p className="text-red-400 text-xs mt-1">{errors.location.message}</p>}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={onBack} disabled={loading}>Back</Button>
        <Button type="submit" size="lg" className="flex-1" loading={loading}>Submit My Request</Button>
      </div>
    </form>
  );
}
