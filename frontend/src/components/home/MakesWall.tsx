import { Link } from 'react-router-dom';
import { CAR_MAKES } from '../../constants/brand';
import { MaskLines, SectionMark } from '../ui/Reveal';

const MAKES = CAR_MAKES.filter((m) => m !== 'Other');

export default function MakesWall() {
  return (
    <section className="overflow-x-clip bg-ink py-24 lg:py-32">
      <div className="shell">
        <div className="mb-12 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <SectionMark index="05" label="Makes we source for" className="mb-8" />
            <h2 className="display text-[clamp(2.6rem,5.6vw,5rem)] text-bone">
              <MaskLines lines={['Whatever badge', 'is on the bonnet.']} />
            </h2>
          </div>
          <p className="max-w-sm text-steel">
            Daily drivers, work trucks, the odd Italian. Hover a make, click it, and we’ll start the request with
            it filled in.
          </p>
        </div>

        <p className="font-display text-[clamp(1.9rem,4.4vw,3.9rem)] font-bold uppercase leading-[1.08]">
          {MAKES.map((make, i) => (
            <span key={make} className="whitespace-nowrap">
              <Link
                to={`/find-parts?make=${encodeURIComponent(make)}`}
                className="group relative inline-block text-bone/20 transition-colors duration-300 hover:text-bone"
              >
                {make}
                <span className="pointer-events-none absolute -top-3 left-0 whitespace-nowrap font-mono text-[10px] font-normal normal-case tracking-normal text-signal opacity-0 transition-all duration-300 group-hover:-top-4 group-hover:opacity-100">
                  start a {make} request →
                </span>
              </Link>
              {i < MAKES.length - 1 && <span className="px-[0.25em] text-signal/50">/</span>}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
