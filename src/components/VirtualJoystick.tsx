import React, { useRef, useState, useEffect } from 'react';

interface VirtualJoystickProps {
  onMove: (x: number, y: number) => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove }) => {
  const [active, setActive] = useState(false);
  const [basePos, setBasePos] = useState<{ x: number; y: number }>({ x: 90, y: 0 });
  const [stickOffset, setStickOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const activeTouchId = useRef<number | null>(null);
  const centerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const maxRadius = 55;

  // Handle Touch Start
  const handleTouchStart = (e: React.TouchEvent) => {
    // Prevent default to disable iOS zoom/scroll
    if (e.cancelable) e.preventDefault();

    const touch = e.changedTouches[0];
    if (!touch) return;

    activeTouchId.current = touch.identifier;
    isDragging.current = true;
    setActive(true);

    const clientX = touch.clientX;
    const clientY = touch.clientY;

    centerRef.current = { x: clientX, y: clientY };
    setBasePos({ x: clientX, y: clientY });
    setStickOffset({ x: 0, y: 0 });
    onMove(0, 0);
  };

  // Handle Touch Move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    if (!isDragging.current) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchId.current) {
        const dx = touch.clientX - centerRef.current.x;
        const dy = touch.clientY - centerRef.current.y;
        const dist = Math.hypot(dx, dy);

        let normX = dx;
        let normY = dy;
        if (dist > maxRadius) {
          normX = (dx / dist) * maxRadius;
          normY = (dy / dist) * maxRadius;
        }

        setStickOffset({ x: normX, y: normY });
        // Normalize vector to -1 .. 1
        onMove(normX / maxRadius, normY / maxRadius);
        break;
      }
    }
  };

  // Handle Touch End / Cancel
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchId.current) {
        isDragging.current = false;
        activeTouchId.current = null;
        setActive(false);
        setStickOffset({ x: 0, y: 0 });
        onMove(0, 0);
        break;
      }
    }
  };

  // Mouse fallback for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    setActive(true);
    const clientX = e.clientX;
    const clientY = e.clientY;
    centerRef.current = { x: clientX, y: clientY };
    setBasePos({ x: clientX, y: clientY });
    setStickOffset({ x: 0, y: 0 });
    onMove(0, 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - centerRef.current.x;
    const dy = e.clientY - centerRef.current.y;
    const dist = Math.hypot(dx, dy);

    let normX = dx;
    let normY = dy;
    if (dist > maxRadius) {
      normX = (dx / dist) * maxRadius;
      normY = (dy / dist) * maxRadius;
    }

    setStickOffset({ x: normX, y: normY });
    onMove(normX / maxRadius, normY / maxRadius);
  };

  const handleMouseUp = () => {
    if (isDragging.current) {
      isDragging.current = false;
      setActive(false);
      setStickOffset({ x: 0, y: 0 });
      onMove(0, 0);
    }
  };

  return (
    <>
      {/* Full-screen invisible touch surface for mobile gestures */}
      <div
        className="absolute inset-0 z-10 touch-none select-none"
        style={{ touchAction: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Floating Joystick Visual (Follows player's thumb dynamically anywhere on screen!) */}
      {active ? (
        <div
          className="fixed pointer-events-none z-20 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-150"
          style={{
            left: `${basePos.x}px`,
            top: `${basePos.y}px`,
            width: `${maxRadius * 2 + 30}px`,
            height: `${maxRadius * 2 + 30}px`,
          }}
        >
          {/* Outer glowing ring */}
          <div className="absolute inset-0 rounded-full bg-black/40 backdrop-blur-sm border-2 border-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.3)] animate-pulse" />

          {/* Inner limit dashed ring */}
          <div className="absolute inset-3 rounded-full border border-dashed border-white/30" />

          {/* Floating Thumb Stick */}
          <div
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 border-2 border-white shadow-2xl flex items-center justify-center transition-transform"
            style={{
              transform: `translate(${stickOffset.x}px, ${stickOffset.y}px)`,
            }}
          >
            <span className="text-2xl drop-shadow">🐜</span>
          </div>
        </div>
      ) : (
        /* Static guide indicator at bottom left when thumb is lifted so users know where to touch */
        <div className="fixed bottom-10 left-8 pointer-events-none z-20 flex flex-col items-center gap-1.5 opacity-60">
          <div className="w-24 h-24 rounded-full bg-black/30 backdrop-blur-xs border-2 border-dashed border-amber-300/40 flex items-center justify-center animate-pulse">
            <div className="w-12 h-12 rounded-full bg-amber-400/40 border border-white/40 flex items-center justify-center">
              <span className="text-xl">🕹️</span>
            </div>
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-200/80 drop-shadow">
            Toca o arrastra para mover
          </span>
        </div>
      )}
    </>
  );
};
