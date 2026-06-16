import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Car } from 'lucide-react';
import Button from '../ui/Button';
import { CAR_MAKES } from '../../constants/brand';
import type { FindPartsFormData } from '../../types';

const schema = z.object({
  car_make: z.string().min(1, 'Make is required'),
  car_model: z.string().min(1, 'Model is required'),
  car_year: z.number({ invalid_type_error: 'Year is required' }).int().min(1990).max(new Date().getFullYear() + 1),
  car_vin: z.string().max(50).optional(),
});

type Step1Data = z.infer<typeof schema>;

interface Props {
  defaultValues: Partial<FindPartsFormData>;
  onNext: (data: Step1Data) => void;
}

const years = Array.from({ length: new Date().getFullYear() - 1989 }, (_, i) => new Date().getFullYear() - i);

export default function Step1CarInfo({ defaultValues, onNext }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<Step1Data>({
    resolver: zodResolver(schema),
    defaultValues: { ...defaultValues, car_year: defaultValues.car_year || undefined },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
          <Car size={20} className="text-gold" />
        </div>
        <div>
          <h3 className="font-bold text-white">Vehicle Information</h3>
          <p className="text-slate-400 text-sm">Tell us about your car</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Car Make *</label>
          <select {...register('car_make')} className="input-base bg-navy-card">
            <option value="">Select make</option>
            {CAR_MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          {errors.car_make && <p className="text-red-400 text-xs mt-1">{errors.car_make.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Car Model *</label>
          <input {...register('car_model')} placeholder="e.g. Camry, X5, E-Class" className="input-base" />
          {errors.car_model && <p className="text-red-400 text-xs mt-1">{errors.car_model.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Year *</label>
          <select {...register('car_year', { valueAsNumber: true })} className="input-base bg-navy-card">
            <option value="">Select year</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          {errors.car_year && <p className="text-red-400 text-xs mt-1">{errors.car_year.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">VIN <span className="text-slate-500">(optional)</span></label>
          <input {...register('car_vin')} placeholder="e.g. 1HGCM82633A123456" className="input-base" />
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" size="lg" className="w-full">Continue to Part Details</Button>
      </div>
    </form>
  );
}
