'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createNewGame, canPlay, getNextUnplacedShipIndex, applyAction } from '@/engine/game';
import { canPlaceShip } from '@/engine/placement';
import { getNextShot as getEasyShot } from '@/ai/easy';
import { getNextShot as getMediumShot } from '@/ai/medium';
import { getNextShot as getHardShot } from '@/ai/hard';
import { GameState, Board, Coord, Orientation, Ship } from '@/types/game';
import { STANDARD_SHIPS } from '@/shared/ships';
import { getShipCoords } from '@/shared/coords';
import SetupPanel from '@/ui/components/SetupPanel';
import BoardSection from '@/ui/components/BoardSection';
import Portrait, { PortraitMood } from '@/ui/components/Portrait';
import ShipSelector from '@/ui/components/ShipSelector';

type Difficulty = 'easy' | 'medium' | 'hard';

const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const BATMAN_HIT_LINES = [
  'Direct hit!',
  'Bullseye!',
  'Gotham strikes!',
  'Target acquired!',
  'Justice!',
];

const BATMAN_MISS_LINES = [
  'A tactical miss. Recalibrating.',
  'Even the Bat misses sometimes.',
  'The night is long. I\'ll find them.',
  'Missed... but not for long.',
  'Patience is part of the plan.',
];

const BATMAN_SINK_LINES = [
  'Ship down!',
  'Sunk!',
  'Destroyed!',
  'Target eliminated.',
  'Done for!',
];

const BATMAN_VICTORY_LINES = [
  'I am the night. I am Batman. I win.',
  'Gotham is safe once more.',
  'Justice prevails. Every. Single. Time.',
  'The Dark Knight stands victorious.',
  'Never challenge the Bat.',
];

const JOKER_HIT_LINES = [
  'Joker tagged you!',
  'Why so serious?',
  'No joke!',
  'Hahaha! Boom!',
  'Ha! Got you!',
];

const JOKER_MISS_LINES = [
  'Joker whiffed!',
  'Splish splash!',
  'Haha—missed?',
  'Joker\'s shot went wide!',
  'Not even close!'
];

const JOKER_SINK_LINES = [
  'HAHAHA!',
  'Down she goes!',
  'One less toy!',
  'Glub glub glub!',
  'Take that!',
];

const JOKER_VICTORY_LINES = [
  'HAHAHAHA! The Joker wins! Chaos reigns!',
  'Why so serious, Batman? You LOST!',
  'The Clown Prince of Crime is victorious!',
  'Gotham belongs to the Joker now!',
  'They said I was crazy... I WIN!',
];

type BattleStats = {
  shots: number;
  hits: number;
  misses: number;
  accuracy: number;
};

const computeStats = (board: Board): BattleStats => {
  let hits = 0;
  let misses = 0;
  for (let r = 0; r < board.size; r++) {
    for (let c = 0; c < board.size; c++) {
      const cell = board.cells[r][c];
      if (cell === 'hit') hits++;
      else if (cell === 'miss') misses++;
    }
  }
  const shots = hits + misses;
  return { shots, hits, misses, accuracy: shots > 0 ? Math.round((hits / shots) * 100) : 0 };
};

function StatsSectionPanel({ stats, side }: { stats: BattleStats; side: 'batman' | 'joker' }) {
  const label = side === 'batman' ? 'Batman' : 'Joker';
  return (
    <div className={`stats-section stats-${side}`}>
      <h3 className={`stats-title ${side}`}>{label}</h3>
      <div className="stats-grid">
        <div className="stat-item"><span className="stat-value">{stats.shots}</span><span className="stat-label">Shots</span></div>
        <div className="stat-item"><span className="stat-value">{stats.hits}</span><span className="stat-label">Hits</span></div>
        <div className="stat-item"><span className="stat-value">{stats.misses}</span><span className="stat-label">Misses</span></div>
        <div className="stat-item"><span className="stat-value">{stats.accuracy}%</span><span className="stat-label">Accuracy</span></div>
      </div>
    </div>
  );
}


