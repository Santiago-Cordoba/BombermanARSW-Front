import React, { useState, useEffect } from "react";
import HUD from "../Hud/Hud";
import { PlayerController } from "../PlayerMovement";
import { SoundPlayer } from "../SoundBomb";
import { WallManager } from "../wall";
import playerImage from '../../images/Player.png';
import bombImage from '../../images/bomb.png';
import boomSound from '../../assets/sounds/boom2.mp3';
import "./Board.css";
import "../Hud/Hud.css";

interface BoardProps {
  config?: {
    duration?: number;
    players?: number;
    blocks?: number;
    lives?: number;
  };
}

type CellType = '0' | '1' | 'P' | 'B' | 'X';

const Board: React.FC<BoardProps> = ({ config = {} }) => {
  const size = 13;
  const center = Math.floor(size / 2);
  const initialTimeInSeconds = (config.duration || 2) * 60;
  const [shouldPlayBoomSound, setShouldPlayBoomSound] = useState(false);

  const [gameState, setGameState] = useState({
    lives: config.lives || 3,
    timeLeftInSeconds: initialTimeInSeconds,
    playersLeft: config.players || 1,
    score: 0
  });

  const [playerPosition, setPlayerPosition] = useState({
    row: center,
    col: center
  });

  const [bombs, setBombs] = useState<Array<{position: {row: number, col: number}, timer: number}>>([]);
  const [explosions, setExplosions] = useState<Array<{row: number, col: number}>>([]);

  const handleBombPlaced = () => {
    setShouldPlayBoomSound(true);
    setTimeout(() => setShouldPlayBoomSound(false), 100);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        timeLeftInSeconds: prev.timeLeftInSeconds > 0 ? prev.timeLeftInSeconds - 1 : 0
      }));

      setBombs(prev => {
        const updatedBombs = prev.map(bomb => ({
          ...bomb,
          timer: bomb.timer - 1
        }));
        
        const bombsToExplode = updatedBombs.filter(bomb => bomb.timer <= 0);
        
        if (bombsToExplode.length > 0) {
          setExplosions(bombsToExplode.map(bomb => bomb.position));
        }
        
        return updatedBombs.filter(bomb => bomb.timer > 0);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (explosions.length > 0) {
      const timer = setTimeout(() => setExplosions([]), 500);
      return () => clearTimeout(timer);
    }
  }, [explosions]);

  const placeBomb = () => {
    setBombs(prev => [
      ...prev,
      {
        position: { ...playerPosition },
        timer: 3 
      }
    ]);
    handleBombPlaced();
  };

  const generateBoard = (): CellType[][] => {
    return Array(size).fill(0).map((_, row) => {
      return Array(size).fill(0).map((_, col): CellType => {
        if (row === 0 || row === size-1 || col === 0 || col === size-1) return '1';
        if (row === playerPosition.row && col === playerPosition.col) return 'P';
        if (bombs.some(bomb => bomb.position.row === row && bomb.position.col === col)) return 'B';
        if (explosions.some(exp => exp.row === row && exp.col === col)) return 'X';
        return '0';
      });
    });
  };

  const board = generateBoard();

  const renderCell = (cell: CellType, rowIndex: number, colIndex: number) => {
    const cellTypes = {
      '0': 'empty-cell',
      '1': 'solid-block',
      'P': 'player',
      'B': 'bomb',
      'X': 'explosion'
    };

    const cellImages = {
      'P': playerImage,
      'B': bombImage
    };

    return (
      <div 
        className={`game-cell ${cellTypes[cell]}`}
        key={`${rowIndex}-${colIndex}`}
        style={['P', 'B'].includes(cell) ? { 
          backgroundImage: `url(${cellImages[cell as 'P' | 'B']})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundColor: 'transparent'
        } : {}}
      />
    );
  };

  return (
    <div className="game-board-container">
      <SoundPlayer 
        soundFile={boomSound}
        playCondition={shouldPlayBoomSound}
        volume={0.8}
      />
      
      <HUD 
        lives={gameState.lives}
        timeLeft={formatTime(gameState.timeLeftInSeconds)}
        playersLeft={gameState.playersLeft}
        score={gameState.score}
      />
      
      <PlayerController
        initialPosition={{ row: center, col: center }}
        boardSize={size}
        onPositionChange={setPlayerPosition}
        onPlaceBomb={placeBomb}
      >
        <WallManager 
          size={size} 
          center={{ row: center, col: center }} 
          blocks={config.blocks || 0} // Asegúrate que blocks viene de config
        >
          {(renderWall) => (
            <div className="game-board">
              {board.map((row, rowIndex) => (
                <div className="board-row" key={rowIndex}>
                  {row.map((cell, colIndex) => {
                    const wallElement = renderWall(rowIndex, colIndex);
                    return wallElement || renderCell(cell, rowIndex, colIndex);
                  })}
                </div>
              ))}
            </div>
          )}
        </WallManager>
      </PlayerController>
    </div>
  );
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default Board;