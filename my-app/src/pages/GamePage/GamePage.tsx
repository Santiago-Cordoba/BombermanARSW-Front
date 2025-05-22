import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useWebSocket } from '../../components/Socket/WebSocketProvider';
import './GamePage.css';
import HUD from '../../components/Hud/Hud';
import p1 from '../../images/p1.png';
import p2 from '../../images/p2.png';
import p3 from '../../images/p3.png';
import p4 from '../../images/p4.png';
import { PowerUpManager } from '../../components/powerupLife';
import { GameOverCard } from '../../components/gameOver/gameOver';
import Explosion from '../../components/Explosion/Explosion';

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
  lives: number;
};

export type GameCell = {
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
  bombs?: { 
    id: string;
    x: number;
    y: number;
    timer: number;
    range: number;
    playerId: string;
  }[];
  powerUps?: {  
    type: 'BOMB' | 'FIRE' | 'SPEED';
    x: number;
    y: number;
  }[];
  x?: number;
  y?: number;
  range?: number;
  affectedPlayers?: string[];
  destroyedWalls?: {x: number, y: number}[];
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
  const { initialGameData } = location.state || {};
  const [gameResult, setGameResult] = useState<{show: boolean; message: string; players?: {name: string, isCurrentPlayer: boolean}[]}>({show: false, message: ''});
  const [activeExplosions, setActiveExplosions] = useState<Array<{x: number; y: number; range: number; id: string}>>([]);
  const [gameState, setGameState] = useState<GameMessage | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [bombs, setBombs] = useState<Bomb[]>([]);
  const [localPowerUps, setLocalPowerUps] = useState<{x: number, y: number, type: 'BOMB' | 'FIRE' | 'SPEED'}[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(initialGameData?.config?.duration || 180);
  const [playerLives, setPlayerLives] = useState<number>(3);
  const [gameActive, setGameActive] = useState<boolean>(true);

  const defaultMap = useMemo<GameMap>(() => ({
    width: 15,
    height: 13,
    cells: Array(13).fill(null).map((_, y) => 
      Array(15).fill(null).map((_, x) => ({
        x,
        y,
        isWall: x === 0 || y === 0 || x === 14 || y === 12 || (x % 2 === 0 && y % 2 === 0),
        isDestructible: Math.random() < 0.3 && !(x % 2 === 0 && y % 2 === 0),
        hasPowerUp: false,
        powerUpType: ['BOMB', 'FIRE', 'SPEED'][Math.floor(Math.random() * 3)] as 'BOMB' | 'FIRE' | 'SPEED'
      }))
    )
  }), []);

  const defaultConfig = useMemo<GameConfig>(() => ({
    duration: 300,
    lives: 3
  }), []);

  const handleExplosion = (x: number, y: number, range: number) => {
    const explosionId = `explosion-${x}-${y}-${Date.now()}`;
    
    setActiveExplosions(prev => [...prev, { x, y, range, id: explosionId }]);
    setTimeout(() => {
      setActiveExplosions(prev => prev.filter(e => e.id !== explosionId));
    }, 500);
  };

  const gameLoop = useCallback(() => {
    setBombs(prevBombs => {
      const updatedBombs = prevBombs.map(bomb => ({
        ...bomb,
        timer: bomb.timer > 0 ? bomb.timer - 0.016 : 0
      })).filter(bomb => bomb.timer > 0);

      const explodedBombs = prevBombs.filter(bomb => 
        bomb.timer <= 0 && !updatedBombs.some(b => b.id === bomb.id)
      );

      explodedBombs.forEach(bomb => {
        handleExplosion(bomb.x, bomb.y, bomb.range);
      });

      return updatedBombs;
    });

    animationRef.current = requestAnimationFrame(gameLoop);
  }, []);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameLoop]);

  useEffect(() => {
    if (!gameActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          const activePlayers = gameState?.players?.filter(p => p.lives > 0) || [];
          if (activePlayers.length > 1) {
            setGameResult({
              show: true,
              message: '¡EMPATE POR TIEMPO!',
              players: activePlayers.map(p => ({
                name: p.name,
                isCurrentPlayer: p.id === currentPlayerId
              }))
            });
            setGameActive(false);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive, gameState?.players, currentPlayerId]);

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

    const newBomb = {
      id: `bomb-${x}-${y}-${Date.now()}`,
      x,
      y,
      range: currentPlayer.bombRange,
      timer: 2,
      playerId
    };
    
    setBombs(prev => [...prev, newBomb]);

    sendMessage(`/app/game/${roomCode}/placeBomb`, {
      playerId: currentPlayerId,
      x,
      y
    });
  }, [gameState?.players, bombs, currentPlayerId, roomCode, sendMessage]);

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
      const existingBomb = bombs.find(b => b.x === currentPlayer.x && b.y === currentPlayer.y);
      if (!existingBomb) {
        placeBomb(currentPlayerId, currentPlayer.x, currentPlayer.y);
      }
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
          setTimeLeft(message.config?.duration || 300);
          setPlayerLives(message.config?.lives || 3);
          setGameActive(true);
        } 
        else if (message.type === 'GAME_UPDATE') {
          setBombs(prevBombs => {
            const newBombs = message.bombs?.map(b => ({
              id: b.id || `bomb-${b.x}-${b.y}-${Date.now()}`,
              x: b.x,
              y: b.y,
              range: b.range || 1,
              timer: b.timer || 2,
              playerId: b.playerId
            })) || [];

            if (message.powerUps) {
              setLocalPowerUps(message.powerUps.map(pu => ({
                x: pu.x,
                y: pu.y,
                type: pu.type
              })));
            }
                      
            return [
              ...prevBombs.filter(pb => 
                !newBombs.some(nb => nb.x === pb.x && nb.y === pb.y)
              ),
              ...newBombs
            ];
          });

          const activePlayers = message.players?.filter(p => p.lives > 0) || [];
          if (activePlayers.length === 1 && gameActive) {
              const winner = activePlayers[0];
              setGameResult({
                show: true,
                message: winner.id === currentPlayerId ? '¡HAS GANADO!' : `¡${winner.name} HA GANADO!`,
                players: [{
                  name: winner.name,
                  isCurrentPlayer: winner.id === currentPlayerId
                }]
              });
              setGameActive(false);
            }
           else if (timeLeft <= 0 && activePlayers.length > 1 && gameActive) {
            setGameResult({
              show: true,
              message: '¡EMPATE POR TIEMPO!',
              players: activePlayers.map(p => ({
                name: p.name,
                isCurrentPlayer: p.id === currentPlayerId
              }))
            });
            setGameActive(false);
          }
          
          if (message.config) {
            setTimeLeft(message.config.duration);
          }
          
          if (currentPlayerId) {
            const currentPlayer = message.players?.find(p => p.id === currentPlayerId);
            if (currentPlayer) {
              setPlayerLives(currentPlayer.lives);
            }
          }

          setGameState(prev => ({
            ...prev,
            players: message.players || prev?.players || [],
            config: message.config || prev?.config || defaultConfig,
            type: 'GAME_UPDATE'
          }));
        }
        else if (message.type === 'EXPLOSION') {
          if (message.x !== undefined && message.y !== undefined && message.range !== undefined) {
            handleExplosion(message.x, message.y, message.range);
            
            setGameState(prev => {
              if (!prev) return null;
              
              const updatedBombs = prev.bombs?.filter(b => 
                !(b.x === message.x && b.y === message.y)
              ) || [];
              
              const updatedPlayers = prev.players.map(p => {
                if (message.affectedPlayers?.includes(p.id)) {
                  return { ...p, lives: p.lives - 1 };
                }
                return p;
              }).filter(p => p.lives > 0);
              
              const updatedCells = [...prev.map.cells];
              message.destroyedWalls?.forEach(({x, y}) => {
                if (updatedCells[y]?.[x]) {
                  updatedCells[y][x].isWall = false;
                  updatedCells[y][x].isDestructible = false;
                }
              });
              
              return {
                ...prev,
                bombs: updatedBombs,
                players: updatedPlayers,
                map: {
                  ...prev.map,
                  cells: updatedCells
                }
              };
            });
          }
        }
      }
    );
  
    return () => {
      subscription?.unsubscribe();
      setGameActive(false);
    };
  }, [isConnected, roomCode, subscribe, loading, defaultMap, defaultConfig, currentPlayerId, gameActive, timeLeft]);

  useEffect(() => {
    if (!gameState || !currentPlayerId) return;

    const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
    if (!currentPlayer) return;

    const isInExplosion = activeExplosions.some(e => 
      Math.abs(e.x - currentPlayer.x) <= e.range && 
      Math.abs(e.y - currentPlayer.y) <= e.range
    );

    if (isInExplosion) {
      setPlayerLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameActive(false);
          setGameResult({
            show: true,
            message: '¡HAS PERDIDO!',
            players: gameState.players
              .filter(p => p.lives > 0)
              .map(p => ({
                name: p.name,
                isCurrentPlayer: p.id === currentPlayerId
              }))
          });
        }
        return newLives;
      });
    }
  }, [activeExplosions, currentPlayerId, gameState]);

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
          time={timeLeft}
          roomCode={roomCode || ''}
          lives={playerLives}
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
        <PowerUpManager
          boardSize={displayMap.width}
          playerPosition={{
            row: currentPlayer?.y || 0,
            col: currentPlayer?.x || 0
          }}
          maxLives={displayConfig.lives}
          currentLives={playerLives}
          onCollect={() => {
            if (currentPlayerId) {
              sendMessage(`/app/game/${roomCode}/collectLife`, {
                playerId: currentPlayerId
              });
            }
          }}
          gameMap={displayMap.cells}
        >
          {(renderPowerUp) => (
            <>
              {displayMap.cells.map((row, y) => (
                <React.Fragment key={`row-${y}`}>
                  {row.map((cell, x) => {
                    const cellType = cell?.isWall 
                      ? cell?.isDestructible ? 'destructible' : 'wall' 
                      : 'empty';
                    
                    const player = gameState.players.find(p => p.x === x && p.y === y);
                    const bomb = bombs.find(b => b.x === x && b.y === y);
                    const powerUp = localPowerUps.find(pu => pu.x === x && pu.y === y);
                    const explosionInCell = activeExplosions.some(e => e.x === x && e.y === y);
                    
                    return (
                      <div 
                        key={`cell-${x}-${y}`} 
                        className={`game-cell ${cellType}`}
                      >
                        {player && gameState.players.some(p => p.id === player.id) && (
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
                        
                        {bomb && !explosionInCell && (
                          <div className="game-bomb" />
                        )}
                        
                        {powerUp && !bomb && !explosionInCell && (
                          <div className={`game-power-up ${powerUp.type.toLowerCase()}`}>
                            {powerUp.type === 'BOMB' && 'B+'}
                            {powerUp.type === 'FIRE' && 'F+'}
                            {powerUp.type === 'SPEED' && 'S+'}
                          </div>
                        )}

                        {explosionInCell && (
                          <Explosion 
                            x={x} 
                            y={y} 
                            range={activeExplosions.find(e => e.x === x && e.y === y)?.range || 1} 
                          />
                        )}

                        {renderPowerUp(y, x)}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </>
          )}
        </PowerUpManager>
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
          <div className="legend-item">
            <span className="power-up-icon life">❤️</span> = Vida extra
          </div>
        </div>
      </div>

      {gameResult.show && (
        <GameOverCard 
          message={gameResult.message}
          players={gameResult.players}
          onClose={() => {
            setGameResult({show: false, message: ''});
          }}
        />
      )}
    </div>
  );
};

export default GamePage;