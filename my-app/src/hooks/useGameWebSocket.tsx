// src/hooks/useGameWebSocket.ts
import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';

interface WebSocketConfig {
  roomCode: string;
  onBombPlaced: (position: { row: number; col: number }) => void;
  onPlayerUpdate: (players: any[]) => void;
}

export const useGameWebSocket = (config: WebSocketConfig) => {
  const stompClient = useRef<Client | null>(null);

  useEffect(() => {
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      debug: (str) => console.debug(str),
    });

    client.onConnect = () => {
      client.subscribe(`/topic/room/${config.roomCode}/bombs`, (message) => {
        const data = JSON.parse(message.body);
        if (data.type === 'BOMB_PLACED') {
          config.onBombPlaced(data.position);
        }
      });

      client.subscribe(`/topic/room/${config.roomCode}`, (message) => {
        const data = JSON.parse(message.body);
        if (data.type === 'PLAYER_UPDATE') {
          config.onPlayerUpdate(data.players);
        }
      });
    };

    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
    };
  }, [config.roomCode]);

  const placeBomb = (position: { row: number; col: number }, playerId: string) => {
    if (stompClient.current?.connected) {
      stompClient.current.publish({
        destination: `/app/room/${config.roomCode}/bomb`,
        body: JSON.stringify({ position, playerId }),
      });
    }
  };

  return { placeBomb };
};