import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import api from '../../services/api';

const schema = z.object({
  price: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  ticketId: number;
  ticketNumber: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ReplyForm({ ticketId, ticketNumber, onSuccess, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (data.price) formData.append('price', data.price);
      if (data.notes) formData.append('notes', data.notes);
      if (imageFile) formData.append('image', imageFile);

      await api.post(`/api/supplier/tickets/${ticketId}/reply`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Reply submitted successfully!');
      onSuccess();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : 'Failed to submit reply';
      toast.error(msg || 'Failed to submit reply');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-navy-border pt-5 mt-5">
      <h4 className="text-white font-semibold mb-4">Submit Your Quote for {ticketNumber}</h4>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Price (LKR)</label>
          <input
            {...register('price')}
            type="number"
            step="0.01"
            placeholder="e.g. 250.00"
            className="input-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Notes</label>
          <textarea
            {...register('notes')}
            rows={3}
            placeholder="Part condition, warranty, availability, delivery time..."
            className="input-base resize-none"
          />
          {errors.notes && <p className="text-red-400 text-xs mt-1">{errors.notes.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Image (optional)</label>
          {imagePreview ? (
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-navy-border">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-1 right-1 bg-navy/80 rounded-full p-1 text-white hover:bg-red-500"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full h-24 border-2 border-dashed border-navy-border rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-gold/50 hover:text-gold transition-all"
            >
              <Upload size={20} />
              <span className="text-sm">Click to upload image</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
          <Button type="submit" loading={loading}>Submit Quote</Button>
        </div>
      </form>
    </div>
  );
}
