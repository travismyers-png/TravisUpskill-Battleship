import React from 'react';
import { Orientation } from '@/types/game';
import MessagePanel from './MessagePanel';

type Difficulty = 'easy' | 'medium' | 'hard';

export type SetupPanelProps = {
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
  difficultyDisabled: boolean;
  onStartGame: () => void;
  gameStarted: boolean;
  message: string;
  showOrientationToggle: boolean;
  setupOrientation: Orientation;
  onToggleOrientation: () => void;
  showStartBattle: boolean;
  onStartBattle: () => void;
  muted: boolean;
  onToggleMute: () => void;
  showUndo: boolean;
  onUndo: () => void;
};

export default function SetupPanel({
  difficulty,
  onDifficultyChange,
  difficultyDisabled,
  onStartGame,
  gameStarted,
  message,
  showOrientationToggle,
  setupOrientation,
  onToggleOrientation,
  showStartBattle,
  onStartBattle,
  muted,
  onToggleMute,
  showUndo,
  onUndo,
}: SetupPanelProps) {
  return (
    <div className="panel mb-6">
      {/* ── Configuration Section ── */}
      <div
        className="flex items-center justify-between mb-4 pb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex gap-3 items-center">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bat-text)', opacity: 0.7 }}>
            Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value as Difficulty)}
            className="rounded px-3 py-1 text-sm"
            style={{ background: 'var(--color-surface)', color: 'var(--bat-text)', border: '1px solid var(--color-border)' }}
            disabled={difficultyDisabled}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <button
          onClick={onToggleMute}
          className="px-2.5 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-100"
          style={{
            background: 'rgba(255,255,255,0.06)',
            color: muted ? 'var(--state-miss)' : 'var(--bat-accent)',
            border: `1px solid ${muted ? 'var(--color-border)' : 'var(--bat-accent)'}`,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          }}
          title={muted ? 'Unmute sounds' : 'Mute sounds'}
          aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          {muted ? '\u{1F507}' : '\u{1F50A}'}
        </button>
      </div>

      {/* ── Feedback Section ── */}
      <MessagePanel message={message} />

      {/* ── Action Section ── */}
      <div
        className="flex items-center justify-center gap-3 mt-4 pt-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', minHeight: '48px' }}
      >
        {showOrientationToggle && (
          <button
            onClick={onToggleOrientation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-100"
            style={{
              background: 'rgba(59, 130, 246, 0.10)',
              color: 'var(--bat-accent)',
              border: '1px solid var(--bp-line-major)',
            }}
            title={`${setupOrientation === 'horizontal' ? 'Horizontal' : 'Vertical'} — press R to rotate`}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span
              className="inline-block transition-transform duration-200"
              style={{ transform: setupOrientation === 'horizontal' ? 'rotate(0deg)' : 'rotate(90deg)' }}
              aria-hidden="true"
            >
              ⟷
            </span>
            <kbd className="text-[10px] px-1 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--bat-text)', border: '1px solid rgba(255,255,255,0.12)' }}>R</kbd>
          </button>
        )}

        {showUndo && (
          <button
            onClick={onUndo}
            className="px-4 py-1.5 rounded-md text-sm font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-100"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: 'var(--state-hit)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Undo
          </button>
        )}

        {showStartBattle && (
          <button
            data-testid="start-battle"
            onClick={onStartBattle}
            className="px-5 py-1.5 rounded-md text-sm font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-100"
            style={{
              background: 'var(--joker-accent)',
              color: '#0a0e1a',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Start Battle
          </button>
        )}

        <button
          data-testid="start-game"
          onClick={onStartGame}
          className="px-5 py-1.5 rounded-md text-sm font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-100"
          style={{
            background: gameStarted ? 'var(--state-hit)' : 'var(--bat-accent)',
            color: '#0a0e1a',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          {gameStarted ? 'Restart' : 'Start Game'}
        </button>
      </div>
    </div>
  );
}
