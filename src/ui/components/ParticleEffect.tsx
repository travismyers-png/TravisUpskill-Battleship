'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';

type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  lifetime: number;
  opacity: number;
};

export type ParticleType = 'hit' | 'miss' | 'sunk';

type ParticleBurst = {
  id: number;
  particles: Particle[];
  type: ParticleType;
  startTime: number;
};

const HIT_COLORS = ['#ef4444', '#f97316', '#fbbf24', '#ffffff'];
const MISS_COLORS = ['#60a5fa', '#93c5fd', '#bfdbfe', '#ffffff'];
const SUNK_COLORS = ['#ef4444', '#f97316', '#fbbf24', '#7c3aed', '#ffffff'];

function createParticles(type: ParticleType): Particle[] {
  const count = type === 'sunk' ? 24 : type === 'hit' ? 14 : 10;
  const colors = type === 'sunk' ? SUNK_COLORS : type === 'hit' ? HIT_COLORS : MISS_COLORS;
  const speed = type === 'sunk' ? 4 : type === 'hit' ? 3 : 2;

  return Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const velocity = speed * (0.5 + Math.random() * 0.8);
    return {
      id: i,
      x: 0,
      y: 0,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - (type === 'miss' ? 1.5 : 0),
      size: type === 'sunk' ? 3 + Math.random() * 4 : 2 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      lifetime: type === 'sunk' ? 800 : 600,
      opacity: 1,
    };
  });
}

export function useParticleEffect() {
  const [bursts, setBursts] = useState<ParticleBurst[]>([]);
  const nextId = useRef(0);
  const reducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  const trigger = useCallback((type: ParticleType) => {
    if (reducedMotion.current) return;
    const id = nextId.current++;
    const burst: ParticleBurst = {
      id,
      particles: createParticles(type),
      type,
      startTime: performance.now(),
    };
    setBursts(prev => [...prev, burst]);
    const duration = type === 'sunk' ? 900 : 700;
    setTimeout(() => {
      setBursts(prev => prev.filter(b => b.id !== id));
    }, duration);
  }, []);

  return { bursts, trigger };
}

export default function ParticleCanvas({ bursts }: { bursts: ParticleBurst[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (bursts.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const now = performance.now();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const burst of bursts) {
        const elapsed = now - burst.startTime;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        for (const p of burst.particles) {
          const progress = elapsed / p.lifetime;
          if (progress > 1) continue;

          const x = cx + p.x + p.vx * elapsed * 0.12;
          const y = cy + p.y + p.vy * elapsed * 0.12 + 0.0003 * elapsed * elapsed;
          const opacity = p.opacity * (1 - progress);
          const size = p.size * (1 - progress * 0.4);

          ctx.beginPath();
          ctx.arc(x, y, Math.max(0.5, size), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = opacity;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [bursts]);

  if (bursts.length === 0) return null;

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 200,
        height: 200,
        pointerEvents: 'none',
        zIndex: 55,
      }}
    />
  );
}
