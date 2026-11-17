import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface LoadingScreenProps {
  onStartGame: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onStartGame }) => {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsReady(true);
          return 100;
        }
        return prev + 5;
      });
    }, 40);

    return () => clearInterval(timer);
  }, []);

  const handlePlay = () => {
    soundManager.init();
    soundManager.playUpgrade();
    onStartGame();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-[#6b4fa8] via-[#513b82] to-[#2c1e4a] text-white select-none overflow-hidden">
      {/* Background Stylized Toy Blocks Illustration */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        {/* Colorful background cube stacks matching the screenshot */}
        <div className="absolute -left-6 top-1/4 w-28 h-28 bg-blue-500 rounded-2xl shadow-xl transform -rotate-6" />
        <div className="absolute -left-4 top-1/3 w-24 h-24 bg-pink-500 rounded-2xl shadow-xl transform rotate-12" />
        <div className="absolute -right-8 top-1/5 w-32 h-32 bg-amber-400 rounded-3xl shadow-xl transform rotate-6" />
        <div className="absolute -right-4 top-1/3 w-28 h-28 bg-emerald-500 rounded-3xl shadow-xl transform -rotate-12" />
        <div className="absolute -right-6 top-1/2 w-32 h-32 bg-purple-600 rounded-3xl shadow-xl" />
      </div>

      {/* Top Banner (Modo Juego Activado) */}
      <div className="w-full max-w-sm mt-4 px-4 py-2.5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="p-2 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 text-white shadow-md">
          <span className="text-xl">🚀</span>
        </div>
        <div className="flex-1 text-left">
          <p className="text-xs font-black tracking-wide text-white uppercase">
            Modo Juego: activado
          </p>
          <p className="text-[11px] text-white/70 leading-tight">
            Activa la sobreposición de juego en el centro de control.
          </p>
        </div>
      </div>

      {/* Center Hero: 3D Logo & Ants Illustration */}
      <div className="my-auto flex flex-col items-center justify-center text-center relative z-10">
        {/* The 3D Bubbly Logo */}
        <div className="flex flex-col items-center -space-y-3 transform hover:scale-105 transition-transform duration-300">
          <span className="text-6xl sm:text-7xl font-black food-title-food tracking-wider">
            FOOD
          </span>
          <span className="text-6xl sm:text-7xl font-black food-title-hunt tracking-wider">
            HUNT
          </span>
          <div className="mt-1 px-4 py-1 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 border-2 border-white/80 shadow-lg transform -rotate-3">
            <span className="text-xl font-black tracking-widest text-white drop-shadow">
              MAX 🐜🍬
            </span>
          </div>
        </div>

        {/* Playful Vector / Animated Preview of the 2 Ants */}
        <div className="relative w-72 h-48 my-4 flex items-center justify-center">
          {/* Wooden floor circle */}
          <div className="absolute bottom-2 w-64 h-14 bg-[#a06d3b] rounded-full border-4 border-[#784f23] shadow-2xl opacity-90" />
          
          {/* Nest Hole */}
          <div className="absolute bottom-4 left-1/3 w-20 h-8 bg-[#18112b] rounded-full border-2 border-[#573516] shadow-inner" />

          {/* Yellow Ant carrying blue block */}
          <div className="absolute left-6 bottom-8 flex flex-col items-center animate-bounce" style={{ animationDuration: '1.4s' }}>
            {/* Blue Cube on back */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-400 border-2 border-white shadow-lg mb-1 flex items-center justify-center font-bold text-white text-xs">
              🍬
            </div>
            {/* Yellow Ant Head & Eyes */}
            <div className="w-14 h-14 rounded-full bg-amber-400 border-2 border-amber-600 shadow-md flex items-center justify-center relative">
              {/* Antennae */}
              <div className="absolute -top-3 -left-1 text-base">🌱</div>
              <div className="absolute -top-3 -right-1 text-base transform -scale-x-100">🌱</div>
              {/* Cute Eyes */}
              <div className="flex gap-1.5">
                <div className="w-3.5 h-4.5 bg-white rounded-full flex items-center justify-center border border-black/20">
                  <div className="w-2.5 h-3 bg-black rounded-full" />
                </div>
                <div className="w-3.5 h-4.5 bg-white rounded-full flex items-center justify-center border border-black/20">
                  <div className="w-2.5 h-3 bg-black rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Blue Ant pushing green block into hole */}
          <div className="absolute right-6 bottom-6 flex items-end animate-pulse" style={{ animationDuration: '1.8s' }}>
            {/* Green Cube being pushed */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-lime-400 to-emerald-500 border-2 border-white shadow-lg mr-1 transform rotate-6 flex items-center justify-center text-xs">
              🟢
            </div>
            {/* Blue Ant */}
            <div className="w-14 h-14 rounded-full bg-sky-400 border-2 border-sky-600 shadow-md flex items-center justify-center relative">
              <div className="absolute -top-3 -left-1 text-base">🌱</div>
              <div className="flex gap-1.5">
                <div className="w-3.5 h-4.5 bg-white rounded-full flex items-center justify-center border border-black/20">
                  <div className="w-2.5 h-3 bg-black rounded-full" />
                </div>
                <div className="w-3.5 h-4.5 bg-white rounded-full flex items-center justify-center border border-black/20">
                  <div className="w-2.5 h-3 bg-black rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm font-bold text-amber-200/90 tracking-wide">
          ¡Ayuda a las hormigas a recolectar azúcar y comida para la colonia!
        </p>
      </div>

      {/* Bottom Loading Progress or Play Button */}
      <div className="w-full max-w-sm mb-6 flex flex-col items-center gap-3 relative z-10">
        {!isReady ? (
          <div className="w-full flex flex-col items-center gap-2">
            <span className="text-sm font-black tracking-widest text-white/90 uppercase font-['Luckiest_Guy']">
              LOADING... {progress}%
            </span>
            <div className="w-full h-4 rounded-full bg-slate-900/80 border-2 border-purple-400/40 p-0.5 overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-yellow-400 shadow-lg transition-all duration-100 flex justify-end"
                style={{ width: `${progress}%` }}
              >
                <div className="w-3 h-full rounded-full bg-white shadow-[0_0_10px_#ffffff]" />
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={handlePlay}
            className="w-full py-4 rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xl uppercase tracking-wider shadow-[0_8px_0_#b45309] hover:brightness-110 active:translate-y-1 active:shadow-[0_4px_0_#b45309] transition-all flex items-center justify-center gap-3 cursor-pointer animate-bounce"
          >
            <Play className="w-7 h-7 fill-slate-950" />
            <span>¡JUGAR AHORA!</span>
          </button>
        )}

        <div className="flex items-center gap-4 text-xs font-semibold text-white/60">
          <span>⌨️ WASD o Flechas</span>
          <span>•</span>
          <span>🕹️ Joystick Táctil</span>
          <span>•</span>
          <span>🖱️ Mouse</span>
        </div>
      </div>
    </div>
  );
};
