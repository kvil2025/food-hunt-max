import React from 'react';
import { Volume2, VolumeX, Music, ShoppingBag, Sparkles, Crown } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface HUDProps {
  coins: number;
  level: number;
  carriedCount: number;
  maxCapacity: number;
  workersCount: number;
  isMuted: boolean;
  isMusicOn: boolean;
  isMaxedOut: boolean;
  prestigeCount: number;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onOpenShop: () => void;
  onOpenVictory: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  coins,
  level,
  carriedCount,
  maxCapacity,
  workersCount,
  isMuted,
  isMusicOn,
  isMaxedOut,
  prestigeCount,
  onToggleMute,
  onToggleMusic,
  onOpenShop,
  onOpenVictory,
}) => {
  const isFull = carriedCount >= maxCapacity;
  const capacityPercent = Math.min((carriedCount / maxCapacity) * 100, 100);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2.5 sm:p-4 z-20">
      {/* Top Header & Alert Area */}
      <div className="flex flex-col items-center w-full max-w-4xl mx-auto gap-2">
        <div className="flex items-center justify-between gap-1.5 sm:gap-3 w-full">
          {/* Left: 3D Mini Logo & Level */}
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-2xl border-2 border-white/20 shadow-xl pointer-events-auto">
              <span className="text-lg sm:text-xl">🐜</span>
              <div className="flex flex-col -space-y-1">
                <span className="text-xs sm:text-base font-black food-title-food leading-none">
                  FOOD
                </span>
                <span className="text-xs sm:text-base font-black food-title-hunt leading-none">
                  HUNT <span className="text-[10px] sm:text-xs text-rose-400 font-extrabold">MAX</span>
                </span>
              </div>
              <div className="ml-1 sm:ml-2 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[10px] sm:text-xs">
                NVL {level}
              </div>
            </div>

            {/* Helper count pill */}
            {workersCount > 0 && (
              <div className="px-2 py-0.5 rounded-xl bg-blue-900/80 border border-blue-400/30 text-blue-200 text-[10px] sm:text-xs font-bold flex items-center gap-1 pointer-events-auto">
                <span>🐜</span>
                <span>{workersCount} Obrera{workersCount > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Center: Coins & Backpack */}
          <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
            {/* Coins */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border-2 border-amber-400 shadow-xl">
              <span className="text-xl sm:text-2xl animate-bounce" style={{ animationDuration: '2s' }}>🪙</span>
              <span className="text-base sm:text-xl font-black text-amber-300 font-['Fredoka']">
                {coins}
              </span>
            </div>

            {/* Backpack Stack Bar */}
            <div className={`flex flex-col items-center px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border-2 shadow-xl min-w-[95px] sm:min-w-[115px] transition-colors ${
              isFull ? 'border-rose-500 shadow-rose-500/30' : 'border-cyan-400'
            }`}>
              <div className="flex items-center justify-between w-full text-[10px] sm:text-xs font-black text-cyan-200 mb-0.5">
                <span>📦 MOCHILA</span>
                <span className={isFull ? 'text-rose-400 animate-pulse font-black' : 'text-white'}>
                  {carriedCount}/{maxCapacity}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden border border-white/20 p-0.5">
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

          {/* Right Controls: Shop, Victory Crown & Sound */}
          <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto">
            {/* Victory / Prestige Button when maxed or ascended */}
            {(isMaxedOut || prestigeCount > 0) && (
              <button
                onClick={() => {
                  soundManager.playPop();
                  onOpenVictory();
                }}
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-xs uppercase shadow-[0_3px_0_#b45309] hover:brightness-110 active:translate-y-0.5 transition-all flex items-center gap-1 animate-pulse"
                title="Colonia Suprema / Ascensión"
              >
                <Crown className="w-4 h-4 fill-slate-950" />
                <span>{prestigeCount > 0 ? `ERA ${prestigeCount + 1}` : '👑 REINA'}</span>
              </button>
            )}

            <button
              onClick={() => {
                soundManager.playPop();
                onOpenShop();
              }}
              className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-[0_3px_0_#b45309] hover:brightness-110 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1 font-black text-[11px] sm:text-xs uppercase"
              title="Tienda de Mejoras"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950" />
              <span className="hidden md:inline">MEJORAS</span>
            </button>

            <button
              onClick={onToggleMute}
              className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 active:scale-95 transition-all"
              title={isMuted ? 'Activar Sonidos' : 'Silenciar'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />}
            </button>

            <button
              onClick={onToggleMusic}
              className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 active:scale-95 transition-all"
              title={isMusicOn ? 'Apagar Música' : 'Encender Música'}
            >
              <Music className={`w-4 h-4 sm:w-5 sm:h-5 ${isMusicOn ? 'text-amber-400' : 'text-slate-500'}`} />
            </button>
          </div>
        </div>

        {/* Top Floating Alert Banner (Cleanly placed at the very top under HUD, NEVER covers the ant in center!) */}
        {isFull && (
          <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-600 via-red-500 to-amber-600 border-2 border-white shadow-2xl text-white font-black text-xs sm:text-sm uppercase tracking-wider animate-bounce flex items-center gap-1.5 pointer-events-auto">
            <span className="text-sm">⚠️</span>
            <span>¡MOCHILA LLENA! ENTREGA EN EL AGUJERO</span>
            <span className="text-sm">🕳️</span>
          </div>
        )}
      </div>

      {/* Bottom Center Hint */}
      <div className="mx-auto mb-1 px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm text-[11px] font-bold text-white/80 border border-white/10 flex items-center gap-1.5 pointer-events-none">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>Recoge cubos y tíralos al agujero para ganar monedas</span>
      </div>
    </div>
  );
};
