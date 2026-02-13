'use client';

import { useRef, useState, useCallback } from 'react';

export type SoundType = 'hit' | 'miss' | 'sunk' | 'victory' | 'defeat';

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useSoundEffects() {
  const [muted, setMuted] = useState(prefersReducedMotion);
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }, [getCtx]);

  const playNoise = useCallback((duration: number, volume = 0.08) => {
    const ctx = getCtx();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - i / bufferSize);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  }, [getCtx]);

  const play = useCallback((sound: SoundType) => {
    if (muted) return;
    try {
      switch (sound) {
        case 'hit':
          playTone(520, 0.15, 'square', 0.1);
          setTimeout(() => playTone(680, 0.12, 'square', 0.08), 60);
          break;
        case 'miss':
          playNoise(0.25, 0.06);
          playTone(200, 0.3, 'sine', 0.04);
          break;
        case 'sunk':
          playTone(300, 0.12, 'sawtooth', 0.1);
          setTimeout(() => playTone(400, 0.12, 'sawtooth', 0.1), 80);
          setTimeout(() => playTone(600, 0.2, 'sawtooth', 0.12), 160);
          playNoise(0.4, 0.1);
          break;
        case 'victory':
          [523, 659, 784, 1047].forEach((freq, i) => {
            setTimeout(() => playTone(freq, 0.3, 'sine', 0.12), i * 120);
          });
          break;
        case 'defeat':
          [400, 350, 300, 220].forEach((freq, i) => {
            setTimeout(() => playTone(freq, 0.4, 'triangle', 0.1), i * 150);
          });
          break;
      }
    } catch {
      // Audio API not available
    }
  }, [muted, playTone, playNoise]);

  const toggleMute = useCallback(() => {
    setMuted(prev => !prev);
  }, []);

  return { muted, toggleMute, play };
}
