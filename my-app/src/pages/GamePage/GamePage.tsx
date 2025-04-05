import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useWebSocket } from '../../components/Socket/WebSocketProvider';
import './GamePage.css';
import HUD from '../../components/Hud/Hud';
import p1 from '../../images/p1.png';
import p2 from '../../images/p2.png';
import p3 from '../../images/p3.png';
import p4 from '../../images/p4.png';

const getPlayerImage = (playerName: string) => {
  switch(playerName) {
    case '1': return p1;
    case '2': return p2;
    case '3': return p3;
    case '4': return p4;
    default: return p1;
  }
};

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'BOMB';

type GameConfig = {
  duration: number;
  lives: number;
};

type Player = {
  id: string;
  name: string;
  x: number;
  y: number;
  bombCapacity: number;
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
  config?: GameConfig;
  players: Player[];
  map?: GameMap;
};

type PlayerMoveRequest = {
  playerId: string;
  newX: number;
  newY: number;
  direction: Direction;
};

const GamePage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const location = useLocation();
  const { subscribe, isConnected, sendMessage } = useWebSocket();
  const gameContainerRef = useRef<HTMLDivElement>(null);

  const [gameState, setGameState] = useState<GameMessage | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const defaultMap = useMemo<GameMap>(() => ({
    width: 15,
    height: 13,
    cells: Array(13).fill(null).map((_, y) => 
      Array(15).fill(null).map((_, x) => ({
        x,
        y,
        isWall: x === 0 || y === 0 || x === 14 || y === 12 || (x % 2 === 0 && y % 2 === 0),
        isDestructible: false,
        hasPowerUp: false
      }))
    )
  }), []);

  const defaultConfig = useMemo<GameConfig>(() => ({
    duration: 300,
    lives: 3
  }), []);

  // Inicialización del juego
  useEffect(() => {
    console.log('Inicializando juego...');
    console.log('Datos de location.state:', location.state);

    if (location.state?.initialGameData) {
      console.log('Estableciendo datos iniciales del juego');
      setGameState({
        ...location.state.initialGameData,
        map: location.state.initialGameData.map || defaultMap,
        config: location.state.initialGameData.config || defaultConfig
      });
    }

    const playerId = location.state?.playerId || localStorage.getItem('bomberman-playerId');
    if (playerId) {
      console.log('Estableciendo ID de jugador:', playerId);
      setCurrentPlayerId(playerId);
      localStorage.setItem('bomberman-playerId', playerId);
    } else {
      console.error('No se encontró playerId en location.state ni en localStorage');
    }

    setLoading(false);
  }, [location.state, defaultMap, defaultConfig]);

  // Manejador de movimiento
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (loading || !currentPlayerId || !gameState?.map) return;

    const directionMap: Record<string, Direction> = {
      'ArrowUp': 'UP', 'KeyW': 'UP',
      'ArrowDown': 'DOWN', 'KeyS': 'DOWN',
      'ArrowLeft': 'LEFT', 'KeyA': 'LEFT',
      'ArrowRight': 'RIGHT', 'KeyD': 'RIGHT',
      'Space': 'BOMB',
    };

    const direction = directionMap[e.code];
    if (!direction) return;

    e.preventDefault();

    const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
    if (!currentPlayer) return;

    if (direction === 'BOMB') {
      sendMessage(`/app/game/${roomCode}/place-bomb`, {
        playerId: currentPlayerId,
        x: currentPlayer.x,
        y: currentPlayer.y
      });
      return;
    }

    let newX = currentPlayer.x;
    let newY = currentPlayer.y;

    switch (direction) {
      case 'UP': newY -= 1; break;
      case 'DOWN': newY += 1; break;
      case 'LEFT': newX -= 1; break;
      case 'RIGHT': newX += 1; break;
    }

    // Validar movimiento
    if (newX < 0 || newY < 0 || newX >= gameState.map.width || newY >= gameState.map.height) {
      return;
    }

    const targetCell = gameState.map.cells[newY]?.[newX];
    if (!targetCell || targetCell.isWall) {
      return;
    }

    const playerInTarget = gameState.players.some(p => 
      p.id !== currentPlayerId && p.x === newX && p.y === newY
    );
    if (playerInTarget) {
      return;
    }

    // Actualización optimista
    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        players: prev.players.map(p => 
          p.id === currentPlayerId ? { ...p, x: newX, y: newY } : p
        )
      };
    });

    // Enviar movimiento al servidor
    sendMessage<PlayerMoveRequest>(`/app/game/${roomCode}/move`, {
      playerId: currentPlayerId,
      newX,
      newY,
      direction
    });
  }, [currentPlayerId, gameState, loading, roomCode, sendMessage]);

  // Configurar listeners de teclado
  useEffect(() => {
    if (loading) return;
    const container = gameContainerRef.current;
    if (!container) return;

    container.focus();
    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, loading]);

  // Suscripción a actualizaciones del juego
  useEffect(() => {
    if (!isConnected || !roomCode || loading) return;

    const subscription = subscribe<GameMessage>(
      `/topic/game/${roomCode}`,
      (message) => {
        console.log('Mensaje recibido:', message.type);
        
        if (message.type === 'GAME_START') {
          setGameState({
            ...message,
            map: message.map || defaultMap,
            config: message.config || defaultConfig
          });
        } 
        else if (message.type === 'GAME_UPDATE') {
          setGameState(prev => {
            if (!prev) return {
              players: message.players || [],
              map: defaultMap,
              config: defaultConfig,
              type: 'GAME_UPDATE'
            };

            return {
              ...prev, // Mantiene el mapa existente
              players: message.players || prev.players,
              config: message.config || prev.config
            };
          });
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [isConnected, roomCode, subscribe, loading, defaultMap, defaultConfig]);

  // Debug: Verificar mapa actual
  useEffect(() => {
    if (gameState?.map) {
      console.log('Mapa actual:', {
        source: gameState.map === defaultMap ? 'DEFAULT' : 'SERVER',
        width: gameState.map.width,
        height: gameState.map.height
      });
    }
  }, [gameState?.map, defaultMap]);

  if (loading || !gameState || !currentPlayerId) {
    return (
      <div className="game-loading">
        <h2>Sala: {roomCode}</h2>
        <p>Cargando juego...</p>
        <div className="debug-info">
          <p>Estado de carga:</p>
          <ul>
            <li>GameState: {gameState ? 'Cargado' : 'No cargado'}</li>
            <li>PlayerID: {currentPlayerId || 'No definido'}</li>
            <li>Conexión WebSocket: {isConnected ? 'Activa' : 'Inactiva'}</li>
            <li>Mapa: {gameState?.map ? 'Cargado' : 'No cargado'}</li>
          </ul>
        </div>
      </div>
    );
  }

  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
  const displayMap = gameState.map || defaultMap;
  const displayConfig = gameState.config || defaultConfig;

  return (
    <div className="game-container" ref={gameContainerRef} tabIndex={0}>
      <div className="game-header">
        <HUD
          initialTime={displayConfig.duration}
          roomCode={roomCode || ''}
          lives={displayConfig.lives}
          isRunning={true}
          onTimeEnd={() => {
            console.log('¡Se acabó el tiempo!');
          }}
        />
        {currentPlayer && (
          <div className="player-bombs">
            Bombas: {currentPlayer.bombCapacity}
          </div>
        )}
      </div>
      
      <div 
        className="game-map"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${displayMap.width}, 32px)`,
          gridTemplateRows: `repeat(${displayMap.height}, 32px)`,
          gap: '2px',
          backgroundColor: '#111',
          padding: '10px',
          borderRadius: '8px'
        }}
      >
        {displayMap.cells.map((row, y) => (
          <React.Fragment key={`row-${y}`}>
            {row.map((cell, x) => {
              const cellType = cell?.isWall 
                ? cell?.isDestructible ? 'destructible' : 'wall' 
                : 'empty';
              const player = gameState.players.find(p => p.x === x && p.y === y);
              
              return (
                <div key={`cell-${x}-${y}`} className={`game-cell ${cellType}`}>
                  {player && (
                    <div className={`game-player player-${player.name} ${
                      player.id === currentPlayerId ? 'current-player' : ''
                    }`}>
                      <img 
                        src={getPlayerImage(player.name)} 
                        alt={`Jugador ${player.name}`}
                        className="player-avatar"
                      />
                      {player.id === currentPlayerId && (
                        <div className="player-indicator"></div>
                      )}
                    </div>
                  )}
                  {cell?.hasPowerUp && !player && (
                    <div className="game-power-up" />
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <div className="game-controls">
        <p>Controles: Flechas o WASD para mover, Espacio para bombas</p>
        <p className="player-info">
          Jugador: <span className="player-name">{currentPlayer?.name || currentPlayerId}</span>
        </p>
      </div>
    </div>
  );
};

export default GamePage;