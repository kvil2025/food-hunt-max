import React, { useRef, useState, useEffect } from 'react';

interface VirtualJoystickProps {
  onMove: (x: number, y: number) => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchPos, setTouchPos] = useState<{ x: number; y: number } | null>(null);
  const [stickOffset, setStickOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const maxRadius = 50;

  const handleStart = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setTouchPos({ x: centerX, y: centerY });
    updateStick(clientX, clientY, centerX, centerY);
  };

  const updateStick = (clientX: number, clientY: number, centerX: number, centerY: number) => {
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);

    let normX = dx;
    let normY = dy;
    if (distance > maxRadius) {
      normX = (dx / distance) * maxRadius;
      normY = (dy / distance) * maxRadius;
    }

    setStickOffset({ x: normX, y: normY });
    // Normalize to -1..1 range
    onMove(normX / maxRadius, normY / maxRadius);
  };

  const handleEnd = () => {
    setStickOffset({ x: 0, y: 0 });
    onMove(0, 0);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-36 h-36 rounded-full bg-black/35 backdrop-blur-md border-4 border-white/20 shadow-2xl flex items-center justify-center touch-none select-none pointer-events-auto"
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        handleStart(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (e.buttons > 0 && containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          updateStick(e.clientX, e.clientY, rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
      }}
      onPointerUp={handleEnd}
      onPointerCancel={handleEnd}
    >
      {/* Outer directional arrows */}
      <div className="absolute inset-2 rounded-full border border-dashed border-white/20 pointer-events-none" />

      {/* Floating Stick Thumb */}
      <div
        className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-white shadow-xl flex items-center justify-center transform transition-transform pointer-events-none"
        style={{
          transform: `translate(${stickOffset.x}px, ${stickOffset.y}px)`,
        }}
      >
        <span className="text-xl">🐜</span>
      </div>
    </div>
  );
};
