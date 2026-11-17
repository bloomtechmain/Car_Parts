import Marquee from '../ui/Marquee';

/* Examples of the kind of request the desk handles — illustrative, not live data */
const EXAMPLES = [
  ['Toyota Prius ’15', 'Inverter water pump'],
  ['Nissan Patrol Y62', 'Front lower control arm'],
  ['BMW 320i F30', 'Headlamp, left side'],
  ['Honda Civic ’18', 'AC compressor'],
  ['Land Cruiser 200', 'Rear diff seal kit'],
  ['Mercedes C200 W205', 'Thermostat housing'],
  ['Hyundai Elantra ’17', 'Door mirror glass'],
  ['Mitsubishi Pajero', 'Clutch kit'],
  ['Kia Sportage ’19', 'Rear brake discs'],
  ['Lexus RX350', 'Engine mount'],
];

export default function RequestTicker() {
  return (
    <section className="relative flex items-stretch border-y border-ink bg-signal text-ink" aria-label="Typical requests">
      <div className="relative z-10 hidden shrink-0 items-center bg-ink px-5 sm:flex">
        <span className="label text-signal">Typical requests</span>
      </div>
      <Marquee className="flex-1 py-3.5">
        {EXAMPLES.map(([car, part]) => (
          <span key={car} className="flex items-baseline gap-3 whitespace-nowrap px-6 text-[15px]">
            <span className="font-mono text-[11px] uppercase tracking-wider opacity-70">{car}</span>
            <span className="font-display text-xl font-bold uppercase">{part}</span>
            <span className="pl-6 text-ink/40">/</span>
          </span>
        ))}
      </Marquee>
    </section>
  );
}
