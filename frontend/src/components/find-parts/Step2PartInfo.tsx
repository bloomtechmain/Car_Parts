import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wrench } from 'lucide-react';
import Button from '../ui/Button';
import { PART_CATEGORIES } from '../../constants/brand';
import type { FindPartsFormData } from '../../types';

const schema = z.object({
  part_category: z.string().min(1, 'Category is required'),
  part_name: z.string().min(1, 'Part name is required').max(255),
  part_description: z.string().max(2000).optional(),
});

type Step2Data = z.infer<typeof schema>;

interface Props {
  defaultValues: Partial<FindPartsFormData>;
  onNext: (data: Step2Data) => void;
  onBack: () => void;
}

export default function Step2PartInfo({ defaultValues, onNext, onBack }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<Step2Data>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
          <Wrench size={20} className="text-gold" />
        </div>
        <div>
          <h3 className="font-bold text-white">Part Details</h3>
          <p className="text-slate-400 text-sm">What part are you looking for?</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Part Category *</label>
        <select {...register('part_category')} className="input-base bg-navy-card">
          <option value="">Select category</option>
          {PART_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.part_category && <p className="text-red-400 text-xs mt-1">{errors.part_category.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Part Name *</label>
        <input {...register('part_name')} placeholder="e.g. Front Brake Pads, Alternator, Radiator" className="input-base" />
        {errors.part_name && <p className="text-red-400 text-xs mt-1">{errors.part_name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Additional Details <span className="text-slate-500">(optional)</span></label>
        <textarea
          {...register('part_description')}
          rows={4}
          placeholder="e.g. OEM preferred, 2.5L engine variant, front-wheel drive. Any additional info helps suppliers find the right part."
          className="input-base resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={onBack}>Back</Button>
        <Button type="submit" size="lg" className="flex-1">Continue to Contact Info</Button>
      </div>
    </form>
  );
}
