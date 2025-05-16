import React, { useState, useEffect } from 'react';
import powerupImage from '../images/powerup1.png';
import invIcon from '../images/powerup3.png'; // Importa ícono de invencibilidad
import { GameCell } from '../pages/GamePage/GamePage';

interface Position {
  row: number;
  col: number;
}

type PowerUpType = 'life' | 'invincibility';

interface PowerUpManagerProps {
  boardSize: number;
  playerPosition: Position;
  maxLives: number; 
  currentLives: number;
  onCollect: () => void;
  gameMap: GameCell[][];
  children: (
    renderPowerUp: (row: number, col: number) => React.ReactNode
  ) => React.ReactNode;
}

export const PowerUpManager: React.FC<PowerUpManagerProps> = ({
  boardSize,
  playerPosition,
  onCollect,
  maxLives,
  currentLives,
  gameMap,
  children
}) => {
  const [powerUpPosition, setPowerUpPosition] = useState<Position | null>(null);
  const [showPowerUp, setShowPowerUp] = useState(false);
  const [powerUpType, setPowerUpType] = useState<PowerUpType>('life');

  const activateInvincibility = (player: any) => {
    player.isInvincible = true;
    player.invincibilityTimeout = setTimeout(() => {
      player.isInvincible = false;
    }, 5000);
  };

  const isValidPosition = (row: number, col: number): boolean => {
    if (row < 0 || col < 0 || row >= boardSize || col >= boardSize) return false;
    const cell = gameMap[row]?.[col];
    return !cell?.isWall && !cell?.isDestructible;
  };

  const generateRandomPosition = (): Position | null => {
    const maxAttempts = 50;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const row = Math.floor(Math.random() * (boardSize - 2)) + 1;
      const col = Math.floor(Math.random() * (boardSize - 2)) + 1;
      if (isValidPosition(row, col)) return { row, col };
      attempts++;
    }
    return null;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const position = generateRandomPosition();
      if (position) {
        setPowerUpPosition(position);
        const randomType: PowerUpType = Math.random() < 0.5 ? 'life' : 'invincibility';
        setPowerUpType(randomType);
        setShowPowerUp(true);

        const disappearTimer = setTimeout(() => {
          setShowPowerUp(false);
        }, 10000);

        return () => clearTimeout(disappearTimer);
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, [boardSize, gameMap]);

  useEffect(() => {
    if (showPowerUp && powerUpPosition &&
        playerPosition.row === powerUpPosition.row &&
        playerPosition.col === powerUpPosition.col) {
      
      if (powerUpType === 'life') {
        if (currentLives < maxLives) onCollect();
      } else if (powerUpType === 'invincibility') {
        activateInvincibility(window.currentPlayer); // Reemplazar por un prop idealmente
      }

      setShowPowerUp(false);
    }
  }, [playerPosition, powerUpPosition, showPowerUp, powerUpType, onCollect, currentLives, maxLives]);

  const getPowerUpImage = () => {
    switch (powerUpType) {
      case 'life': return powerupImage;
      case 'invincibility': return invIcon;
      default: return powerupImage;
    }
  };

  const renderPowerUp = (row: number, col: number) => {
    if (!showPowerUp || !powerUpPosition) return null;
    if (row === powerUpPosition.row && col === powerUpPosition.col) {
      return (
        <div 
          className={`game-cell powerup ${powerUpType}`}
          style={{ 
            backgroundImage: `url(${getPowerUpImage()})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundColor: 'transparent'
          }}
          key={`powerup-${row}-${col}`}
        />
      );
    }
    return null;
  };

  return <>{children(renderPowerUp)}</>;
};
