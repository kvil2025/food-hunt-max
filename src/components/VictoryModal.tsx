import React from 'react';
import { Crown, Sparkles, Trophy, ArrowRight, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../audio/soundManager';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  level: number;
  prestigeCount: number;
  onPrestige: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  onClose,
  coins,
  level,
  prestigeCount,
  onPrestige,
}) => {
  if (!isOpen) return null;

  const handleAscension = () => {
    soundManager.playUpgrade();
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
    });
    onPrestige();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-slate-900 via-amber-950/40 to-slate-900 border-4 border-amber-400 shadow-[0_0_50px_rgba(251,191,36,0.3)] overflow-hidden flex flex-col p-5 sm:p-6 text-white text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 transition-all text-slate-300"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Crown & Trophy Icon */}
        <div className="mx-auto relative my-2">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 p-1 shadow-2xl flex items-center justify-center animate-bounce" style={{ animationDuration: '2s' }}>
            <Crown className="w-11 h-11 text-slate-950 fill-slate-950" />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-rose-500 border-2 border-white shadow-md">
            <Trophy className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-amber-300 font-['Luckiest_Guy'] tracking-wide mt-2">
          ¡COLONIA SUPREMA! 👑
        </h2>
        <p className="text-xs sm:text-sm text-amber-200/90 font-semibold mt-1">
          ¡Has alcanzado el límite máximo de evolución de tu colonia de hormigas!
        </p>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-2 my-4 p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
          <div className="flex flex-col items-center">
            <span className="text-xl">🪙</span>
            <span className="text-base font-black text-amber-300">{coins}</span>
            <span className="text-[10px] text-slate-300 uppercase font-bold">Monedas</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl">⭐</span>
            <span className="text-base font-black text-cyan-300">Nvl {level}</span>
            <span className="text-[10px] text-slate-300 uppercase font-bold">Rango</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl">🐜</span>
            <span className="text-base font-black text-emerald-300">6/6</span>
            <span className="text-[10px] text-slate-300 uppercase font-bold">Ejército</span>
          </div>
        </div>

        {/* Prestige Reward Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border-2 border-amber-400/50 mb-4 text-left space-y-1.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="font-black text-sm text-white">
              NUEVA ERA: ASCENSIÓN REAL {prestigeCount > 0 ? `(Era ${prestigeCount + 1})` : ''}
            </span>
          </div>
          <ul className="text-xs text-slate-200 space-y-1 pl-7 list-disc">
            <li><strong className="text-amber-300">Skin Hormiga Dorada + Corona 3D</strong> en tu personaje.</li>
            <li><strong className="text-amber-300">Límites Duplicados:</strong> Capacidad hasta 30+ cubos y 12 obreras.</li>
            <li><strong className="text-amber-300">Multiplicador x2</strong> permanente en todos los cubos.</li>
            <li>Bono real de <strong className="text-amber-300">+250 monedas</strong> de bienvenida.</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleAscension}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider shadow-[0_6px_0_#b45309] hover:brightness-110 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>👑 ACTIVAR ASCENSIÓN REAL</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-98 transition-all text-xs font-bold text-slate-300 uppercase tracking-wider cursor-pointer"
          >
            Seguir jugando libremente con mi ejército
          </button>
        </div>
      </div>
    </div>
  );
};
