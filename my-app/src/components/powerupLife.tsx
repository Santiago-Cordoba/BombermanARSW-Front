import React, { useState, useEffect } from 'react';
import powerupImage from '../images/powerup1.png'

interface Position {
  row: number;
  col: number;
}

interface PowerUpManagerProps {
  boardSize: number;
  playerPosition: Position;
  maxLives: number; 
  currentLives: number;
  onCollect: () => void;
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
  children
}) => {
  const [powerUpPosition, setPowerUpPosition] = useState<Position | null>(null);
  const [showPowerUp, setShowPowerUp] = useState(false);

  const generateRandomPosition = (): Position => {
    return {
      row: Math.floor(Math.random() * (boardSize - 2)) + 1,
      col: Math.floor(Math.random() * (boardSize - 2)) + 1
    };
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPowerUpPosition(generateRandomPosition());
      setShowPowerUp(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [boardSize]);

  useEffect(() => {
    if (showPowerUp && powerUpPosition && 
        playerPosition.row === powerUpPosition.row && 
        playerPosition.col === powerUpPosition.col) {
      
      if (currentLives < maxLives) {
        onCollect();
      }
      setShowPowerUp(false);
    }
  }, [playerPosition, powerUpPosition, showPowerUp, onCollect, currentLives, maxLives]);

  const renderPowerUp = (row: number, col: number) => {
    if (!showPowerUp || !powerUpPosition) return null;
    
    if (row === powerUpPosition.row && col === powerUpPosition.col) {
      return (
        <div 
          className="game-cell powerup"
          style={{ 
            backgroundImage: `url(${powerupImage})`,
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