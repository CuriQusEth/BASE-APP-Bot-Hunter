import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../lib/store';

// --- Game Engine Interfaces ---
interface Vector { x: number; y: number; }
interface Player { pos: Vector; vel: Vector; radius: number; hp: number; maxHp: number; cooldown: number; }
interface Bullet { pos: Vector; vel: Vector; radius: number; damage: number; life: number; color: string; }
interface Enemy { pos: Vector; vel: Vector; radius: number; hp: number; speed: number; color: string; type: 'basic' | 'tank' | 'swarm'; }
interface Particle { pos: Vector; vel: Vector; radius: number; life: number; maxLife: number; color: string; }

export function useGameEngine(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  moveInput: React.MutableRefObject<Vector>,
  aimInput: React.MutableRefObject<Vector>,
  isShooting: React.MutableRefObject<boolean>
) {
  const { setScreen, setScore, setWave, setKills } = useGameStore();
  
  const state = useRef({
    player: { pos: { x: 0, y: 0 }, vel: { x: 0, y: 0 }, radius: 12, hp: 100, maxHp: 100, cooldown: 0 } as Player,
    bullets: [] as Bullet[],
    enemies: [] as Enemy[],
    particles: [] as Particle[],
    score: 0,
    kills: 0,
    wave: 1,
    frameCount: 0,
    lastSpawn: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      // Need real bounds since CSS handles sizing
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      state.current.width = rect.width;
      state.current.height = rect.height;
      
      // Initialize player in center on first load
      if (state.current.player.pos.x === 0) {
        state.current.player.pos = { x: rect.width / 2, y: rect.height / 2 };
      }
    };
    window.addEventListener('resize', resize);
    resize();
    
    // Reset state for new game
    state.current.score = 0;
    state.current.kills = 0;
    state.current.wave = 1;
    state.current.player.hp = 100;
    state.current.bullets = [];
    state.current.enemies = [];
    state.current.particles = [];
    useGameStore.getState().resetGame();

    const spawnEnemy = () => {
      const { width, height, wave } = state.current;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.max(width, height) / 2 + 50;
      const pos = {
        x: width / 2 + Math.cos(angle) * dist,
        y: height / 2 + Math.sin(angle) * dist
      };

      const rand = Math.random();
      let type: Enemy['type'] = 'basic';
      let radius = 15;
      let hp = 20 + wave * 5;
      let speed = 2 + wave * 0.1;
      let color = '#ef4444'; // red-500

      if (wave > 2 && rand > 0.8) {
        type = 'tank';
        radius = 25;
        hp = 100 + wave * 10;
        speed = 1 + wave * 0.05;
        color = '#eab308'; // yellow-500
      } else if (wave > 3 && rand < 0.2) {
        type = 'swarm';
        radius = 8;
        hp = 10 + wave * 2;
        speed = 3.5 + wave * 0.15;
        color = '#d946ef'; // fuchsia-500
      }

      state.current.enemies.push({ pos, vel: { x: 0, y: 0 }, radius, hp, speed, color, type });
    };

    const explode = (pos: Vector, color: string, count: number = 10) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        state.current.particles.push({
          pos: { x: pos.x, y: pos.y },
          vel: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
          radius: Math.random() * 3 + 1,
          life: 0,
          maxLife: Math.random() * 20 + 20,
          color
        });
      }
    };

    const update = () => {
      const s = state.current;
      s.frameCount++;

      // Player Move Integration
      const speed = 4;
      s.player.pos.x += moveInput.current.x * speed;
      s.player.pos.y += moveInput.current.y * speed;

      // Clamp player to screen
      s.player.pos.x = Math.max(s.player.radius, Math.min(s.width - s.player.radius, s.player.pos.x));
      s.player.pos.y = Math.max(s.player.radius, Math.min(s.height - s.player.radius, s.player.pos.y));

      // Shooting
      if (s.player.cooldown > 0) s.player.cooldown--;
      if (isShooting.current && s.player.cooldown <= 0) {
        const aVec = aimInput.current;
        // if no aim input but shooting button pressed, shoot in movement direction or right
        const mag = Math.sqrt(aVec.x*aVec.x + aVec.y*aVec.y);
        let dirX = 1, dirY = 0;
        if (mag > 0.1) {
          dirX = aVec.x; dirY = aVec.y;
        } else if (Math.abs(moveInput.current.x) > 0.1 || Math.abs(moveInput.current.y) > 0.1) {
            dirX = moveInput.current.x; dirY = moveInput.current.y;
        }

        // normalize direction
        const dMag = Math.sqrt(dirX*dirX + dirY*dirY);
        const bSpeed = 12;
        s.bullets.push({
          pos: { x: s.player.pos.x, y: s.player.pos.y },
          vel: { x: (dirX/dMag) * bSpeed, y: (dirY/dMag) * bSpeed },
          radius: 3,
          damage: 15,
          life: 100,
          color: '#22d3ee' // cyan-400
        });
        s.player.cooldown = 8; // fire rate
      }

      // Update Bullets
      for (let i = s.bullets.length - 1; i >= 0; i--) {
        const b = s.bullets[i];
        b.pos.x += b.vel.x;
        b.pos.y += b.vel.y;
        b.life--;
        if (b.life <= 0 || b.pos.x < 0 || b.pos.x > s.width || b.pos.y < 0 || b.pos.y > s.height) {
          s.bullets.splice(i, 1);
        }
      }

      // Spawning
      const spawnRate = Math.max(30, 100 - s.wave * 10);
      if (s.frameCount - s.lastSpawn > spawnRate) {
        spawnEnemy();
        s.lastSpawn = s.frameCount;
      }

      // Wave progression
      if (s.score > s.wave * 1000) {
        s.wave++;
        setWave(s.wave);
      }

      // Update Enemies
      for (let i = s.enemies.length - 1; i >= 0; i--) {
        const e = s.enemies[i];
        // move towards player
        const dx = s.player.pos.x - e.pos.x;
        const dy = s.player.pos.y - e.pos.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist > 0) {
          e.pos.x += (dx/dist) * e.speed;
          e.pos.y += (dy/dist) * e.speed;
        }

        // Check collision with player
        if (dist < e.radius + s.player.radius) {
          s.player.hp -= (e.type === 'tank' ? 20 : e.type === 'swarm' ? 5 : 10);
          explode(e.pos, e.color);
          s.enemies.splice(i, 1);
          if (s.player.hp <= 0) {
              setScreen('gameover');
              return; // End loop
          }
          continue; // enemy died on player
        }

        // Check collision with bullets
        for (let j = s.bullets.length - 1; j >= 0; j--) {
          const b = s.bullets[j];
          const bdx = b.pos.x - e.pos.x;
          const bdy = b.pos.y - e.pos.y;
          const bDist = Math.sqrt(bdx*bdx + bdy*bdy);
          if (bDist < e.radius + b.radius) {
             e.hp -= b.damage;
             explode(b.pos, '#fff', 3);
             s.bullets.splice(j, 1);
             if (e.hp <= 0) {
               s.score += (e.type === 'tank' ? 50 : e.type === 'swarm' ? 10 : 20);
               s.kills++;
               setScore(s.score);
               setKills(s.kills);
               explode(e.pos, e.color, 20);
               s.enemies.splice(i, 1);
             }
             break; // bullet destroyed
          }
        }
      }

      // Update Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
         const p = s.particles[i];
         p.pos.x += p.vel.x;
         p.pos.y += p.vel.y;
         p.vel.x *= 0.95; // friction
         p.vel.y *= 0.95;
         p.life++;
         if (p.life > p.maxLife) {
             s.particles.splice(i, 1);
         }
      }
    };

    const draw = () => {
      const s = state.current;
      // Clear with dark trail (more transparent to show grid)
      ctx.fillStyle = 'rgba(5, 5, 11, 0.4)';
      ctx.fillRect(0, 0, s.width, s.height);

      // Draw Grid (optional subtle background)
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      const offsetX = s.player.pos.x % gridSize;
      const offsetY = s.player.pos.y % gridSize;
      // to keep it simple, grid is static but camera could move. We are doing stationary camera.
      
      // Draw Particles
      s.particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.pos.x, p.pos.y, p.radius * (1 - p.life/p.maxLife), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      // Draw Enemies
      s.enemies.forEach(e => {
        ctx.beginPath();
        if (e.type === 'tank') {
            ctx.rect(e.pos.x - e.radius, e.pos.y - e.radius, e.radius*2, e.radius*2);
        } else {
            ctx.arc(e.pos.x, e.pos.y, e.radius, 0, Math.PI * 2);
        }
        ctx.fillStyle = 'transparent';
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Inner glow
        ctx.fillStyle = e.color + '40';
        ctx.fill();
      });

      // Draw Bullets
      s.bullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.pos.x, b.pos.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = b.color;
        ctx.arc(b.pos.x, b.pos.y, b.radius+1, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Player
      ctx.beginPath();
      ctx.arc(s.player.pos.x, s.player.pos.y, s.player.radius, 0, Math.PI*2);
      ctx.fillStyle = '#111';
      ctx.fill();
      ctx.strokeStyle = '#22d3ee'; // cyan-400
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Player direction indicator
      const pAim = aimInput.current;
      const move = moveInput.current;
      let dirX = move.x, dirY = move.y;
      if (Math.abs(pAim.x) > 0.1 || Math.abs(pAim.y) > 0.1) {
          dirX = pAim.x; dirY = pAim.y;
      }
      const mag = Math.sqrt(dirX*dirX + dirY*dirY);
      if (mag > 0) {
          ctx.beginPath();
          ctx.moveTo(s.player.pos.x, s.player.pos.y);
          ctx.lineTo(s.player.pos.x + (dirX/mag) * 20, s.player.pos.y + (dirY/mag) * 20);
          ctx.strokeStyle = '#22d3ee';
          ctx.stroke();
      }

      // Health bar
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(s.player.pos.x - 15, s.player.pos.y + 20, 30, 4);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(s.player.pos.x - 15, s.player.pos.y + 20, 30 * (s.player.hp / s.player.maxHp), 4);
    };

    const loop = () => {
      update();
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []); // Empty dependency array as dependencies are accessed via refs
}
