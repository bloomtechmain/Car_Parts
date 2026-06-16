import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import StepIndicator from '../../components/find-parts/StepIndicator';
import Step1CarInfo from '../../components/find-parts/Step1CarInfo';
import Step2PartInfo from '../../components/find-parts/Step2PartInfo';
import Step3ContactInfo from '../../components/find-parts/Step3ContactInfo';
import SuccessScreen from '../../components/find-parts/SuccessScreen';
import api from '../../services/api';
import type { FindPartsFormData } from '../../types';

const STEPS = ['Car Info', 'Part Details', 'Contact'];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

export default function FindPartsPage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<Partial<FindPartsFormData>>({});
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const goNext = (data: Partial<FindPartsFormData>) => {
    setDirection(1);
    setFormData((prev) => ({ ...prev, ...data }));
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const handleSubmit = async (contactData: Partial<FindPartsFormData>) => {
    const payload = { ...formData, ...contactData };
    setLoading(true);
    try {
      const res = await api.post('/api/tickets', payload);
      setTicketNumber(res.data.ticket_number);
      setStep(4);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : 'Something went wrong. Please try again.';
      toast.error(msg || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-3"
          >
            {step === 4 ? 'Request Submitted' : 'Find Your Part'}
          </motion.h1>
          {step < 4 && (
            <p className="text-slate-400">Free, fast, and no commitment required</p>
          )}
        </div>

        {step < 4 && (
          <StepIndicator currentStep={step} steps={STEPS} />
        )}

        <div className="bg-navy-card border border-navy-border rounded-2xl p-6 sm:p-8 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              {step === 1 && (
                <Step1CarInfo defaultValues={formData} onNext={goNext} />
              )}
              {step === 2 && (
                <Step2PartInfo defaultValues={formData} onNext={goNext} onBack={goBack} />
              )}
              {step === 3 && (
                <Step3ContactInfo
                  defaultValues={formData}
                  onSubmit={handleSubmit}
                  onBack={goBack}
                  loading={loading}
                />
              )}
              {step === 4 && ticketNumber && (
                <SuccessScreen ticketNumber={ticketNumber} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
