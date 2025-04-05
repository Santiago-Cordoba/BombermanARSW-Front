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
  maxBombs: number;
  bombRange: number;
};

type GameCell = {
  isDestructible: boolean;
  hasPowerUp: boolean;
  powerUpType?: 'BOMB' | 'FIRE' | 'SPEED';
  x: number;
  y: number;
  isWall: boolean;
};

type Bomb = {
  id: string;
  x: number;
  y: number;
  range: number;
  timer: number;
  playerId: string;
};

type Explosion = {
  x: number;
  y: number;
  timer: number;
  isCenter?: boolean;
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
  const animationRef = useRef<number>(0);

  const [gameState, setGameState] = useState<GameMessage | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [bombs, setBombs] = useState<Bomb[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [localPowerUps, setLocalPowerUps] = useState<{x: number, y: number, type: 'BOMB' | 'FIRE' | 'SPEED'}[]>([]);

  const defaultMap = useMemo<GameMap>(() => ({
    width: 15,
    height: 13,
    cells: Array(13).fill(null).map((_, y) => 
      Array(15).fill(null).map((_, x) => ({
        x,
        y,
        isWall: x === 0 || y === 0 || x === 14 || y === 12 || (x % 2 === 0 && y % 2 === 0),
        isDestructible: Math.random() < 0.3 && !(x % 2 === 0 && y % 2 === 0),
        hasPowerUp: Math.random() < 0.1,
        powerUpType: ['BOMB', 'FIRE', 'SPEED'][Math.floor(Math.random() * 3)] as 'BOMB' | 'FIRE' | 'SPEED'
      }))
    )
  }), []);

  const defaultConfig = useMemo<GameConfig>(() => ({
    duration: 300,
    lives: 3
  }), []);

  const gameLoop = useCallback(() => {
    setBombs(prevBombs => {
      const updatedBombs = prevBombs.map(bomb => ({
        ...bomb,
        timer: bomb.timer - 1
      })).filter(bomb => bomb.timer > 0);

      const explodedBombs = prevBombs.filter(bomb => bomb.timer <= 0 && !updatedBombs.some(b => b.id === bomb.id));

      if (explodedBombs.length > 0) {
        const newExplosions: Explosion[] = [];
        
        explodedBombs.forEach(bomb => {
          newExplosions.push({ 
            x: bomb.x, 
            y: bomb.y, 
            timer: 20,
            isCenter: true 
          });
          
          for (let i = 1; i <= bomb.range; i++) {
            if (bomb.y - i >= 0) newExplosions.push({ x: bomb.x, y: bomb.y - i, timer: 20, isCenter: false });
            if (bomb.y + i < defaultMap.height) newExplosions.push({ x: bomb.x, y: bomb.y + i, timer: 20, isCenter: false });
            if (bomb.x - i >= 0) newExplosions.push({ x: bomb.x - i, y: bomb.y, timer: 20, isCenter: false });
            if (bomb.x + i < defaultMap.width) newExplosions.push({ x: bomb.x + i, y: bomb.y, timer: 20, isCenter: false });
          }
        });

        setExplosions(prev => [...prev, ...newExplosions]);
        
        if (gameState) {
          const playersInExplosion = gameState.players.filter(player => 
            newExplosions.some(exp => exp.x === player.x && exp.y === player.y)
          );
          
          if (playersInExplosion.length > 0) {
            console.log('Jugadores afectados por explosión:', playersInExplosion);
          }
        }
        
        setLocalPowerUps(prev => {
          const newPowerUps = [...prev];
          
          newExplosions.forEach(exp => {
            const cell = defaultMap.cells[exp.y]?.[exp.x];
            if (cell?.isDestructible) {
              if (cell.hasPowerUp && cell.powerUpType) {
                newPowerUps.push({
                  x: exp.x,
                  y: exp.y,
                  type: cell.powerUpType
                });
              }
            }
          });
          
          return newPowerUps;
        });
      }

      return updatedBombs;
    });

    setExplosions(prev => 
      prev.map(exp => ({
        ...exp,
        timer: exp.timer - 1
      })).filter(exp => exp.timer > 0)
    );

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [defaultMap, gameState]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameLoop]);

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

  const placeBomb = useCallback((playerId: string, x: number, y: number) => {
    const currentPlayer = gameState?.players.find(p => p.id === playerId);
    if (!currentPlayer) return;

    const activeBombs = bombs.filter(b => b.playerId === playerId);
    if (activeBombs.length >= currentPlayer.maxBombs) return;

    const newBomb: Bomb = {
      id: `bomb-${Date.now()}`,
      x,
      y,
      range: currentPlayer.bombRange,
      timer: 120,
      playerId
    };

    setBombs(prev => [...prev, newBomb]);
  }, [bombs, gameState?.players]);

  const collectPowerUp = useCallback((playerId: string, x: number, y: number) => {
    const powerUpIndex = localPowerUps.findIndex(pu => pu.x === x && pu.y === y);
    if (powerUpIndex === -1) return;

    const powerUp = localPowerUps[powerUpIndex];
    setGameState(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        players: prev.players.map(p => {
          if (p.id !== playerId) return p;
          
          switch (powerUp.type) {
            case 'BOMB':
              return { ...p, maxBombs: p.maxBombs + 1 };
            case 'FIRE':
              return { ...p, bombRange: p.bombRange + 1 };
            case 'SPEED':
              return p;
            default:
              return p;
          }
        })
      };
    });

    setLocalPowerUps(prev => prev.filter((_, i) => i !== powerUpIndex));
  }, [localPowerUps]);

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
      placeBomb(currentPlayerId, currentPlayer.x, currentPlayer.y);
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

    if (newX < 0 || newY < 0 || newX >= gameState.map.width || newY >= gameState.map.height) {
      return;
    }

    const targetCell = gameState.map.cells[newY]?.[newX];
    if (!targetCell || targetCell.isWall) {
      return;
    }

    const bombInTarget = bombs.some(b => b.x === newX && b.y === newY);
    if (bombInTarget) {
      return;
    }

    const playerInTarget = gameState.players.some(p => 
      p.id !== currentPlayerId && p.x === newX && p.y === newY
    );
    if (playerInTarget) {
      return;
    }

    const powerUpInTarget = localPowerUps.some(pu => pu.x === newX && pu.y === newY);
    if (powerUpInTarget) {
      collectPowerUp(currentPlayerId, newX, newY);
    }

    sendMessage<PlayerMoveRequest>(`/app/game/${roomCode}/move`, {
      playerId: currentPlayerId,
      newX,
      newY,
      direction
    });
  }, [currentPlayerId, gameState, loading, placeBomb, collectPowerUp, bombs, localPowerUps, roomCode, sendMessage]);

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
              ...prev,
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

  if (loading || !gameState || !currentPlayerId) {
    return (
      <div className="game-loading">
        <h2>Sala: {roomCode}</h2>
        <p>Cargando juego...</p>
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
          onTimeEnd={() => console.log('¡Se acabó el tiempo!')}
        />
        {currentPlayer && (
          <div className="player-stats">
            <div className="player-bombs">
              Bombas: {currentPlayer.maxBombs - bombs.filter(b => b.playerId === currentPlayerId).length}/{currentPlayer.maxBombs}
            </div>
            <div className="player-range">
              Rango: {currentPlayer.bombRange}
            </div>
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
              const bomb = bombs.find(b => b.x === x && b.y === y);
              const explosion = explosions.find(e => e.x === x && e.y === y);
              const powerUp = localPowerUps.find(pu => pu.x === x && pu.y === y);
              
              return (
                <div 
                  key={`cell-${x}-${y}`} 
                  className={`game-cell ${cellType} ${
                    explosion ? 'explosion' : ''
                  } ${
                    explosion?.isCenter ? 'explosion-center' : explosion ? 'explosion-arm' : ''
                  }`}
                >
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
                  
                  {bomb && !player && !explosion && (
                    <div className="game-bomb" />
                  )}
                  
                  {powerUp && !player && !bomb && !explosion && (
                    <div className={`game-power-up ${powerUp.type.toLowerCase()}`}>
                      {powerUp.type === 'BOMB' && 'B+'}
                      {powerUp.type === 'FIRE' && 'F+'}
                      {powerUp.type === 'SPEED' && 'S+'}
                    </div>
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
        <div className="power-up-legend">
          <div className="legend-item">
            <span className="power-up-icon bomb">B+</span> = Más bombas
          </div>
          <div className="legend-item">
            <span className="power-up-icon fire">F+</span> = Mayor rango
          </div>
          <div className="legend-item">
            <span className="power-up-icon speed">S+</span> = Más velocidad
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;