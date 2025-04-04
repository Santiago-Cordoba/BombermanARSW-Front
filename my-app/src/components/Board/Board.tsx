import React, { useState, useEffect, useRef } from "react";
import { Client } from '@stomp/stompjs';
import HUD from "../Hud/Hud";
import { PlayerController } from "../playerMove/PlayerMovement";
import { SoundPlayer } from "../SoundBomb";
import { BombManager } from "../bomb/bomb";
import playerImage from "../../images/p1.png";
import player2Image from "../../images/p2.png";
import player3Image from "../../images/p3.png";
import player4Image from "../../images/p4.png";
import wallImage from '../../images/wall.png';
import boomSound from '../../assets/sounds/boom2.mp3';
import "./Board.css";
import "../Hud/Hud.css";

interface Position {
  row: number;
  col: number;
}

interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
  lives: number;
  isCurrent?: boolean;
  isHost?: boolean;
}

interface GameState {
  board: string[][];
  players: Player[];
  config: {
    duration: number;
    lives: number;
  };
  timeLeft: number;
  gameOver: boolean;
}

interface BoardProps {
  roomCode: string;
  currentPlayerId: string;
}

const Board: React.FC<BoardProps> = ({ roomCode, currentPlayerId }) => {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(15).fill(0).map(() => Array(15).fill('0')),
    players: [],
    config: { duration: 3, lives: 3 },
    timeLeft: 180,
    gameOver: false
  });

  const [shouldPlayBoomSound, setShouldPlayBoomSound] = useState(false);
  const [explosions, setExplosions] = useState<Position[]>([]);
  const stompClient = useRef<Client | null>(null);
  const currentPlayer = useRef<Player | null>(null);

  // Configurar conexión WebSocket
  useEffect(() => {
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      debug: (str) => console.log('[WS]', str),
      onConnect: () => {
        client.subscribe(`/topic/room/${roomCode}`, (message) => {
          const data = JSON.parse(message.body);
          console.log("MENSAJE RECIBIDO:", data);

          if (data.type === "GAME_STATE" || data.type === "GAME_START") {
            console.log("TABLERO RECIBIDO:", data.board); 
            const players = data.players.map((p: any) => ({
              ...p,
              isCurrent: p.id === currentPlayerId
            }));
            
            setGameState(prev => ({
              ...prev,
              board: data.board || prev.board,
              players: players,
              config: data.config || prev.config,
              timeLeft: data.timeLeft || prev.timeLeft,
              gameOver: data.gameOver || false
            }));
            
            currentPlayer.current = players.find((p: Player) => p.isCurrent);
          }
        });

        client.subscribe(`/topic/room/${roomCode}/movement`, (message) => {
          const data = JSON.parse(message.body);
          if (data.type === "PLAYER_MOVED") {
            setGameState(prev => {
              const updatedPlayers = prev.players.map(p => 
                p.id === data.playerId ? { ...p, x: data.x, y: data.y } : p
              );
              return { ...prev, players: updatedPlayers };
            });
          }
        });
      }
    });

    stompClient.current = client;
    client.activate();

    return () => {
      client.deactivate();
    };
  }, [roomCode, currentPlayerId]);

  const getPlayerImage = (playerId: string) => {
    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    switch(playerIndex % 4) {
      case 0: return playerImage;
      case 1: return player2Image;
      case 2: return player3Image;
      case 3: return player4Image;
      default: return playerImage;
    }
  };

  const renderCell = (cell: string, row: number, col: number) => {
    const cellKey = `cell-${row}-${col}`; // Key única para cada celda
  
    // Verificar si hay un jugador
    const player = gameState.players.find(p => p.x === row && p.y === col && p.lives > 0);
    if (player) {
      return (
        <div 
          key={`player-${player.id}-${cellKey}`}
          className={`game-cell player ${player.isCurrent ? 'current-player' : ''}`}
          style={{ 
            backgroundImage: `url(${getPlayerImage(player.id)})`,
            border: player.isCurrent ? '2px solid yellow' : 'none'
          }}
          title={`${player.name} (${player.lives} vidas)`}
        />
      );
    }
  
    // Renderizar otros elementos
    switch(cell) {
      case '0': 
        return <div key={`empty-${cellKey}`} className="game-cell empty-cell" />;
      case '1':
        return (
          <div 
            key={`wall-${cellKey}`}
            className="game-cell wall" 
            style={{ backgroundImage: `url(${wallImage})` }}
          />
        );
      // ... otros casos similares
    }
  };
  
  const handlePlayerMove = (newPosition: Position) => {
    if (!stompClient.current || !stompClient.current.connected) return;
    
    stompClient.current.publish({
      destination: `/app/room/${roomCode}/move`,
      body: JSON.stringify({
        playerId: currentPlayerId,
        x: newPosition.row,
        y: newPosition.col
      })
    });
  };

  const handleBombPlaced = () => {
    setShouldPlayBoomSound(true);
    setTimeout(() => setShouldPlayBoomSound(false), 100);
  };

  const handleBombExplode = (position: Position) => {
    if (!stompClient.current || !stompClient.current.connected) return;
    
    stompClient.current.publish({
      destination: `/app/room/${roomCode}/bomb`,
      body: JSON.stringify({
        playerId: currentPlayerId,
        position: position
      })
    });
  };

  return (
    <div className="game-board-container">
      <SoundPlayer 
        soundFile={boomSound}
        playCondition={shouldPlayBoomSound}
        volume={0.4}
      />
      
      <HUD 
        timeLeft={formatTime(gameState.timeLeft)}
        score={0}
        roomCode={roomCode}
        lives={currentPlayer.current?.lives || 0}
      />
      
      <BombManager 
        onBombPlaced={handleBombPlaced}
        onBombExplode={handleBombExplode}
        stompClient={stompClient.current}
        roomCode={roomCode}
        playerId={currentPlayerId}
      >
        {(bombs, placeBomb, renderBomb) => (
          <PlayerController
            initialPosition={{
              row: currentPlayer.current?.x || 0,
              col: currentPlayer.current?.y || 0
            }}
            boardSize={15}
            onPositionChange={handlePlayerMove}
            onPlaceBomb={() => {
              if (currentPlayer.current) {
                placeBomb({
                  row: currentPlayer.current.x,
                  col: currentPlayer.current.y
                });
              }
            } }
            walls={[]}
            bombs={bombs} otherPlayers={[]}            //otherPlayers={gameState.players.filter(p => !p.isCurrent)}
          >
            <div className="game-board">
              {gameState.board.map((row, rowIndex) => (
                <div className="board-row" key={rowIndex}>
                  {row.map((cell, colIndex) => {
                    const bombElement = renderBomb(rowIndex, colIndex);
                    return bombElement || renderCell(cell, rowIndex, colIndex);
                  })}
                </div>
              ))}
            </div>
          </PlayerController>
        )}
      </BombManager>

      {gameState.gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-content">
            <h2>
              {currentPlayer.current?.lives === 0 ? '¡HAS PERDIDO!' : '¡HAS GANADO!'}
            </h2>
            <button onClick={() => window.location.reload()}>
              Jugar de nuevo
            </button>
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