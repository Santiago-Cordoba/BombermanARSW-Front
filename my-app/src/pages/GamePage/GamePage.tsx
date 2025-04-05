import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useWebSocket } from '../../components/Socket/WebSocketProvider';
import './GamePage.css';

// Tipos mejorados
type GameConfig = {
  duration: number;
  lives: number;
};

type Player = {
  id: string;
  name: string;
  x: number;
  y: number;
};

type GameCell = {
  isDestructible: boolean;
  hasPowerUp: boolean;
  x: number;
  y: number;
  isWall: boolean;
};

type GameMap = {
  width: number;
  height: number;
  cells: GameCell[][];
};

type GameMessage = {
  type: string;
  config: GameConfig;
  players: Player[];
  map: GameMap;
};

const GamePage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const location = useLocation();
  const [gameState, setGameState] = useState<GameMessage | null>(null);
  const { subscribe, isConnected } = useWebSocket();

  useEffect(() => {
    if (!isConnected || !roomCode) return;

    // Verificar si ya tenemos datos iniciales
    if (location.state?.initialGameData) {
      setGameState(location.state.initialGameData);
    }

    const subscription = subscribe<GameMessage>(
      `/topic/game/${roomCode}`,
      (message) => {
        if (message.type === 'GAME_START' || message.type === 'GAME_UPDATE') {
          setGameState(message);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [isConnected, roomCode, subscribe, location.state]);

  if (!gameState) {
    return (
      <div className="game-loading">
        <h2>Sala: {roomCode}</h2>
        <p>Cargando juego...</p>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <h2>Sala: {roomCode}</h2>
        <div className="game-info">
          <span>Tiempo: {Math.floor(gameState.config.duration / 60)}:{String(gameState.config.duration % 60).padStart(2, '0')}</span>
          <span>Vidas: {gameState.config.lives}</span>
        </div>
      </div>
      
      <div 
        className="game-map"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gameState.map.width}, 32px)`,
          gridTemplateRows: `repeat(${gameState.map.height}, 32px)`,
          gap: '2px',
          backgroundColor: '#111',
          padding: '10px',
          borderRadius: '8px'
        }}
      >
        {gameState.map.cells.map((row, y) => (
          <React.Fragment key={`row-${y}`}>
            {row.map((cell, x) => {
              const cellType = cell.isWall 
                ? cell.isDestructible ? 'destructible' : 'wall' 
                : 'empty';
              const player = gameState.players.find(p => p.x === x && p.y === y);
              
              return (
                <div 
                  key={`cell-${x}-${y}`}
                  className={`game-cell ${cellType}`}
                >
                  {player && (
                    <div className={`game-player player-${player.name}`} />
                  )}
                  {cell.hasPowerUp && !player && (
                    <div className="game-power-up" />
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default GamePage;