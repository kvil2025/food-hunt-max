import React from 'react';
import { Volume2, VolumeX, Music, ShoppingBag, Sparkles } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface HUDProps {
  coins: number;
  level: number;
  carriedCount: number;
  maxCapacity: number;
  workersCount: number;
  isMuted: boolean;
  isMusicOn: boolean;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onOpenShop: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  coins,
  level,
  carriedCount,
  maxCapacity,
  workersCount,
  isMuted,
  isMusicOn,
  onToggleMute,
  onToggleMusic,
  onOpenShop,
}) => {
  const isFull = carriedCount >= maxCapacity;
  const capacityPercent = Math.min((carriedCount / maxCapacity) * 100, 100);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-20">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 w-full max-w-4xl mx-auto">
        {/* Left: 3D Game Mini Logo & Level */}
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border-2 border-white/20 shadow-xl pointer-events-auto">
            <span className="text-xl">🐜</span>
            <div className="flex flex-col -space-y-1">
              <span className="text-base font-black food-title-food leading-none">
                FOOD
              </span>
              <span className="text-base font-black food-title-hunt leading-none">
                HUNT <span className="text-xs text-rose-400 font-extrabold">MAX</span>
              </span>
            </div>
            <div className="ml-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs">
              NVL {level}
            </div>
          </div>

          {/* Helpers indicator */}
          {workersCount > 0 && (
            <div className="px-3 py-1 rounded-xl bg-blue-900/80 border border-blue-400/30 text-blue-200 text-xs font-bold flex items-center gap-1.5 pointer-events-auto">
              <span>🐜</span>
              <span>{workersCount} Obrera{workersCount > 1 ? 's' : ''} activa{workersCount > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Center / Right: Coins & Backpack Capacity */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Coins Badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border-2 border-amber-400 shadow-xl">
            <span className="text-2xl animate-bounce" style={{ animationDuration: '2s' }}>🪙</span>
            <span className="text-xl font-black text-amber-300 font-['Fredoka']">
              {coins}
            </span>
          </div>

          {/* Backpack Stack Capacity Bar */}
          <div className="flex flex-col items-center px-3.5 py-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border-2 border-cyan-400 shadow-xl min-w-[110px]">
            <div className="flex items-center justify-between w-full text-xs font-black text-cyan-200 mb-1">
              <span>📦 MOCHILA</span>
              <span className={isFull ? 'text-rose-400 animate-pulse font-black' : 'text-white'}>
                {carriedCount}/{maxCapacity}
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-black/60 overflow-hidden border border-white/20 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  isFull
                    ? 'bg-rose-500 animate-pulse'
                    : 'bg-gradient-to-r from-cyan-400 to-emerald-400'
                }`}
                style={{ width: `${capacityPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Controls: Shop & Audio */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Shop Button */}
          <button
            onClick={() => {
              soundManager.playPop();
              onOpenShop();
            }}
            className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-[0_4px_0_#b45309] hover:brightness-110 active:translate-y-1 active:shadow-none transition-all flex items-center gap-1.5 font-black text-xs uppercase"
            title="Tienda de Mejoras"
          >
            <ShoppingBag className="w-5 h-5 fill-slate-950" />
            <span className="hidden sm:inline">MEJORAS</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 active:scale-95 transition-all"
            title={isMuted ? 'Activar Sonidos' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>

          {/* Music Toggle */}
          <button
            onClick={onToggleMusic}
            className="p-2.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 active:scale-95 transition-all"
            title={isMusicOn ? 'Apagar Música' : 'Encender Música'}
          >
            <Music className={`w-5 h-5 ${isMusicOn ? 'text-amber-400' : 'text-slate-500'}`} />
          </button>
        </div>
      </div>

      {/* Center Prompt when Stack is Full */}
      {isFull && (
        <div className="mx-auto px-6 py-2 rounded-full bg-rose-600/95 border-2 border-white shadow-2xl text-white font-black text-sm uppercase tracking-wider animate-bounce flex items-center gap-2">
          <span>⚠️</span>
          <span>¡MOCHILA LLENA! LLÉVALA AL AGUJERO 🕳️</span>
        </div>
      )}

      {/* Bottom Center Hint */}
      <div className="mx-auto px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-xs font-bold text-white/80 border border-white/10 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-300" />
        <span>Recoge cubos de colores y tíralos al agujero oscuro para ganar monedas</span>
      </div>
    </div>
  );
};
