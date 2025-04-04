import React, { useState, useEffect, useRef } from "react";
import HUD from "../Hud/Hud";
import { PlayerController } from "../playerMove/PlayerMovement";
import { SoundPlayer } from "../SoundBomb";
import { WallManager } from "../wall";
import { BombManager } from "../bomb/bomb";
import playerImage from '../../images/Player.png';
import boomSound from '../../assets/sounds/boom2.mp3';
import "./Board.css";
import "../Hud/Hud.css";
import { PowerUpManager } from "../powerupLife";

interface Position {
  row: number;
  col: number;
}

interface BoardProps {
  config?: {
    duration?: number;
    players?: number;
    blocks?: number;
    lives?: number;
  };
}

type CellType = '0' | '1' | 'P' | 'X';

const Board: React.FC<BoardProps> = ({ config = {} }) => {
  const size = 13;
  const center = Math.floor(size / 2);
  const initialTimeInSeconds = (config.duration || 2) * 60;
  const [shouldPlayBoomSound, setShouldPlayBoomSound] = useState(false);
  const damageCooldownRef = useRef(false);
  const explosionIdRef = useRef(0);

  const maxLives = config.lives !== undefined ? config.lives : 3;

  const [gameState, setGameState] = useState({
    lives: maxLives,
    timeLeftInSeconds: initialTimeInSeconds,
    playersLeft: config.players || 1,
    score: 0
  });

  const [playerPosition, setPlayerPosition] = useState({
    row: center,
    col: center
  });

  const [gameOver, setGameOver] = useState({
    isOver: false,
    message: ''
  });

  const [explosions, setExplosions] = useState<Position[]>([]);

  useEffect(() => {
    if (gameState.lives <= 0 && !gameOver.isOver) {
      setGameOver({
        isOver: true,
        message: '¡HAS PERDIDO!'
      });
    }
  }, [gameState.lives]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState(prev => {
        const newTime = prev.timeLeftInSeconds - 1;
        
        if (newTime <= 0) {
          clearInterval(timer);
          
          if (prev.playersLeft > 1) {
            setGameOver({
              isOver: true,
              message: '¡La partida ha quedado en empate!'
            });
          } else if (prev.playersLeft === 1) {
            setGameOver({
              isOver: true,
              message: '¡Has ganado la partida!'
            });
          } else {
            setGameOver({
              isOver: true,
              message: '¡Juego terminado!'
            });
          }
          
          return { ...prev, timeLeftInSeconds: 0 };
        }
        
        return { ...prev, timeLeftInSeconds: newTime };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handlePowerUpCollect = () => {
    setGameState(prev => {
      if (prev.lives < maxLives) {
        return {
          ...prev,
          lives: prev.lives + 1
        };
      }
      return prev; 
    });
  };

  const handleBombPlaced = () => {
    setShouldPlayBoomSound(true);
    setTimeout(() => setShouldPlayBoomSound(false), 100);
  };

  const handleBombExplode = (position: Position) => {
    const explosionPositions = [
      position,
      { row: position.row - 1, col: position.col },  
      { row: position.row + 1, col: position.col }, 
      { row: position.row, col: position.col - 1 },  
      { row: position.row, col: position.col + 1 }
    ];
    
    explosionIdRef.current += 1;
    const currentExplosionId = explosionIdRef.current;
    
    setExplosions(explosionPositions);
    
    if (!damageCooldownRef.current) {
      const isPlayerInExplosion = explosionPositions.some(
        exp => exp.row === playerPosition.row && exp.col === playerPosition.col
      );
      
      if (isPlayerInExplosion) {
        damageCooldownRef.current = true;
        setGameState(prev => ({
          ...prev,
          lives: Math.max(0, prev.lives - 1)
        }));
        
        setTimeout(() => {
          damageCooldownRef.current = false;
        }, 1000);
      }
    }
    
    setTimeout(() => {
      if (explosionIdRef.current === currentExplosionId) {
        setExplosions([]);
      }
    }, 500);
  };

  const generateBoard = (): CellType[][] => {
    return Array(size).fill(0).map((_, row) => {
      return Array(size).fill(0).map((_, col): CellType => {
        if (row === 0 || row === size-1 || col === 0 || col === size-1) return '1';
        if (row === playerPosition.row && col === playerPosition.col) return 'P';
        if (explosions.some(exp => exp.row === row && exp.col === col)) return 'X';
        return '0';
      });
    });
  };

  const renderCell = (cell: CellType, rowIndex: number, colIndex: number) => {
    const cellTypes = {
      '0': 'empty-cell',
      '1': 'solid-block',
      'P': 'player',
      'X': 'explosion'
    };

    return (
      <div 
        className={`game-cell ${cellTypes[cell]}`}
        key={`${rowIndex}-${colIndex}`}
        style={cell === 'P' ? { 
          backgroundImage: `url(${playerImage})`,
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
        volume={0.4}
      />
      
      <HUD 
        lives={gameState.lives}
        timeLeft={formatTime(gameState.timeLeftInSeconds)}
        playersLeft={gameState.playersLeft}
        score={gameState.score}
      />
      
      <WallManager 
        size={size} 
        center={{ row: center, col: center }} 
        blocks={config.blocks || 0} 
      >
        {(renderWall, walls) => (
          <BombManager 
            onBombPlaced={handleBombPlaced}
            onBombExplode={handleBombExplode}
          >
            {(bombs, placeBomb, renderBomb) => (
              <PowerUpManager
                boardSize={size}
                playerPosition={playerPosition}
                maxLives={maxLives}
                currentLives={gameState.lives}
                onCollect={handlePowerUpCollect}
              >
                {(renderPowerUp) => (
                  <PlayerController
                    initialPosition={{ row: center, col: center }}
                    boardSize={size}
                    onPositionChange={setPlayerPosition}
                    onPlaceBomb={() => placeBomb(playerPosition)}
                    walls={walls}
                    bombs={bombs}
                  >
                    <div className="game-board">
                      {generateBoard().map((row, rowIndex) => (
                        <div className="board-row" key={rowIndex}>
                          {row.map((cell, colIndex) => {
                            const wallElement = renderWall(rowIndex, colIndex);
                            const bombElement = renderBomb(rowIndex, colIndex);
                            const powerUpElement = renderPowerUp(rowIndex, colIndex);
                            return wallElement || bombElement || powerUpElement || renderCell(cell, rowIndex, colIndex);
                          })}
                        </div>
                      ))}
                    </div>
                  </PlayerController>
                )}
              </PowerUpManager>
            )}
          </BombManager>
        )}
      </WallManager>

      {gameOver.isOver && (
      <div className="retro-game-over-card">
        <div className="retro-game-over-content">
        <h2 className={`retro-game-over-title ${gameState.lives <= 0 ? 'game-lost' : ''}`}>
        {gameState.lives <= 0 ? '¡HAS PERDIDO!' : gameOver.message}
        </h2>
          <div className="retro-game-over-buttons">
            <button 
              className="retro-game-over-button"
              onClick={() => window.location.reload()}
            >
              Jugar de nuevo
            </button>
            <button 
              className="retro-game-over-button secondary"
              onClick={() => {/* Lógica para menú principal */}}
            >
              Menú
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default Board;