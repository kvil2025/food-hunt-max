import React, { useEffect } from 'react';
import { Zap, Package, Users, Sparkles, Magnet, X } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

export interface UpgradeStats {
  speedLevel: number;
  capacityLevel: number;
  workersCount: number;
  sweetnessLevel: number;
  magnetLevel: number;
}

interface UpgradeShopProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  stats: UpgradeStats;
  onUpgrade: (type: keyof UpgradeStats, cost: number) => void;
}

export const UpgradeShop: React.FC<UpgradeShopProps> = ({
  isOpen,
  onClose,
  coins,
  stats,
  onUpgrade,
}) => {
  // Listen for Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const upgrades = [
    {
      key: 'speedLevel' as const,
      name: 'Super Velocidad',
      desc: 'Corre más rápido por el suelo',
      level: stats.speedLevel,
      maxLevel: 10,
      cost: Math.round(30 * Math.pow(1.5, stats.speedLevel - 1)),
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      color: 'from-amber-500/15 to-yellow-500/10 border-amber-500/30',
      btnColor: 'bg-gradient-to-b from-amber-400 to-amber-600',
    },
    {
      key: 'capacityLevel' as const,
      name: 'Mochila Gigante',
      desc: 'Apila más cubos en tu espalda (+2)',
      level: stats.capacityLevel,
      maxLevel: 12,
      cost: Math.round(45 * Math.pow(1.6, stats.capacityLevel - 1)),
      icon: <Package className="w-5 h-5 text-cyan-400" />,
      color: 'from-cyan-500/15 to-blue-500/10 border-cyan-500/30',
      btnColor: 'bg-gradient-to-b from-cyan-400 to-blue-600',
    },
    {
      key: 'workersCount' as const,
      name: 'Hormiga Obrera',
      desc: 'Hormiguita azul bot que recolecta sola',
      level: stats.workersCount,
      maxLevel: 6,
      cost: Math.round(100 * Math.pow(2.0, stats.workersCount)),
      icon: <Users className="w-5 h-5 text-emerald-400" />,
      color: 'from-emerald-500/15 to-teal-500/10 border-emerald-500/30',
      btnColor: 'bg-gradient-to-b from-emerald-400 to-teal-600',
    },
    {
      key: 'sweetnessLevel' as const,
      name: 'Dulzura de Azúcar',
      desc: 'Multiplica monedas por cada cubo',
      level: stats.sweetnessLevel,
      maxLevel: 8,
      cost: Math.round(60 * Math.pow(1.8, stats.sweetnessLevel - 1)),
      icon: <Sparkles className="w-5 h-5 text-pink-400" />,
      color: 'from-pink-500/15 to-rose-500/10 border-pink-500/30',
      btnColor: 'bg-gradient-to-b from-pink-400 to-rose-600',
    },
    {
      key: 'magnetLevel' as const,
      name: 'Imán de Alimentos',
      desc: 'Atrae cubos desde más lejos',
      level: stats.magnetLevel,
      maxLevel: 6,
      cost: Math.round(50 * Math.pow(1.7, stats.magnetLevel - 1)),
      icon: <Magnet className="w-5 h-5 text-purple-400" />,
      color: 'from-purple-500/15 to-indigo-500/10 border-purple-500/30',
      btnColor: 'bg-gradient-to-b from-purple-400 to-indigo-600',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        // Tapping the dark backdrop closes the modal
        if (e.target === e.currentTarget) {
          soundManager.playPop();
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-md max-h-[82dvh] rounded-3xl bg-slate-900 border-2 sm:border-4 border-amber-400 shadow-2xl overflow-hidden flex flex-col text-white animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-white/10 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛠️</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-amber-300 font-['Luckiest_Guy'] tracking-wide leading-tight">
                TIENDA DE MEJORAS
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm">🪙</span>
                <span className="text-sm font-black text-amber-300">{coins}</span>
                <span className="text-[10px] text-amber-200/80 font-bold uppercase tracking-wider">monedas disponibles</span>
              </div>
            </div>
          </div>

          {/* Big, easy to tap Close Button */}
          <button
            onClick={() => {
              soundManager.playPop();
              onClose();
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-400/50 hover:bg-rose-500/30 active:scale-90 transition-all text-rose-200 font-black text-xs cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>CERRAR</span>
          </button>
        </div>

        {/* Scrollable Upgrades List with touch-action pan-y */}
        <div
          className="modal-scroll flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 overscroll-contain"
          style={{
            touchAction: 'pan-y',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {upgrades.map((item) => {
            const isMax = item.level >= item.maxLevel;
            const canAfford = coins >= item.cost && !isMax;

            return (
              <div
                key={item.key}
                className={`p-2.5 sm:p-3 rounded-2xl border bg-gradient-to-r ${item.color} flex items-center justify-between gap-2.5 transition-all`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10 shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-white text-xs sm:text-sm truncate">
                        {item.name}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-white/15 text-amber-200 shrink-0">
                        Nvl. {item.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-tight truncate">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <button
                  disabled={!canAfford}
                  onClick={() => {
                    if (canAfford) {
                      onUpgrade(item.key, item.cost);
                    }
                  }}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl font-black text-xs uppercase tracking-wider text-white shadow-md transition-all shrink-0 ${
                    isMax
                      ? 'bg-slate-700 opacity-60 cursor-not-allowed'
                      : canAfford
                      ? `${item.btnColor} active:scale-95 hover:brightness-110 cursor-pointer`
                      : 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  {isMax ? (
                    'MÁX'
                  ) : (
                    <div className="flex items-center gap-1">
                      <span>🪙</span>
                      <span>{item.cost}</span>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Fixed Sticky Footer Button */}
        <div className="p-3 border-t border-white/10 bg-slate-900/95 shrink-0">
          <button
            onClick={() => {
              soundManager.playPop();
              onClose();
            }}
            className="w-full py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider shadow-lg hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>VOLVER AL JUEGO</span>
            <span>🐜🍬</span>
          </button>
        </div>
      </div>
    </div>
  );
};
