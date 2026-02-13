'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createNewGame, canPlay, getNextUnplacedShipIndex, applyAction } from '@/engine/game';
import { canPlaceShip } from '@/engine/placement';
import { getNextShot as getEasyShot } from '@/ai/easy';
import { getNextShot as getMediumShot } from '@/ai/medium';
import { getNextShot as getHardShot } from '@/ai/hard';
import { GameState, Coord, Orientation } from '@/types/game';
import { STANDARD_SHIPS } from '@/shared/ships';
import { getShipCoords } from '@/shared/coords';
import SetupPanel from '@/ui/components/SetupPanel';
import BoardSection from '@/ui/components/BoardSection';
import Portrait from '@/ui/components/Portrait';

type Difficulty = 'easy' | 'medium' | 'hard';

const formatBattleshipCoord = (coord: Coord): string => {
  const rowLetter = String.fromCharCode(65 + coord.row);
  return `${rowLetter}${coord.col + 1}`;
};


export default function Home() {
  const [game, setGame] = useState<GameState | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [message, setMessage] = useState('Select difficulty and start game');
  const [setupOrientation, setSetupOrientation] = useState<Orientation>('horizontal');

  const [hoverCoord, setHoverCoord] = useState<Coord | null>(null);
  const [showBoom, setShowBoom] = useState(false);
  const [winner, setWinner] = useState<'batman' | 'joker' | null>(null);
  const [cursorCoord, setCursorCoord] = useState<Coord | null>(null);
  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boomTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const setupShipIndex = game ? getNextUnplacedShipIndex(game, 0) : 0;
  const allShipsPlaced = game?.phase === 'setup' && setupShipIndex === null;

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
  if (isSetupActive && hoverCoord && game && setupShipIndex !== null) {
    const shipDef = STANDARD_SHIPS[setupShipIndex];
    previewCoords = getShipCoords(hoverCoord, shipDef.length, setupOrientation);
    previewValid = canPlaceShip(game.players[0].board, hoverCoord, shipDef.length, setupOrientation);
  }

  const resetState = () => {
    if (aiTimeoutRef.current !== null) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }
    if (boomTimeoutRef.current !== null) {
      clearTimeout(boomTimeoutRef.current);
      boomTimeoutRef.current = null;
    }
    setShowBoom(false);
    setWinner(null);
    setCursorCoord(null);
    setSetupOrientation('horizontal');
    setHoverCoord(null);
    setMessage('Place your ships to begin.');
  };

  const startNewGame = () => {
    resetState();
    setGame(createNewGame());
    setMessage(`Place: ${STANDARD_SHIPS[0].name} (length ${STANDARD_SHIPS[0].length})`);
  };

  const handleSetupClick = useCallback((row: number, col: number) => {
    if (!game || game.phase !== 'setup' || allShipsPlaced || setupShipIndex === null) return;

    const shipDef = STANDARD_SHIPS[setupShipIndex];

    try {
      const updatedGame = applyAction(game, { type: 'PLACE_SHIP', playerIndex: 0, shipIndex: setupShipIndex, start: { row, col }, orientation: setupOrientation });
      setGame(updatedGame);

      const coordLabel = formatBattleshipCoord({ row, col });
      const nextIndex = getNextUnplacedShipIndex(updatedGame, 0);

      if (nextIndex === null) {
        setMessage(`Placed ${shipDef.name} at ${coordLabel}. All ships placed! Click "Start Battle".`);
      } else {
        setMessage(`Placed ${shipDef.name} at ${coordLabel}. Place: ${STANDARD_SHIPS[nextIndex].name} (length ${STANDARD_SHIPS[nextIndex].length})`);
      }
    } catch {
      setMessage("Can't place there");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, allShipsPlaced, setupShipIndex, setupOrientation]);

  useEffect(() => { handleSetupClickRef.current = handleSetupClick; }, [handleSetupClick]);

  const handleStartBattle = () => {
    if (!game || !allShipsPlaced) return;
    setCursorCoord(null);
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
      setMessage(`You sunk their ${lm.sunkShipName}!`);
      triggerBoom();
    } else if (lm?.outcome === 'hit') {
      setMessage('Hit!');
    } else {
      setMessage('Miss!');
    }

    if (currentGame.phase === 'finished') {
      setMessage(`Batman wins! All enemy ships sunk!`);
      setWinner('batman');
      setGame(currentGame);
      return;
    }

    aiTimeoutRef.current = setTimeout(() => {
      if (currentGame.phase === 'playing' && currentGame.currentPlayerIndex === 1) {
        const aiShot = getAIShot(currentGame, difficulty);
        currentGame = applyAction(currentGame, { type: 'SHOT', coord: aiShot });
        
        const shotLabel = formatBattleshipCoord(aiShot);
        const aiLm = currentGame.lastMove;

        if (currentGame.phase === 'finished') {
          setMessage(`Joker wins! All your ships sunk!`);
          setWinner('joker');
        } else if (aiLm?.outcome === 'sunk') {
          setMessage(`Joker sunk your ${aiLm.sunkShipName} at ${shotLabel}! Your turn.`);
          triggerBoom();
        } else if (aiLm?.outcome === 'hit') {
          setMessage(`Joker hit your ship at ${shotLabel}! Your turn.`);
        } else {
          setMessage(`Joker missed at ${shotLabel}. Your turn!`);
        }

        setGame(currentGame);
      }
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
    <div className={`min-h-screen p-8 game-wrapper${game ? ` phase-${game.phase}` : ''}`} style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center gap-4 mt-4 mb-8">
          <Portrait src="/assets/theme/portraits/player.png" label="Batman" fallbackColor="#1e3a5f" />
          <h1 className="text-3xl font-bold text-center">Gotham Battleship</h1>
          <Portrait src="/assets/theme/portraits/enemy.png" label="Joker" fallbackColor="#2d1b4e" isEnemy />
        </div>

        <div style={{ position: 'relative' }}>
          {showBoom && (
            <div className="boom-pop" aria-live="polite">BOOM!</div>
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
              />
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
            </div>
          </div>
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
