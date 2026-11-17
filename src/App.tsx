import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { GameEngine } from './game/gameEngine';
import { soundManager } from './audio/soundManager';
import { LoadingScreen } from './components/LoadingScreen';
import { HUD } from './components/HUD';
import { VirtualJoystick } from './components/VirtualJoystick';
import { UpgradeShop, UpgradeStats } from './components/UpgradeShop';
import { VictoryModal } from './components/VictoryModal';

interface FloatingPopup {
  id: number;
  text: string;
  x: number;
  y: number;
}

export const App: React.FC = () => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<'loading' | 'playing'>('loading');
  const [coins, setCoins] = useState(0);
  const [level, setLevel] = useState(1);
  const [carriedCount, setCarriedCount] = useState(0);
  const [maxCapacity, setMaxCapacity] = useState(4);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isVictoryOpen, setIsVictoryOpen] = useState(false);
  const [prestigeCount, setPrestigeCount] = useState(0);
  const hasTriggeredVictory = useRef(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(true);
  const [popups, setPopups] = useState<FloatingPopup[]>([]);

  const [stats, setStats] = useState<UpgradeStats>({
    speedLevel: 1,
    capacityLevel: 1,
    workersCount: 0,
    sweetnessLevel: 1,
    magnetLevel: 1,
  });

  // Track active keys for keyboard controls
  const keysDown = useRef<{ [key: string]: boolean }>({});
  const joystickVector = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (gameState !== 'playing' || !canvasContainerRef.current) return;

    // Initialize 3D Engine
    const engine = new GameEngine(canvasContainerRef.current, {
      onScoreGained: (amount, _worldX, _worldZ, label) => {
        setCoins(engine.coins);
        // Haptic feedback for mobile
        if ('vibrate' in navigator) {
          try { navigator.vibrate(12); } catch {}
        }
        // Spawn floating text
        const id = Date.now() + Math.random();
        setPopups((prev) => [
          ...prev,
          {
            id,
            text: label || `+$${amount}`,
            x: window.innerWidth / 2 + (Math.random() - 0.5) * 120,
            y: window.innerHeight / 2 - 80 + (Math.random() - 0.5) * 40,
          },
        ]);
        setTimeout(() => {
          setPopups((prev) => prev.filter((p) => p.id !== id));
        }, 1200);
      },
      onStackChanged: (current, max) => {
        setCarriedCount(current);
        setMaxCapacity(max);
        if ('vibrate' in navigator) {
          try { navigator.vibrate(8); } catch {}
        }
      },
      onOpenUpgradeShop: () => {
        setIsShopOpen(true);
      },
      onLevelUp: (lvl) => {
        setLevel(lvl);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      },
    });

    engineRef.current = engine;

    // Keyboard controls
    const updateInputFromKeys = () => {
      let x = 0;
      let y = 0;
      if (keysDown.current['KeyW'] || keysDown.current['ArrowUp']) y -= 1;
      if (keysDown.current['KeyS'] || keysDown.current['ArrowDown']) y += 1;
      if (keysDown.current['KeyA'] || keysDown.current['ArrowLeft']) x -= 1;
      if (keysDown.current['KeyD'] || keysDown.current['ArrowRight']) x += 1;

      // If joystick is active, joystick takes priority
      if (Math.hypot(joystickVector.current.x, joystickVector.current.y) > 0.05) {
        engine.setInput(joystickVector.current.x, joystickVector.current.y);
      } else {
        const len = Math.hypot(x, y);
        if (len > 0) {
          engine.setInput(x / len, y / len);
        } else {
          engine.setInput(0, 0);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      keysDown.current[e.code] = true;
      updateInputFromKeys();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.current[e.code] = false;
      updateInputFromKeys();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      engine.destroy();
      engineRef.current = null;
    };
  }, [gameState]);

  // Check if player has maxed all upgrades for current tier
  const isMaxedOut =
    stats.speedLevel >= (10 + prestigeCount * 5) &&
    stats.capacityLevel >= (12 + prestigeCount * 6) &&
    stats.workersCount >= (6 + prestigeCount * 4) &&
    stats.sweetnessLevel >= (8 + prestigeCount * 4) &&
    stats.magnetLevel >= (6 + prestigeCount * 3);

  // Auto trigger victory modal when maxed out
  useEffect(() => {
    if (isMaxedOut && !hasTriggeredVictory.current) {
      hasTriggeredVictory.current = true;
      setIsVictoryOpen(true);
      soundManager.playUpgrade();
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
      });
    }
  }, [isMaxedOut]);

  const handlePrestige = () => {
    if (engineRef.current) {
      engineRef.current.applyPrestige();
      setCoins(engineRef.current.coins);
    }
    setPrestigeCount((prev) => prev + 1);
    hasTriggeredVictory.current = false; // Reset so they can achieve next era victory
    setIsVictoryOpen(false);

    // Notification popup
    const id = Date.now() + Math.random();
    setPopups((prev) => [
      ...prev,
      {
        id,
        text: '👑 ¡ERA DORADA DESBLOQUEADA! +250🪙',
        x: window.innerWidth / 2,
        y: window.innerHeight / 2 - 60,
      },
    ]);
  };

  const handleJoystickMove = (x: number, y: number) => {
    joystickVector.current = { x, y };
    if (engineRef.current) {
      if (Math.hypot(x, y) > 0.05) {
        engineRef.current.setInput(x, y);
      } else {
        // Fallback to keyboard keys if pressed
        let kx = 0;
        let ky = 0;
        if (keysDown.current['KeyW'] || keysDown.current['ArrowUp']) ky -= 1;
        if (keysDown.current['KeyS'] || keysDown.current['ArrowDown']) ky += 1;
        if (keysDown.current['KeyA'] || keysDown.current['ArrowLeft']) kx -= 1;
        if (keysDown.current['KeyD'] || keysDown.current['ArrowRight']) kx += 1;
        const len = Math.hypot(kx, ky);
        engineRef.current.setInput(len > 0 ? kx / len : 0, len > 0 ? ky / len : 0);
      }
    }
  };

  const handleUpgrade = (type: keyof UpgradeStats, cost: number) => {
    if (!engineRef.current || coins < cost) return;

    // Deduct coins
    engineRef.current.coins -= cost;
    setCoins(engineRef.current.coins);

    soundManager.playUpgrade();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.5 },
    });

    setStats((prev) => {
      const nextLevel = prev[type] + 1;
      const updated = { ...prev, [type]: nextLevel };

      // Apply to 3D Engine
      if (type === 'speedLevel' && engineRef.current) {
        engineRef.current.playerAnt.speed = 7.2 + nextLevel * 0.9;
      }
      if (type === 'capacityLevel' && engineRef.current) {
        engineRef.current.playerAnt.capacity = 4 + (nextLevel - 1) * 2;
        setMaxCapacity(engineRef.current.playerAnt.capacity);
      }
      if (type === 'workersCount' && engineRef.current) {
        engineRef.current.addWorkerAnt();
      }
      if (type === 'sweetnessLevel' && engineRef.current) {
        engineRef.current.sweetnessMultiplier = 1 + (nextLevel - 1) * 0.5;
      }
      if (type === 'magnetLevel' && engineRef.current) {
        engineRef.current.magnetRadius = 2.0 + (nextLevel - 1) * 0.6;
      }

      return updated;
    });
  };

  const toggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const toggleMusic = () => {
    const musicOn = soundManager.toggleMusic();
    setIsMusicOn(musicOn);
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-[#1a162b] select-none touch-none">
      {gameState === 'loading' ? (
        <LoadingScreen onStartGame={() => setGameState('playing')} />
      ) : (
        <>
          {/* 3D WebGL Canvas (Ground Layer) */}
          <div ref={canvasContainerRef} className="absolute inset-0 w-full h-full pointer-events-none" />

          {/* Full Screen Dynamic Touch / Virtual Joystick Layer */}
          <VirtualJoystick onMove={handleJoystickMove} />

          {/* HUD Overlay */}
          <HUD
            coins={coins}
            level={level}
            carriedCount={carriedCount}
            maxCapacity={maxCapacity}
            workersCount={stats.workersCount}
            isMuted={isMuted}
            isMusicOn={isMusicOn}
            isMaxedOut={isMaxedOut}
            prestigeCount={prestigeCount}
            onToggleMute={toggleMute}
            onToggleMusic={toggleMusic}
            onOpenShop={() => setIsShopOpen(true)}
            onOpenVictory={() => setIsVictoryOpen(true)}
          />

          {/* Floating Points Popups */}
          {popups.map((p) => (
            <div
              key={p.id}
              className="absolute pointer-events-none text-2xl font-black text-amber-300 font-['Luckiest_Guy'] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-out fade-out slide-out-to-top-8 duration-1000 z-40"
              style={{ left: `${p.x}px`, top: `${p.y}px` }}
            >
              {p.text}
            </div>
          ))}

          {/* Upgrade Shop Modal */}
          <UpgradeShop
            isOpen={isShopOpen}
            onClose={() => {
              if (engineRef.current) {
                engineRef.current.upgradePadCooldown = 3.5;
              }
              setIsShopOpen(false);
            }}
            coins={coins}
            stats={stats}
            prestigeCount={prestigeCount}
            onUpgrade={handleUpgrade}
          />

          {/* Victory & Ascension Modal */}
          <VictoryModal
            isOpen={isVictoryOpen}
            onClose={() => setIsVictoryOpen(false)}
            coins={coins}
            level={level}
            prestigeCount={prestigeCount}
            onPrestige={handlePrestige}
          />
        </>
      )}
    </div>
  );
};

export default App;
