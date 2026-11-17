import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../ui/Button';
import StepHeader from './StepHeader';
import { PART_CATEGORIES } from '../../constants/brand';
import type { FindPartsFormData } from '../../types';
import { cn } from '../../utils/cn';

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
  onLive?: (data: Partial<FindPartsFormData>) => void;
}

export default function Step2PartInfo({ defaultValues, onNext, onBack, onLive }: Props) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Step2Data>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    const sub = watch((v) => onLive?.(v as Partial<FindPartsFormData>));
    return () => sub.unsubscribe();
  }, [watch, onLive]);

  const category = watch('part_category');

  return (
    <form onSubmit={handleSubmit(onNext)}>
      <StepHeader no="02" title="The part" hint="Name it as best you can. Close enough is fine." />

      <div className="space-y-8">
        <div>
          <label className="field-label mb-3">Section of the car *</label>
          <input type="hidden" {...register('part_category')} />
          <div className="flex flex-wrap gap-1.5">
            {PART_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setValue('part_category', c, { shouldValidate: true, shouldDirty: true })}
                className={cn(
                  'border px-3 py-1.5 text-[13px] transition-colors',
                  category === c
                    ? 'border-signal bg-signal text-ink'
                    : 'border-ink-line text-steel hover:border-bone/40 hover:text-bone',
                )}
              >
                {c}
              </button>
            ))}
          </div>
          {errors.part_category && <p className="field-error">{errors.part_category.message}</p>}
        </div>

        <div>
          <label className="field-label">Part name *</label>
          <input {...register('part_name')} placeholder="e.g. Front brake pads, alternator, radiator" className="input-base text-lg" />
          {errors.part_name && <p className="field-error">{errors.part_name.message}</p>}
        </div>

        <div>
          <label className="field-label">Anything else? <span className="normal-case tracking-normal text-steel/60">— optional</span></label>
          <textarea
            {...register('part_description')}
            rows={4}
            placeholder="OEM or aftermarket, engine size, left or right side, part number if you have it…"
            className="input-base resize-none"
          />
        </div>
      </div>

      <div className="mt-10 flex gap-3">
        <Button type="button" variant="secondary" size="lg" onClick={onBack}>Back</Button>
        <Button type="submit" size="lg" className="flex-1" arrow>Next — your details</Button>
      </div>
    </form>
  );
}
