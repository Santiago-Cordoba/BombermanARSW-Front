import React, { useState, useEffect, useRef } from 'react';
import bombImage from '../../images/bomb.png';
import { Client } from '@stomp/stompjs';

interface Position {
  row: number;
  col: number;
}

interface BombManagerProps {
  children: (
    bombs: Position[],
    placeBomb: (position: Position) => void,
    renderBomb: (row: number, col: number) => React.ReactNode
  ) => React.ReactNode;
  onBombPlaced: () => void;
  onBombExplode: (position: Position) => void;
  stompClient: Client | null;
  roomCode: string;
  playerId: string;
}

export const BombManager: React.FC<BombManagerProps> = ({ 
  children, 
  onBombPlaced,
  onBombExplode,
  stompClient,
  roomCode,
  playerId
}) => {
  const [bombs, setBombs] = useState<Position[]>([]);
  const bombTimers = useRef<Map<string, number>>(new Map());
  const lastUpdateTime = useRef(Date.now());

  // Efecto para manejar la suscripción a actualizaciones de bombas
  useEffect(() => {
    if (!stompClient) return;

    const subscription = stompClient.subscribe(
      `/topic/room/${roomCode}/bombs`,
      (message) => {
        const data = JSON.parse(message.body);
        if (data.type === "BOMB_ADDED") {
          const newBomb = { row: data.position.row, col: data.position.col };
          setBombs(prev => [...prev, newBomb]);
          bombTimers.current.set(`${newBomb.row}-${newBomb.col}`, 3);
        } else if (data.type === "BOMB_EXPLODED") {
          const explodedBomb = { row: data.position.row, col: data.position.col };
          setBombs(prev => prev.filter(b => 
            !(b.row === explodedBomb.row && b.col === explodedBomb.col)
          ));
          bombTimers.current.delete(`${explodedBomb.row}-${explodedBomb.col}`);
          onBombExplode(explodedBomb);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [stompClient, roomCode, onBombExplode]);

  // Efecto para manejar el conteo regresivo de las bombas
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateTime.current) / 1000;
      lastUpdateTime.current = now;

      // Actualizar temporizadores
      bombTimers.current.forEach((timer, key) => {
        const newTimer = timer - deltaTime;
        bombTimers.current.set(key, newTimer);
      });

      // Verificar bombas que deben explotar
      const bombsToExplode: Position[] = [];
      bombTimers.current.forEach((timer, key) => {
        if (timer <= 0) {
          const [row, col] = key.split('-').map(Number);
          bombsToExplode.push({ row, col });
        }
      });

      // Explotar bombas y notificar al backend
      bombsToExplode.forEach(bomb => {
        if (stompClient?.connected) {
          stompClient.publish({
            destination: `/app/room/${roomCode}/explode`,
            body: JSON.stringify({
              position: bomb,
              playerId
            })
          });
        }
        bombTimers.current.delete(`${bomb.row}-${bomb.col}`);
      });

      // Actualizar estado local
      setBombs(prev => prev.filter(b => 
        bombTimers.current.has(`${b.row}-${b.col}`)
      ));
    }, 100);

    return () => clearInterval(interval);
  }, [stompClient, roomCode, playerId]);

  const placeBomb = (position: Position) => {
    if (!stompClient?.connected) return;

    // Enviar al backend
    stompClient.publish({
      destination: `/app/room/${roomCode}/place-bomb`,
      body: JSON.stringify({
        playerId,
        position
      })
    });

    // Actualizar estado local
    setBombs(prev => [...prev, position]);
    bombTimers.current.set(`${position.row}-${position.col}`, 3);
    onBombPlaced();
  };

  const renderBomb = (row: number, col: number) => {
    const bomb = bombs.find(b => b.row === row && b.col === col);
    return bomb ? (
      <div 
        key={`bomb-${row}-${col}`}
        className="game-cell bomb"
        style={{ 
          backgroundImage: `url(${bombImage})`,
          backgroundSize: 'contain'
        }}
      />
    ) : null;
  };

  return <>{children(bombs, placeBomb, renderBomb)}</>;
};