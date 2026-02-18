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
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4 items-center">
          <label className="font-semibold" style={{ color: 'var(--bat-text)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}>Difficulty:</label>
          <select
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value as Difficulty)}
            className="rounded px-3 py-1"
            style={{ background: 'rgba(17, 24, 39, 0.9)', color: 'var(--bat-text)', border: '2px solid var(--bat-primary)', borderRadius: '8px', padding: '0.35rem 0.75rem', boxShadow: '0 0 6px rgba(30, 58, 95, 0.3)', outline: 'none', cursor: 'pointer' }}
            disabled={difficultyDisabled}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={onToggleMute}
            className="px-3 py-2 rounded-lg font-bold transition-all duration-200 hover:scale-105 active:scale-100"
            style={{
              background: 'rgba(17, 24, 39, 0.8)',
              color: muted ? 'var(--state-miss)' : 'var(--bat-accent)',
              border: `2px solid ${muted ? 'rgba(71, 85, 105, 0.5)' : 'rgba(245, 197, 24, 0.4)'}`,
              boxShadow: muted
                ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                : '0 0 8px var(--bat-glow), 0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
            title={muted ? 'Unmute sounds' : 'Mute sounds'}
            aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {muted ? '\u{1F507}' : '\u{1F50A}'}
          </button>
          <button
            data-testid="start-game"
            onClick={onStartGame}
            className="px-6 py-2 rounded-lg font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-100"
            style={{ 
              background: gameStarted
                ? 'linear-gradient(135deg, var(--state-hit), #b91c1c)'
                : 'linear-gradient(135deg, var(--bat-accent), #d4a017)',
              color: '#0a0e1a',
              border: `2px solid ${gameStarted ? 'var(--state-hit)' : 'var(--bat-accent)'}`,
              boxShadow: gameStarted
                ? '0 0 12px rgba(239, 68, 68, 0.35), 0 2px 8px rgba(0, 0, 0, 0.3)'
                : '0 0 12px var(--bat-glow), 0 2px 8px rgba(0, 0, 0, 0.3)',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {gameStarted ? 'Restart' : 'Start Game'}
          </button>
        </div>
      </div>
      <MessagePanel message={message} />
      {showOrientationToggle && (
        <div className="flex justify-center mt-4">
          <button
            onClick={onToggleOrientation}
            className="flex items-center gap-3 px-5 py-2.5 rounded-lg font-bold tracking-wider transition-all duration-200 hover:scale-105 active:scale-100"
            style={{
              background: 'rgba(59, 130, 246, 0.12)',
              color: 'var(--bat-accent)',
              border: '2px solid var(--bp-line-major)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            }}
            title="Press R to rotate"
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span
              className="inline-block text-xl transition-transform duration-200"
              style={{ transform: setupOrientation === 'horizontal' ? 'rotate(0deg)' : 'rotate(90deg)' }}
              aria-hidden="true"
            >
              ⟷
            </span>
            <span>{setupOrientation === 'horizontal' ? 'Horizontal' : 'Vertical'}</span>
            <kbd className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--bat-text)', border: '1px solid rgba(255,255,255,0.12)' }}>R</kbd>
          </button>
        </div>
      )}
      {showUndo && (
        <div className="flex justify-center mt-4">
          <button
            onClick={onUndo}
            className="px-5 py-2 rounded-lg font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-100"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: 'var(--state-hit)',
              border: '2px solid rgba(239, 68, 68, 0.5)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              textShadow: '0 0 6px rgba(239, 68, 68, 0.3)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Undo Last Placement
          </button>
        </div>
      )}
      {showStartBattle && (
        <div className="flex justify-center mt-4">
          <button
            data-testid="start-battle"
            onClick={onStartBattle}
            className="px-6 py-2 rounded-lg font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-100"
            style={{ 
              background: 'linear-gradient(135deg, var(--joker-accent), #2dd40f)',
              color: '#0a0e1a',
              border: '2px solid var(--joker-accent)',
              boxShadow: '0 0 14px var(--joker-glow), 0 2px 8px rgba(0, 0, 0, 0.3)',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Start Battle
          </button>
        </div>
      )}
    </div>
  );
}
