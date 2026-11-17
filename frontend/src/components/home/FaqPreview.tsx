import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Accordion from '../ui/Accordion';
import { ALL_FAQS } from '../../constants/faqs';
import { MaskLines, SectionMark } from '../ui/Reveal';

const PICKS = [0, 5, 9, 10].map((i) => ALL_FAQS[i]).filter(Boolean);

export default function FaqPreview() {
  return (
    <section className="bg-ink py-24 lg:py-32">
      <div className="shell grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionMark index="07" label="Asked often" className="mb-8" />
          <h2 className="display mb-8 text-[clamp(2.6rem,5vw,4.4rem)] text-bone">
            <MaskLines lines={['Fair', 'questions.']} />
          </h2>
          <Link to="/faq" className="group inline-flex items-center gap-2 text-sm text-bone">
            <span className="link-draw">Read all of them</span>
            <ArrowRight size={14} className="text-signal transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="lg:col-span-8">
          <Accordion items={PICKS} />
        </div>
      </div>
    </section>
  );
}
