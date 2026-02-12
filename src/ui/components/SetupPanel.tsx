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
}: SetupPanelProps) {
  return (
    <div className="panel mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4 items-center">
          <label className="font-semibold" style={{ color: 'var(--bat-text)' }}>Difficulty:</label>
          <select
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value as Difficulty)}
            className="rounded px-3 py-1"
            style={{ background: 'var(--color-surface)', color: 'var(--bat-text)', border: '1px solid var(--color-border)' }}
            disabled={difficultyDisabled}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <button
          data-testid="start-game"
          onClick={onStartGame}
          className="px-6 py-2 rounded-lg font-bold uppercase tracking-wider transition-all duration-150"
          style={{ background: gameStarted ? 'var(--state-hit)' : 'var(--bat-accent)', color: '#0a0e1a' }}
        >
          {gameStarted ? 'Restart' : 'Start Game'}
        </button>
      </div>
      <MessagePanel message={message} />
      {showOrientationToggle && (
        <div className="flex justify-center mt-4">
          <button
            onClick={onToggleOrientation}
            className="flex items-center gap-3 px-5 py-2.5 rounded-lg font-bold tracking-wider transition-all duration-150"
            style={{
              background: 'rgba(59, 130, 246, 0.12)',
              color: 'var(--bat-accent)',
              border: '2px solid var(--bp-line-major)',
              boxShadow: '0 0 12px rgba(59, 130, 246, 0.15)',
            }}
            title="Press R to rotate"
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
      {showStartBattle && (
        <div className="flex justify-center mt-4">
          <button
            data-testid="start-battle"
            onClick={onStartBattle}
            className="px-6 py-2 rounded-lg font-bold uppercase tracking-wider transition-all duration-150"
            style={{ background: 'var(--joker-accent)', color: '#0a0e1a' }}
          >
            Start Battle
          </button>
        </div>
      )}
    </div>
  );
}