const findShipNameAtCoord = (coord: Coord, ships: Ship[]): string | null => {
  for (const ship of ships) {
    for (const c of ship.coords) {
      if (c.row === coord.row && c.col === coord.col) return ship.name;
    }
  }
  return null;
};


export default function Home() {
  const [game, setGame] = useState<GameState | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [message, setMessage] = useState('Select difficulty and start game');
  const [setupOrientation, setSetupOrientation] = useState<Orientation>('horizontal');

  const [selectedShipIndex, setSelectedShipIndex] = useState<number | null>(null);
  const [hoverCoord, setHoverCoord] = useState<Coord | null>(null);
  const [showBoom, setShowBoom] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [winner, setWinner] = useState<'batman' | 'joker' | null>(null);
  const [cursorCoord, setCursorCoord] = useState<Coord | null>(null);
  const [placedCells, setPlacedCells] = useState<Set<string>>(new Set());
  const [phaseTransitioning, setPhaseTransitioning] = useState(false);
  const [playerMood, setPlayerMood] = useState<PortraitMood>('neutral');
  const [enemyMood, setEnemyMood] = useState<PortraitMood>('neutral');
  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boomTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const placedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moodTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSetupClickRef = useRef<(row: number, col: number) => void>(() => {});
  const handleCellClickRef = useRef<(row: number, col: number) => void>(() => {});

  const triggerBoom = () => {
    if (boomTimeoutRef.current) clearTimeout(boomTimeoutRef.current);
    setShowBoom(true);
    boomTimeoutRef.current = setTimeout(() => {
      setShowBoom(false);
      boomTimeoutRef.current = null;
    }, 1000);
  };

  const allShipsPlaced = game?.phase === 'setup' && getNextUnplacedShipIndex(game, 0) === null;

  const activeShipIndex = game && selectedShipIndex !== null && game.players[0].ships[selectedShipIndex]?.coords.length === 0
    ? selectedShipIndex
    : null;

  const isSetupPhase = game?.phase === 'setup' && !allShipsPlaced;

  const toggleOrientation = useCallback(() => {
    setSetupOrientation((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'));
  }, []);

  const isPlayingPhase = game?.phase === 'playing' && game.currentPlayerIndex === 0;
  const boardSize = game?.players[0].board.size ?? 10;

  useEffect(() => {
    if (!isSetupPhase && !isPlayingPhase) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        if (isSetupPhase) toggleOrientation();
        return;
      }

      const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (arrowKeys.includes(e.key)) {
        e.preventDefault();
        setCursorCoord((prev) => {
          const cur = prev ?? { row: 0, col: 0 };
          let { row, col } = cur;
          if (e.key === 'ArrowUp') row = Math.max(0, row - 1);
          if (e.key === 'ArrowDown') row = Math.min(boardSize - 1, row + 1);
          if (e.key === 'ArrowLeft') col = Math.max(0, col - 1);
          if (e.key === 'ArrowRight') col = Math.min(boardSize - 1, col + 1);
          return { row, col };
        });
        return;
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!cursorCoord) return;
        if (isSetupPhase) {
          handleSetupClickRef.current(cursorCoord.row, cursorCoord.col);
        } else if (isPlayingPhase) {
          handleCellClickRef.current(cursorCoord.row, cursorCoord.col);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSetupPhase, isPlayingPhase, toggleOrientation, boardSize, cursorCoord]);

  // Sync keyboard cursor with hover preview during setup
  useEffect(() => {
    if (isSetupPhase && cursorCoord) {
      setHoverCoord(cursorCoord);
    }
  }, [isSetupPhase, cursorCoord]);

  // Compute preview coords and validity during setup
  const isSetupActive = game?.phase === 'setup' && !allShipsPlaced;
  let previewCoords: Coord[] = [];
  let previewValid = false;
  if (isSetupActive && hoverCoord && game && activeShipIndex !== null) {
    const shipDef = STANDARD_SHIPS[activeShipIndex];
    previewCoords = getShipCoords(hoverCoord, shipDef.length, setupOrientation);
    previewValid = canPlaceShip(game.players[0].board, hoverCoord, shipDef.length, setupOrientation);
  }

  const triggerPhaseTransition = () => {
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    setPhaseTransitioning(true);
    transitionTimeoutRef.current = setTimeout(() => {
      setPhaseTransitioning(false);
      transitionTimeoutRef.current = null;
    }, 650);
  };

  const setMoodTemporarily = (side: 'player' | 'enemy', mood: PortraitMood, duration = 2000) => {
    if (moodTimeoutRef.current) clearTimeout(moodTimeoutRef.current);
    if (side === 'player') setPlayerMood(mood);
    else setEnemyMood(mood);
    moodTimeoutRef.current = setTimeout(() => {
      if (side === 'player') setPlayerMood('neutral');
      else setEnemyMood('neutral');
      moodTimeoutRef.current = null;
    }, duration);
  };

  const resetState = () => {
    if (aiTimeoutRef.current !== null) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }
    if (boomTimeoutRef.current !== null) {
      clearTimeout(boomTimeoutRef.current);
      boomTimeoutRef.current = null;
    }
    if (placedTimeoutRef.current !== null) {
      clearTimeout(placedTimeoutRef.current);
      placedTimeoutRef.current = null;
    }
    if (transitionTimeoutRef.current !== null) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    if (moodTimeoutRef.current !== null) {
      clearTimeout(moodTimeoutRef.current);
      moodTimeoutRef.current = null;
    }
    setShowBoom(false);
    setAiThinking(false);
    setWinner(null);
    setCursorCoord(null);
    setSetupOrientation('horizontal');
    setHoverCoord(null);
    setSelectedShipIndex(null);
    setPlacedCells(new Set());
    setPhaseTransitioning(false);
    setPlayerMood('neutral');
    setEnemyMood('neutral');
    setMessage('Place your ships to begin.');
  };

  const startNewGame = () => {
    resetState();
    setGame(createNewGame());
    setSelectedShipIndex(0);
    setMessage('Select a ship and place it on the board.');
  };

  const handleSetupClick = useCallback((row: number, col: number) => {
    if (!game || game.phase !== 'setup' || allShipsPlaced || activeShipIndex === null) return;

    try {
      const shipDef = STANDARD_SHIPS[activeShipIndex];
      const coords = getShipCoords({ row, col }, shipDef.length, setupOrientation);
      const updatedGame = applyAction(game, { type: 'PLACE_SHIP', playerIndex: 0, shipIndex: activeShipIndex, start: { row, col }, orientation: setupOrientation });
      setGame(updatedGame);

      const newPlaced = new Set(coords.map(c => `${c.row},${c.col}`));
      setPlacedCells(newPlaced);
      if (placedTimeoutRef.current) clearTimeout(placedTimeoutRef.current);
      placedTimeoutRef.current = setTimeout(() => {
        setPlacedCells(new Set());
        placedTimeoutRef.current = null;
      }, 550);

      const nextIndex = getNextUnplacedShipIndex(updatedGame, 0);

      if (nextIndex === null) {
        setSelectedShipIndex(null);
        setMessage(`Placed ${shipDef.name}! All ships placed! Click "Start Battle".`);
      } else {
        setSelectedShipIndex(nextIndex);
        setMessage(`Placed ${shipDef.name}! Select your next ship.`);
      }
    } catch {
      setMessage("Can't place there");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, allShipsPlaced, activeShipIndex, setupOrientation]);

  useEffect(() => { handleSetupClickRef.current = handleSetupClick; }, [handleSetupClick]);

  const handleStartBattle = () => {
    if (!game || !allShipsPlaced) return;
    setCursorCoord(null);
    triggerPhaseTransition();
    setGame(applyAction(game, { type: 'START_BATTLE' }));
    setMessage('Your turn! Click on enemy grid to shoot.');
  };

  const handleCellClick = (row: number, col: number) => {
    if (!game || game.phase !== 'playing' || game.currentPlayerIndex !== 0) {
      return;
    }

    const coord: Coord = { row, col };
    
    if (!canPlay(game, coord)) {
      setMessage('Invalid move! Cell already shot.');
      return;
    }

    let currentGame = applyAction(game, { type: 'SHOT', coord });
    const lm = currentGame.lastMove;
    
    if (lm?.outcome === 'sunk') {
      setMessage(`${pickRandom(BATMAN_SINK_LINES)} Sunk their ${lm.sunkShipName}!`);
      triggerBoom();
      setMoodTemporarily('player', 'confident');
      setMoodTemporarily('enemy', 'worried');
    } else if (lm?.outcome === 'hit') {
      const hitName = findShipNameAtCoord(coord, currentGame.players[1].ships);
      setMessage(hitName ? `${pickRandom(BATMAN_HIT_LINES)} Hit their ${hitName}!` : pickRandom(BATMAN_HIT_LINES));
      setMoodTemporarily('player', 'confident');
    } else {
      setMessage(pickRandom(BATMAN_MISS_LINES));
    }

    if (currentGame.phase === 'finished') {
      setMessage(pickRandom(BATMAN_VICTORY_LINES));
      setWinner('batman');
      setPlayerMood('victorious');
      setEnemyMood('defeated');
      triggerPhaseTransition();
      setGame(currentGame);
      return;
    }

    setAiThinking(true);
    aiTimeoutRef.current = setTimeout(() => {
      if (currentGame.phase === 'playing' && currentGame.currentPlayerIndex === 1) {
        const aiShot = getAIShot(currentGame, difficulty);
        currentGame = applyAction(currentGame, { type: 'SHOT', coord: aiShot });
        
        const aiLm = currentGame.lastMove;

        if (currentGame.phase === 'finished') {
          setMessage(pickRandom(JOKER_VICTORY_LINES));
          setWinner('joker');
          setEnemyMood('victorious');
          setPlayerMood('defeated');
          triggerPhaseTransition();
        } else if (aiLm?.outcome === 'sunk') {
          setMessage(`${pickRandom(JOKER_SINK_LINES)} Sank your ${aiLm.sunkShipName}!`);
          triggerBoom();
          setMoodTemporarily('enemy', 'confident');
          setMoodTemporarily('player', 'worried');
        } else if (aiLm?.outcome === 'hit') {
          const hitShipName = findShipNameAtCoord(aiShot, currentGame.players[0].ships);
          setMessage(hitShipName ? `${pickRandom(JOKER_HIT_LINES)} Hit your ${hitShipName}!` : pickRandom(JOKER_HIT_LINES));
          setMoodTemporarily('enemy', 'confident');
        } else {
          setMessage(pickRandom(JOKER_MISS_LINES));
        }

        setGame(currentGame);
      }
      setAiThinking(false);
      aiTimeoutRef.current = null;
    }, 500);

    setGame(currentGame);
  };

  useEffect(() => { handleCellClickRef.current = handleCellClick; });

  const getAIShot = (game: GameState, difficulty: Difficulty): Coord => {
    switch (difficulty) {
      case 'easy':
        return getEasyShot(game, 1);
      case 'medium':
        return getMediumShot(game, 1);
      case 'hard':
        return getHardShot(game, 1);
    }
  };

  return (
    <div className={`min-h-screen p-8 game-wrapper${game ? ` phase-${game.phase}` : ''}${phaseTransitioning ? ' phase-transitioning' : ''}`} style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center gap-4 mt-4 mb-8">
          <Portrait src="/assets/theme/portraits/player.png" label="Batman" fallbackColor="#1e3a5f" mood={playerMood} />
          <h1 className="text-3xl font-bold text-center">Gotham Battleship</h1>
          <Portrait src="/assets/theme/portraits/enemy.png" label="Joker" fallbackColor="#2d1b4e" isEnemy mood={enemyMood} />
        </div>

        <div style={{ position: 'relative' }}>
          {showBoom && (
            <div className="boom-pop" aria-live="polite">BOOM!</div>
          )}
          {aiThinking && (
            <div className="ai-thinking" aria-live="polite">
              <span className="ai-thinking-dots">
                <span className="ai-thinking-dot" />
                <span className="ai-thinking-dot" />
                <span className="ai-thinking-dot" />
              </span>
              Joker is scheming
            </div>
          )}
        </div>

        <SetupPanel
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          difficultyDisabled={game?.phase === 'playing'}
          onStartGame={startNewGame}
          gameStarted={!!game}
          message={message}
          showOrientationToggle={!!isSetupActive}
          setupOrientation={setupOrientation}
          onToggleOrientation={toggleOrientation}
          showStartBattle={!!allShipsPlaced}
          onStartBattle={handleStartBattle}
        />

        {game && (
          <>
            <div className="flex justify-center gap-12">
              <div className="w-[500px] flex flex-col items-center">
                <BoardSection
                  testId="player-board"
                  title="The Batcave"
                  board={game.players[0].board}
                  ships={game.players[0].ships}
                  showShips={true}
                  onCellClick={handleSetupClick}
                  clickable={game.phase === 'setup' && !allShipsPlaced}
                  showShipsRemaining={game.phase !== 'setup'}
                  previewCoords={isSetupActive ? previewCoords : []}
                  previewValid={isSetupActive ? previewValid : false}
                  onCellHover={isSetupActive ? (row, col) => setHoverCoord({ row, col }) : undefined}
                  onBoardLeave={isSetupActive ? () => setHoverCoord(null) : undefined}
                  cursorCoord={isSetupActive ? cursorCoord : null}
                  placedCells={placedCells}
                />
                {game.phase === 'setup' && !allShipsPlaced && (
                  <ShipSelector
                    ships={game.players[0].ships}
                    selectedShipIndex={selectedShipIndex}
                    onSelectShip={setSelectedShipIndex}
                  />
                )}
                {game.phase !== 'setup' && <StatsSectionPanel stats={computeStats(game.players[1].board)} side="batman" />}
              </div>
              <div className="w-[500px] flex flex-col items-center">
                <BoardSection
                  testId="enemy-board"
                  title="Clown Cartel"
                  board={game.players[1].board}
                  ships={game.players[1].ships}
                  showShips={false}
                  onCellClick={handleCellClick}
                  clickable={game.phase === 'playing' && game.currentPlayerIndex === 0}
                  showShipsRemaining={game.phase !== 'setup'}
                  isEnemy={true}
                  cursorCoord={isPlayingPhase ? cursorCoord : null}
                />
                {game.phase !== 'setup' && <StatsSectionPanel stats={computeStats(game.players[0].board)} side="joker" />}
              </div>
            </div>
          </>
        )}
      </div>

      {winner && (
        <div className="victory-overlay" onClick={() => setWinner(null)} role="dialog" aria-label={`${winner === 'batman' ? 'Batman' : 'Joker'} wins`}>
          <img
            src={winner === 'batman' ? '/assets/theme/portraits/player.png' : '/assets/theme/portraits/enemy.png'}
            alt={`${winner === 'batman' ? 'Batman' : 'Joker'} portrait`}
            className={`victory-portrait${winner === 'joker' ? ' joker' : ''}`}
            style={{ width: 'min(60vw, 320px)', height: 'auto' }}
          />
          <p className={`victory-text mt-6${winner === 'joker' ? ' joker' : ''}`}>
            {winner === 'batman' ? 'Batman Wins!' : 'Joker Wins!'}
          </p>
          <p className="text-sm text-gray-400 mt-4 animate-pulse">Click anywhere to dismiss</p>
        </div>
      )}
    </div>
  );
}
