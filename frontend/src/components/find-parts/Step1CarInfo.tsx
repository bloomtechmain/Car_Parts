import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../ui/Button';
import StepHeader from './StepHeader';
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
  onLive?: (data: Partial<FindPartsFormData>) => void;
}

const years = Array.from({ length: new Date().getFullYear() - 1989 }, (_, i) => new Date().getFullYear() - i);

export default function Step1CarInfo({ defaultValues, onNext, onLive }: Props) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Step1Data>({
    resolver: zodResolver(schema),
    defaultValues: { ...defaultValues, car_year: defaultValues.car_year || undefined },
  });

  useEffect(() => {
    const sub = watch((v) => onLive?.(v as Partial<FindPartsFormData>));
    return () => sub.unsubscribe();
  }, [watch, onLive]);

  return (
    <form onSubmit={handleSubmit(onNext)}>
      <StepHeader no="01" title="The car" hint="What it is, so suppliers quote the right part." />

      <div className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
        <div>
          <label className="field-label">Make *</label>
          <select {...register('car_make')} className="input-base">
            <option value="">Select make</option>
            {CAR_MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          {errors.car_make && <p className="field-error">{errors.car_make.message}</p>}
        </div>

        <div>
          <label className="field-label">Model *</label>
          <input {...register('car_model')} placeholder="e.g. Camry, X5, E-Class" className="input-base" />
          {errors.car_model && <p className="field-error">{errors.car_model.message}</p>}
        </div>

        <div>
          <label className="field-label">Year *</label>
          <select {...register('car_year', { valueAsNumber: true })} className="input-base">
            <option value="">Select year</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          {errors.car_year && <p className="field-error">{errors.car_year.message}</p>}
        </div>

        <div>
          <label className="field-label">VIN <span className="normal-case tracking-normal text-steel/60">— optional</span></label>
          <input {...register('car_vin')} placeholder="17 characters" className="input-base font-mono uppercase tracking-wider" />
        </div>
      </div>

      <div className="mt-10">
        <Button type="submit" size="lg" className="w-full" arrow>Next — the part</Button>
      </div>
    </form>
  );
}
