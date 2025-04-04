import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Board from "../../components/Board/Board";
import './GamePage.css';
import { Client } from '@stomp/stompjs';

interface GameConfig {
  duration?: number;
  players?: number;
  lives?: number;
}

interface Player {
  id: string;
  name: string;
  row: number;
  col: number;
  lives: number;
}

const GamePage: React.FC = () => {
  const location = useLocation();
  const { roomCode, config: initialConfig, players: initialPlayers } = location.state || {};
  const [gameConfig, setGameConfig] = useState<GameConfig>(initialConfig || {});
  const [players, setPlayers] = useState<Player[]>(initialPlayers || []);
  const stompClientRef = useRef<Client | null>(null);
  const [loading, setLoading] = useState(!initialPlayers);

  useEffect(() => {
    // Si ya tenemos los datos iniciales, no necesitamos conectar de nuevo
    if (initialPlayers && initialPlayers.length > 0) {
      setLoading(false);
      return;
    }

    console.log(`Initializing WebSocket for room ${roomCode}`);
    
    const stompClient = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      debug: (str) => console.debug(str),
      connectHeaders: {
        'heart-beat': '10000,10000'
      }
    });

    stompClient.onConnect = () => {
      console.log(`Connected to room ${roomCode}`);
      
      const subscriptionId = `sub-${roomCode}-${Date.now()}`;
      
      stompClient.subscribe(
        `/topic/room/${roomCode}`,
        (message) => {
          try {
            const data = JSON.parse(message.body);
            console.log('Received game data:', data);
            
            if (data.type === "GAME_START") {
              setGameConfig(data.config || {});
              setPlayers(data.players || []);
              setLoading(false);
            }
          } catch (error) {
            console.error('Error parsing message:', error);
            setLoading(false);
          }
        },
        { id: subscriptionId }
      );

      // Solicitar el estado actual del juego
      stompClient.publish({
        destination: `/app/room/${roomCode}/status`,
        body: JSON.stringify({}),
        headers: { 'content-type': 'application/json' }
      });
    };

    stompClient.onDisconnect = () => {
      console.log(`Disconnected from room ${roomCode}`);
    };

    stompClient.onStompError = (frame) => {
      console.error('Broker reported error:', frame.headers.message);
      setLoading(false);
    };

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      console.log(`Cleaning up WebSocket for room ${roomCode}`);
      if (stompClientRef.current?.connected) {
        stompClientRef.current.deactivate();
      }
    };
  }, [roomCode, initialPlayers]);

  if (loading) {
    return (
      <div className="game-page">
        <div className="loading-message">
          <p>Conectando al juego...</p>
          <p>Por favor espere</p>
        </div>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="game-page">
        <div className="error-message">
          <p>No se pudieron cargar los datos del juego</p>
          <button onClick={() => window.location.href = '/'}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-page">
      <Board 
        config={gameConfig} 
        players={players}
        roomCode={roomCode}
      />
    </div>
  );
};

export default GamePage;