import { motion, useTransform, type MotionValue } from 'framer-motion';
import { cn } from '../../../utils/cn';
import { ENGINE_PARTS, type EnginePart } from './parts';

interface Props {
  /** 0 = assembled, 1 = fully exploded (can overshoot) */
  explode: MotionValue<number>;
  hot: string | null;
  onHot: (id: string | null) => void;
  onPick: (part: EnginePart) => void;
  className?: string;
}

function Part({
  part,
  explode,
  hot,
  onHot,
  onPick,
}: { part: EnginePart } & Omit<Props, 'className'>) {
  const x = useTransform(explode, (e) => part.dx * e);
  const y = useTransform(explode, (e) => part.dy * e);
  const balloonOpacity = useTransform(explode, [0.18, 0.45], [0, 1]);
  const [ax, ay] = part.anchor;
  const [bx, by] = part.balloon;

  return (
    <motion.g
      style={{ x, y }}
      className={cn('engine-part cursor-pointer', hot === part.id && 'hot')}
      onPointerEnter={() => onHot(part.id)}
      onPointerLeave={() => onHot(null)}
      onClick={() => onPick(part)}
      role="button"
      tabIndex={0}
      aria-label={`${part.name} — request this part`}
      onFocus={() => onHot(part.id)}
      onBlur={() => onHot(null)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPick(part);
        }
      }}
    >
      {part.draw()}
      <motion.g style={{ opacity: balloonOpacity }} className="engine-balloon">
        <line x1={ax} y1={ay} x2={bx} y2={by} className="leader" />
        <circle cx={ax} cy={ay} r={2} className="dot" />
        <circle cx={bx} cy={by} r={11} className="ring" />
        <text x={bx} y={by + 3.4} textAnchor="middle" className="num">
          {part.no}
        </text>
      </motion.g>
    </motion.g>
  );
}

export default function ExplodedEngine({ explode, hot, onHot, onPick, className }: Props) {
  return (
    <svg
      viewBox="-40 -120 860 790"
      className={cn('engine h-auto w-full', hot && 'has-hot', className)}
      aria-label="Exploded drawing of an inline-four engine. Select a part to request it."
    >
      {/* centre line, like a real drawing */}
      <line x1={400} y1={-110} x2={400} y2={660} className="centerline" />
      {ENGINE_PARTS.map((p) => (
        <Part key={p.id} part={p} explode={explode} hot={hot} onHot={onHot} onPick={onPick} />
      ))}
    </svg>
  );
}
