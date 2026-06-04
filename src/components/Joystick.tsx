import React, { useRef, useEffect } from 'react';

interface JoystickProps {
  onMove: (x: number, y: number) => void;
  onActiveChange?: (active: boolean) => void;
  color?: string;
  label?: string;
}

export function Joystick({ onMove, onActiveChange, color = 'bg-cyan-500/20 w-[100px] h-[100px]', label }: JoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  
  const state = useRef({
    active: false,
    originX: 0,
    originY: 0,
    maxRadius: 50
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    
    state.current.active = true;
    onActiveChange?.(true);

    const rect = containerRef.current.getBoundingClientRect();
    state.current.originX = rect.left + rect.width / 2;
    state.current.originY = rect.top + rect.height / 2;
    
    updateKnob(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!state.current.active) return;
    updateKnob(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    state.current.active = false;
    onActiveChange?.(false);
    
    if (knobRef.current) {
        knobRef.current.style.transform = `translate(0px, 0px)`;
    }
    onMove(0, 0);
  };

  const updateKnob = (clientX: number, clientY: number) => {
    const dx = clientX - state.current.originX;
    const dy = clientY - state.current.originY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    let moveX = dx;
    let moveY = dy;
    let rDist = dist;

    if (dist > state.current.maxRadius) {
      moveX = (dx / dist) * state.current.maxRadius;
      moveY = (dy / dist) * state.current.maxRadius;
      rDist = state.current.maxRadius;
    }

    if (knobRef.current) {
      knobRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }

    // Normalize output to -1.0 to 1.0
    if (rDist > 5) {
       onMove(dx / dist, dy / dist); // full speed in direction
    } else {
       onMove(0,0);
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-center opacity-70 hover:opacity-100 transition-opacity touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div 
        ref={containerRef}
        className={`rounded-full relative flex items-center justify-center border border-white/10 ${color}`}
        style={{ width: state.current.maxRadius * 2, height: state.current.maxRadius * 2 }}
      >
        <div 
           ref={knobRef}
           className="w-12 h-12 bg-white/50 backdrop-blur-sm rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-transform duration-75"
        />
      </div>
      {label && <div className="mt-2 text-xs font-mono text-gray-500 uppercase tracking-widest">{label}</div>}
    </div>
  );
}
