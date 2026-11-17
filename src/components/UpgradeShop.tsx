import React from 'react';
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
  if (!isOpen) return null;

  const upgrades = [
    {
      key: 'speedLevel' as const,
      name: 'Super Velocidad',
      desc: 'Corre más rápido por el suelo de madera',
      level: stats.speedLevel,
      maxLevel: 10,
      cost: Math.round(30 * Math.pow(1.5, stats.speedLevel - 1)),
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30',
      btnColor: 'bg-gradient-to-b from-amber-400 to-amber-600',
    },
    {
      key: 'capacityLevel' as const,
      name: 'Mochila Gigante',
      desc: 'Apila más cubos en tu espalda (+2 cubos)',
      level: stats.capacityLevel,
      maxLevel: 12,
      cost: Math.round(45 * Math.pow(1.6, stats.capacityLevel - 1)),
      icon: <Package className="w-6 h-6 text-cyan-400" />,
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30',
      btnColor: 'bg-gradient-to-b from-cyan-400 to-blue-600',
    },
    {
      key: 'workersCount' as const,
      name: 'Hormiga Obrera',
      desc: 'Invoca una hormiguita azul bot que recolecta sola',
      level: stats.workersCount,
      maxLevel: 6,
      cost: Math.round(100 * Math.pow(2.0, stats.workersCount)),
      icon: <Users className="w-6 h-6 text-emerald-400" />,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
      btnColor: 'bg-gradient-to-b from-emerald-400 to-teal-600',
    },
    {
      key: 'sweetnessLevel' as const,
      name: 'Dulzura de Azúcar',
      desc: 'Multiplica el valor en monedas de cada cubo entregado',
      level: stats.sweetnessLevel,
      maxLevel: 8,
      cost: Math.round(60 * Math.pow(1.8, stats.sweetnessLevel - 1)),
      icon: <Sparkles className="w-6 h-6 text-pink-400" />,
      color: 'from-pink-500/20 to-rose-500/10 border-pink-500/30',
      btnColor: 'bg-gradient-to-b from-pink-400 to-rose-600',
    },
    {
      key: 'magnetLevel' as const,
      name: 'Imán de Alimentos',
      desc: 'Atrae y recolecta cubos desde más lejos',
      level: stats.magnetLevel,
      maxLevel: 6,
      cost: Math.round(50 * Math.pow(1.7, stats.magnetLevel - 1)),
      icon: <Magnet className="w-6 h-6 text-purple-400" />,
      color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30',
      btnColor: 'bg-gradient-to-b from-purple-400 to-indigo-600',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900/95 border-4 border-amber-400 shadow-2xl overflow-hidden p-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🛠️</span>
            <div>
              <h2 className="text-2xl font-black text-amber-300 font-['Luckiest_Guy'] tracking-wide">
                TIENDA DE MEJORAS
              </h2>
              <p className="text-xs text-slate-300 font-semibold">
                ¡Haz crecer tu colonia de hormigas!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playPop();
              onClose();
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-slate-300 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Coins Pill */}
        <div className="my-4 flex items-center justify-center">
          <div className="px-5 py-2 rounded-full bg-amber-500/20 border-2 border-amber-400/50 flex items-center gap-2">
            <span className="text-xl">🪙</span>
            <span className="text-xl font-black text-amber-300">{coins}</span>
            <span className="text-xs text-amber-200/80 uppercase font-bold tracking-wider">Monedas</span>
          </div>
        </div>

        {/* Upgrades List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {upgrades.map((item) => {
            const isMax = item.level >= item.maxLevel;
            const canAfford = coins >= item.cost && !isMax;

            return (
              <div
                key={item.key}
                className={`p-3.5 rounded-2xl border bg-gradient-to-r ${item.color} flex items-center justify-between gap-3 transition-all`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-base">
                        {item.name}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/15 text-amber-200">
                        Nvl. {item.level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300/90 leading-snug">
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
                  className={`px-4 py-2 rounded-xl font-black text-sm uppercase tracking-wider text-white shadow-md transition-all ${
                    isMax
                      ? 'bg-slate-700 opacity-60 cursor-not-allowed'
                      : canAfford
                      ? `${item.btnColor} active:scale-95 hover:brightness-110 cursor-pointer`
                      : 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  {isMax ? (
                    'MÁXIMO'
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span>🪙</span>
                      <span>{item.cost}</span>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-5 text-center">
          <button
            onClick={() => {
              soundManager.playPop();
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-base uppercase tracking-wider shadow-lg hover:brightness-105 active:scale-98 transition-all"
          >
            ¡SEGUIR RECOLECTANDO! 🐜🍬
          </button>
        </div>
      </div>
    </div>
  );
};
