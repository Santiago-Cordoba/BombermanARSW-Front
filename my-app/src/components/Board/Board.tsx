import React, { useState, useEffect, useRef } from "react";
import HUD from "../Hud/Hud";
import { PlayerController } from "../PlayerMovement";
import { SoundPlayer } from "../SoundBomb";
import { WallManager } from "../wall";
import { BombManager } from "../bomb";
import playerImage from '../../images/Player.png';
import boomSound from '../../assets/sounds/boom2.mp3';
import "./Board.css";
import "../Hud/Hud.css";
import { PowerUpManager } from "../powerupLife";

interface Position {
  row: number;
  col: number;
}

interface Player {
  id: number;
  position: Position;
  lives: number;
}

interface BoardProps {
  config?: {
    duration?: number;
    players?: number;
    blocks?: number;
    lives?: number;
  };
}

type CellType = '0' | '1' | 'P' | 'O' | 'X';

const Board: React.FC<BoardProps> = ({ config = {} }) => {
  const size = 13;
  const center = Math.floor(size / 2);
  const initialTimeInSeconds = (config.duration || 2) * 60;
  const [shouldPlayBoomSound, setShouldPlayBoomSound] = useState(false);
  const damageCooldownRef = useRef(false);
  const explosionIdRef = useRef(0);

  const maxLives = config.lives !== undefined ? config.lives : 3;

  const [players, setPlayers] = useState<Player[]>(() => {
    const initialPlayers: Player[] = [];
    const playerCount = config.players || 1;
    
    const positions = [
      { row: center, col: center },
      { row: center - 2, col: center - 2 },
      { row: center - 2, col: center + 2 },
      { row: center + 2, col: center - 2 },
    ];
    
    for (let i = 0; i < playerCount; i++) {
      initialPlayers.push({
        id: i,
        position: positions[i],
        lives: maxLives // Todos inician con maxLives
      });
    }
    
    return initialPlayers;
  });

  const mainPlayer = players[0];
  const otherPlayers = players.slice(1);

  const [gameState, setGameState] = useState({
    lives: maxLives,
    timeLeftInSeconds: initialTimeInSeconds,
    playersLeft: config.players || 1,
    score: 0
  });

  const [gameOver, setGameOver] = useState({
    isOver: false,
    message: ''
  });

  const [explosions, setExplosions] = useState<Position[]>([]);

  useEffect(() => {
    const alivePlayers = players.filter(p => p.lives > 0).length;
    const mainPlayerLives = players[0]?.lives || 0;
    
    setGameState(prev => ({
      ...prev,
      playersLeft: alivePlayers,
      lives: mainPlayerLives
    }));

    if (mainPlayerLives <= 0 && !gameOver.isOver) {
      setGameOver({
        isOver: true,
        message: '¡HAS PERDIDO!'
      });
    } else if (alivePlayers === 1 && players[0].lives > 0 && !gameOver.isOver) {
      setGameOver({
        isOver: true,
        message: '¡Has ganado la partida!'
      });
    }
  }, [players]);

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
    setPlayers(prevPlayers => 
      prevPlayers.map((player, index) => 
        index === 0 && player.lives < maxLives 
          ? { ...player, lives: player.lives + 1 } 
          : player
      )
    );
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
      setPlayers(prevPlayers => 
        prevPlayers.map(player => {
          const isInExplosion = explosionPositions.some(
            exp => exp.row === player.position.row && exp.col === player.position.col
          );
          
          if (isInExplosion) {
            damageCooldownRef.current = true;
            setTimeout(() => {
              damageCooldownRef.current = false;
            }, 1000);
            
            return {
              ...player,
              lives: Math.max(0, player.lives - 1)
            };
          }
          return player;
        })
      );
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
        if (row === mainPlayer.position.row && col === mainPlayer.position.col && mainPlayer.lives > 0) return 'P';
        if (otherPlayers.some(p => p.position.row === row && p.position.col === col && p.lives > 0)) return 'O';
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
      'O': 'other-player',
      'X': 'explosion'
    };

    return (
      <div 
        className={`game-cell ${cellTypes[cell]}`}
        key={`${rowIndex}-${colIndex}`}
        style={
          cell === 'P' ? { 
            backgroundImage: `url(${playerImage})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundColor: 'transparent'
          } : 
          cell === 'O' ? {
            backgroundImage: `url(${playerImage})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundColor: 'transparent',
            opacity: 0.7
          } : {}
        }
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
        lives={mainPlayer.lives}
        timeLeft={formatTime(gameState.timeLeftInSeconds)}
        playersLeft={gameState.playersLeft}
        score={gameState.score}
      />
      
      <WallManager 
        size={size} 
        center={{ row: center, col: center }} 
        blocks={config.blocks || 0} 
        explosions={explosions}
      >
        {(renderWall, walls) => (
          <BombManager 
            onBombPlaced={handleBombPlaced}
            onBombExplode={handleBombExplode}
          >
            {(bombs, placeBomb, renderBomb) => (
              <PowerUpManager
                boardSize={size}
                playerPosition={mainPlayer.position}
                maxLives={maxLives}
                currentLives={mainPlayer.lives}
                onCollect={handlePowerUpCollect}
              >
                {(renderPowerUp) => (
                  <PlayerController
                    initialPosition={mainPlayer.position}
                    boardSize={size}
                    onPositionChange={(newPos) => {
                      setPlayers(prev => 
                        prev.map((p, i) => i === 0 ? { ...p, position: newPos } : p)
                      );
                    }}
                    onPlaceBomb={() => placeBomb(mainPlayer.position)}
                    walls={walls}
                    bombs={bombs}
                    otherPlayers={otherPlayers
                      .filter(p => p.lives > 0)
                      .map(p => p.position)}
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
            <h2 className={`retro-game-over-title ${mainPlayer.lives <= 0 ? 'game-lost' : ''}`}>
              {mainPlayer.lives <= 0 ? '¡HAS PERDIDO!' : gameOver.message}
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