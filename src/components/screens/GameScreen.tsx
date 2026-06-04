import React, { useRef, useState, useEffect } from 'react';
import { useGameStore } from '../../lib/store';
import { useGameEngine } from '../../game/useGameEngine';
import { Joystick } from '../Joystick';

export function GameScreen() {
  const { score, wave, kills } = useGameStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Input References to avoid triggering renders on every frame
  const moveInput = useRef({ x: 0, y: 0 });
  const aimInput = useRef({ x: 0, y: 0 });
  const isShooting = useRef(false);

  useGameEngine(canvasRef, moveInput, aimInput, isShooting);

  // Keyboard mapping for desktop fallback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.key.toLowerCase()) {
        case 'w': moveInput.current.y = -1; break;
        case 's': moveInput.current.y = 1; break;
        case 'a': moveInput.current.x = -1; break;
        case 'd': moveInput.current.x = 1; break;
        case ' ': 
          isShooting.current = true; 
          break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch(e.key.toLowerCase()) {
        case 'w': if (moveInput.current.y < 0) moveInput.current.y = 0; break;
        case 's': if (moveInput.current.y > 0) moveInput.current.y = 0; break;
        case 'a': if (moveInput.current.x < 0) moveInput.current.x = 0; break;
        case 'd': if (moveInput.current.x > 0) moveInput.current.x = 0; break;
        case ' ': isShooting.current = false; break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-[radial-gradient(circle_at_center,_#1a1a2e_0%,_#05050b_100%)] overflow-hidden touch-none select-none">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#00f3ff 1px, transparent 1px), linear-gradient(90deg, #00f3ff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full block mix-blend-screen"
      />
      
      {/* HUD Overlay */}
      <div className="absolute top-0 left-0 w-full p-4 sm:p-10 flex justify-between items-start pointer-events-none z-10">
        <div className="p-4 bg-black/40 backdrop-blur-md border border-magenta-500/20 rounded-lg text-left">
          <div className="text-[10px] text-magenta-400 uppercase tracking-widest font-bold mb-1">Tactical Score</div>
          <div className="text-2xl sm:text-3xl font-black">{score.toString().padStart(6, '0')}</div>
          <div className="text-[10px] text-magenta-500/80 mt-1 font-mono">KILLS: {kills}</div>
        </div>
        
        <div className="p-4 bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-lg text-center">
           <div className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold mb-1">Current Wave</div>
           <div className="text-2xl sm:text-3xl font-black text-white">WAVE {wave}</div>
        </div>
      </div>

      {/* Mobile Controls Overlay */}
      <div className="absolute bottom-8 left-8 z-10 hidden sm:block">
         <div className="text-xs text-gray-500 font-mono mb-2">WASD to Move</div>
      </div>
      <div className="absolute bottom-8 right-8 z-10 hidden sm:block">
         <div className="text-xs text-gray-500 font-mono mb-2">SPACE to Shoot</div>
      </div>
      
      {/* Virtual Joysticks for Touch */}
      <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 z-20 pointer-events-auto">
        <Joystick 
          onMove={(x, y) => { moveInput.current = {x, y} }} 
          color="bg-cyan-500/10 border-cyan-500/30"
          label="MOVE"
        />
      </div>

      <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-20 pointer-events-auto">
        <Joystick 
          onMove={(x, y) => { aimInput.current = {x, y} }} 
          onActiveChange={(active) => { isShooting.current = active }}
          color="bg-fuchsia-500/10 border-fuchsia-500/30"
          label="AIM & FIRE"
        />
      </div>
    </div>
  );
}
