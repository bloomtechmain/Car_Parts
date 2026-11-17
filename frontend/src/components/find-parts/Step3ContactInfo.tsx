import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock } from 'lucide-react';
import Button from '../ui/Button';
import StepHeader from './StepHeader';
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
  onLive?: (data: Partial<FindPartsFormData>) => void;
  loading?: boolean;
}

export default function Step3ContactInfo({ defaultValues, onSubmit, onBack, onLive, loading }: Props) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Step3Data>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    const sub = watch((v) => onLive?.(v as Partial<FindPartsFormData>));
    return () => sub.unsubscribe();
  }, [watch, onLive]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <StepHeader no="03" title="Where to reach you" hint="So we can send you the quotes." />

      <div className="mb-8 flex gap-3 border-l-2 border-signal bg-ink-2 px-4 py-3 text-sm text-steel">
        <Lock size={15} className="mt-0.5 shrink-0 text-signal" />
        <p>
          <span className="text-bone">Only our team sees this.</span> Suppliers get the car and the part — never
          your name, number or address.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="field-label">Full name *</label>
          <input {...register('full_name')} placeholder="Your full name" className="input-base" />
          {errors.full_name && <p className="field-error">{errors.full_name.message}</p>}
        </div>

        <div>
          <label className="field-label">Email *</label>
          <input {...register('email')} type="email" placeholder="you@example.com" className="input-base" />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>

        <div>
          <label className="field-label">Phone *</label>
          <input {...register('phone')} type="tel" placeholder="+94 77 000 0000" className="input-base" />
          {errors.phone && <p className="field-error">{errors.phone.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="field-label">City / area *</label>
          <input {...register('location')} placeholder="e.g. Dubai, UAE" className="input-base" />
          {errors.location && <p className="field-error">{errors.location.message}</p>}
        </div>
      </div>

      <div className="mt-10 flex gap-3">
        <Button type="button" variant="secondary" size="lg" onClick={onBack} disabled={loading}>Back</Button>
        <Button type="submit" size="lg" className="flex-1" loading={loading} arrow>
          {loading ? 'Sending to suppliers' : 'Send my request'}
        </Button>
      </div>
    </form>
  );
}
