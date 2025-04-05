import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../Socket/WebSocketProvider'; // Asegúrate de que la ruta sea correcta
import './Board.css';

// Tipos TypeScript mejorados
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

type GameMessageType = 'GAME_START' | 'GAME_UPDATE' | 'GAME_OVER';

type GameMessage = {
  type: GameMessageType;
  config: GameConfig;
  players: Player[];
  map: GameMap;
};

interface BombermanGameProps {
  roomCode: string;
}

const BombermanGame: React.FC<BombermanGameProps> = ({ roomCode }) => {
  const [gameState, setGameState] = useState<GameMessage | null>(null);
  const { subscribe, isConnected } = useWebSocket();

  useEffect(() => {
    if (!isConnected) return;

    const handleGameMessage = (message: GameMessage) => {
      if (message.type === 'GAME_START' || message.type === 'GAME_UPDATE') {
        setGameState(message);
      }
    };

    const subscription = subscribe<GameMessage>(
      `/topic/game/${roomCode}`, 
      handleGameMessage
    );

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [subscribe, isConnected, roomCode]);

  if (!gameState) {
    return <div className="loading-message">Cargando juego...</div>;
  }

  return (
    <div className="game-container">
      <GameInfo config={gameState.config} playerCount={gameState.players.length} />
      <GameMapDisplay map={gameState.map} players={gameState.players} />
    </div>
  );
};

// Componente de información del juego
const GameInfo: React.FC<{ config: GameConfig; playerCount: number }> = ({ config, playerCount }) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="info-container">
      <div className="info-item">Tiempo: {formatTime(config.duration)}</div>
      <div className="info-item">Vidas: {config.lives}</div>
      <div className="info-item">Jugadores: {playerCount}</div>
    </div>
  );
};

// Componente del mapa del juego
const GameMapDisplay: React.FC<{ map: GameMap; players: Player[] }> = ({ map, players }) => {
  return (
    <div 
      className="map-container"
      style={{
        gridTemplateColumns: `repeat(${map.width}, 32px)`,
        gridTemplateRows: `repeat(${map.height}, 32px)`
      }}
    >
      {map.cells.map((row, y) => (
        <React.Fragment key={`row-${y}`}>
          {row.map((cell, x) => (
            <CellComponent 
              key={`cell-${x}-${y}`} 
              cell={cell} 
              player={players.find(p => p.x === x && p.y === y)}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

// Componente de celda individual
type CellType = 'empty' | 'wall' | 'destructible';

const CellComponent: React.FC<{ cell: GameCell; player?: Player }> = ({ cell, player }) => {
  const getCellType = (): CellType => {
    if (cell.isWall) {
      return cell.isDestructible ? 'destructible' : 'wall';
    }
    return 'empty';
  };

  const cellType = getCellType();
  const playerColor = player?.name === '1' ? 'player-1' : 'player-2';

  return (
    <div className={`cell ${cellType}`}>
      {player && <div className={`player-indicator ${playerColor}`} />}
      {cell.hasPowerUp && !player && <div className="power-up-indicator" />}
    </div>
  );
};

export default BombermanGame;