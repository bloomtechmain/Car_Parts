import { useEffect, useRef } from 'react';
import { Player } from '@remotion/player';
import type { PlayerRef } from '@remotion/player';
import CinematicScene, { TOTAL } from './CinematicScene';

const FPS = 60;

export default function HeroAnimationPanel() {
  const playerRef = useRef<PlayerRef>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      playerRef.current?.play();
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="flex flex-col gap-3 items-center justify-center h-full">
      <div className="w-full rounded-2xl overflow-hidden border border-gold/25 shadow-[0_0_60px_rgba(245,158,11,0.15)] bg-[#04060e]">
        <Player
          ref={playerRef}
          component={CinematicScene}
          durationInFrames={TOTAL}
          fps={FPS}
          compositionWidth={900}
          compositionHeight={380}
          style={{ width: '100%', aspectRatio: '900/380' }}
          loop
          autoPlay
          controls={false}
          showVolumeControls={false}
          clickToPlay={false}
          acknowledgeRemotionLicense
        />
        <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-xs text-slate-400 font-medium tracking-wide">Inline-6 · Engine Simulation</span>
          </div>
          <span className="text-xs text-slate-600 font-mono">60 FPS</span>
        </div>
      </div>
    </div>
  );
}
