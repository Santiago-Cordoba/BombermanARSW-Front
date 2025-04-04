import React, { useState, useEffect, useRef } from "react";
import HUD from "../Hud/Hud";
import { PlayerController } from "../playerMove/PlayerMovement";
import { SoundPlayer } from "../SoundBomb";
import { BombManager } from "../bomb/bomb";
import playerImage from "../../images/p1.png";
import player2Image from "../../images/p2.png";
import player3Image from "../../images/p3.png";
import player4Image from "../../images/p4.png";
import boomSound from '../../assets/sounds/boom2.mp3';
import "./Board.css";
import "../Hud/Hud.css";
import { PowerUpManager } from "../powerupLife";

interface Position {
  row: number;
  col: number;
}

interface Player {
  id: string;
  name: string;
  row: number;
  col: number;
  lives: number;
  isCurrent?: boolean;
}

interface BoardProps {
  config?: {
    duration?: number;
    players?: number;
    lives?: number;
  };
  players?: Player[];
  roomCode?: string;
}

type CellType = '0' | '1' | 'P' | 'O' | 'X';

const Board: React.FC<BoardProps> = ({ config = {}, players: initialPlayers = [], roomCode = '' }) => {
  const size = 15;
  const initialTimeInSeconds = (config.duration || 3) * 60;
  const [shouldPlayBoomSound, setShouldPlayBoomSound] = useState(false);
  const damageCooldownRef = useRef(false);
  const explosionIdRef = useRef(0);
  const maxLives = config.lives !== undefined ? config.lives : 3;

  // Estado para los jugadores
  const [players, setPlayers] = useState<Player[]>(() => {
    if (initialPlayers.length > 0) {
      return initialPlayers.map((player, index) => ({
        ...player,
        isCurrent: index === 0
      }));
    }
    
    const center = Math.floor(size / 2);
    return [{
      id: 'player-1',
      name: 'Player 1',
      row: center,
      col: center,
      lives: maxLives,
      isCurrent: true
    }];
  });

  const currentPlayer = players.find(p => p.isCurrent) || players[0];

  const [gameState, setGameState] = useState({
    timeLeftInSeconds: initialTimeInSeconds,
    playersLeft: players.length,
    score: 0
  });

  const [gameOver, setGameOver] = useState({
    isOver: false,
    message: ''
  });

  const [explosions, setExplosions] = useState<Position[]>([]);

  // Efecto para verificar estado del juego
  useEffect(() => {
    if (gameOver.isOver) return;
  
    const alivePlayers = players.filter(p => p.lives > 0);
    const currentPlayerAlive = currentPlayer?.lives > 0;
  
    if (!currentPlayerAlive) {
      setGameOver({
        isOver: true,
        message: '¡HAS PERDIDO!'
      });
    } else if (alivePlayers.length === 1) {
      setGameOver({
        isOver: true,
        message: '¡Has ganado la partida!'
      });
    }
  
    setGameState(prev => ({
      ...prev,
      playersLeft: alivePlayers.length
    }));
  }, [players, gameOver.isOver, currentPlayer?.lives]);

  // Efecto para el temporizador
  // Efecto para verificar estado del juego
useEffect(() => {
  if (gameOver.isOver) return;

  const alivePlayers = players.filter(p => p.lives > 0);
  const currentPlayerAlive = currentPlayer?.lives > 0;

  // Solo verificar condiciones de fin de juego si hay más de un jugador
  // o si el jugador actual ha perdido todas sus vidas
  if (!currentPlayerAlive) {
    setGameOver({
      isOver: true,
      message: '¡HAS PERDIDO!'
    });
  } else if (players.length > 1 && alivePlayers.length === 1) {
    // Solo mostrar mensaje de victoria si había múltiples jugadores
    setGameOver({
      isOver: true,
      message: '¡Has ganado la partida!'
    });
  }

  setGameState(prev => ({
    ...prev,
    playersLeft: alivePlayers.length
  }));
}, [players, gameOver.isOver, currentPlayer?.lives]);

  const handlePowerUpCollect = () => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => 
        player.isCurrent && player.lives < maxLives
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
          const isPlayerInExplosion = explosionPositions.some(
            exp => exp.row === player.row && exp.col === player.col
          );
          
          if (isPlayerInExplosion && player.isCurrent) {
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
        if (players.some(p => p.row === row && p.col === col)) return 'P';
        if (explosions.some(exp => exp.row === row && exp.col === col)) return 'X';
        return '0';
      });
    });
  };

  const getPlayerImage = (playerId: string) => {
    const playerIndex = players.findIndex(p => p.id === playerId);
    switch(playerIndex % 4) {
      case 0: return playerImage;
      case 1: return player2Image;
      case 2: return player3Image;
      case 3: return player4Image;
      default: return playerImage;
    }
  };

  const renderCell = (cell: CellType, rowIndex: number, colIndex: number) => {
    const cellTypes = {
      '0': 'empty-cell',
      '1': 'solid-block',
      'P': 'player',
      'O': 'other-player',
      'X': 'explosion'
    };

    if (cell === 'P') {
      const player = players.find(p => p.row === rowIndex && p.col === colIndex);
      if (player) {
        return (
          <div 
            className={`game-cell ${cellTypes[cell]} ${player.isCurrent ? 'current-player' : ''}`}
            key={`player-${player.id}`}
            style={{ 
              backgroundImage: `url(${getPlayerImage(player.id)})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundColor: 'transparent',
              border: player.isCurrent ? '2px solid yellow' : 'none'
            }}
            title={player.name}
          />
        );
      }
    }

    return (
      <div 
        className={`game-cell ${cellTypes[cell]}`}
        key={`${rowIndex}-${colIndex}`}
      />
    );
  };

  const handlePlayerMove = (newPosition: Position) => {
    if (currentPlayer) {
      setPlayers(prevPlayers => 
        prevPlayers.map(player => 
          player.isCurrent
            ? { ...player, row: newPosition.row, col: newPosition.col }
            : player
        )
      );
    }
  };

  return (
    <div className="game-board-container">
      <SoundPlayer 
        soundFile={boomSound}
        playCondition={shouldPlayBoomSound}
        volume={0.4}
      />
      
      <HUD 
        timeLeft={formatTime(gameState.timeLeftInSeconds)}
        score={gameState.score}
        roomCode={roomCode}
        lives={currentPlayer?.lives || 0}
      />
      
      <BombManager 
        onBombPlaced={handleBombPlaced}
        onBombExplode={handleBombExplode}
      >
        {(bombs, placeBomb, renderBomb) => (
          <PowerUpManager
            boardSize={size}
            playerPosition={{ row: currentPlayer?.row || 0, col: currentPlayer?.col || 0 }}
            maxLives={maxLives}
            currentLives={currentPlayer?.lives || 0}
            onCollect={handlePowerUpCollect}
          >
            {(renderPowerUp) => (
              <PlayerController
                initialPosition={{ row: currentPlayer?.row || 0, col: currentPlayer?.col || 0 }}
                boardSize={size}
                onPositionChange={handlePlayerMove}
                onPlaceBomb={() => placeBomb({
                  row: currentPlayer?.row || 0,
                  col: currentPlayer?.col || 0
                })}
                walls={[]}
                bombs={bombs} otherPlayers={[]}              >
                <div className="game-board">
                  {generateBoard().map((row, rowIndex) => (
                    <div className="board-row" key={rowIndex}>
                      {row.map((cell, colIndex) => {
                        const bombElement = renderBomb(rowIndex, colIndex);
                        const powerUpElement = renderPowerUp(rowIndex, colIndex);
                        return bombElement || powerUpElement || renderCell(cell, rowIndex, colIndex);
                      })}
                    </div>
                  ))}
                </div>
              </PlayerController>
            )}
          </PowerUpManager>
        )}
      </BombManager>

      {gameOver.isOver && (
        <div className="retro-game-over-card">
          <div className="retro-game-over-content">
            <h2 className={`retro-game-over-title ${currentPlayer?.lives <= 0 ? 'game-lost' : ''}`}>
              {gameOver.message}
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
                onClick={() => window.location.href = '/'}
              >
                Menú Principal
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
