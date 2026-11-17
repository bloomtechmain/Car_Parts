export default function StepHeader({ no, title, hint }: { no: string; title: string; hint: string }) {
  return (
    <div className="mb-8 flex items-end gap-5 border-b border-ink-line pb-6">
      <span className="font-display text-7xl font-extrabold leading-[0.75] text-signal">{no}</span>
      <div>
        <h2 className="font-display text-3xl font-bold uppercase leading-none text-bone">{title}</h2>
        <p className="mt-2 text-sm text-steel">{hint}</p>
      </div>
    </div>
  );
}
