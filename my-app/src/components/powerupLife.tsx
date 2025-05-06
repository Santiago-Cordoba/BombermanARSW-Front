import React, { useState, useEffect } from 'react';
import powerupImage from '../images/powerup1.png';
import { GameCell } from '../pages/GamePage/GamePage';

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
  gameMap: GameCell[][]; // Añade esto para verificar posiciones válidas
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
  gameMap, // Recibe el mapa del juego
  children
}) => {
  const [powerUpPosition, setPowerUpPosition] = useState<Position | null>(null);
  const [showPowerUp, setShowPowerUp] = useState(false);

  // Función para verificar si una posición es válida (sin muros ni bloques)
  const isValidPosition = (row: number, col: number): boolean => {
    if (row < 0 || col < 0 || row >= boardSize || col >= boardSize) return false;
    
    const cell = gameMap[row]?.[col];
    return !cell?.isWall && !cell?.isDestructible;
  };

  // Función para generar una posición aleatoria válida
  const generateRandomPosition = (): Position | null => {
    const maxAttempts = 50; // Para evitar bucles infinitos
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const row = Math.floor(Math.random() * (boardSize - 2)) + 1;
      const col = Math.floor(Math.random() * (boardSize - 2)) + 1;
      
      if (isValidPosition(row, col)) {
        return { row, col };
      }
      
      attempts++;
    }
    
    return null; // Si no encuentra posición válida
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const position = generateRandomPosition();
      if (position) {
        setPowerUpPosition(position);
        setShowPowerUp(true);
        
        // Hacer que el power-up desaparezca después de 10 segundos si no se recoge
        const disappearTimer = setTimeout(() => {
          setShowPowerUp(false);
        }, 10000);
        
        return () => clearTimeout(disappearTimer);
      }
    }, 15000); // 15 segundos después de iniciar

    return () => clearTimeout(timer);
  }, [boardSize, gameMap]);

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
          className="game-cell powerup life"
          style={{ 
            backgroundImage: `url(${powerupImage})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundColor: 'transparent'
          }}
          key={`powerup-${row}-${col}`}
        >
          ❤️
        </div>
      );
    }
    return null;
  };

  return <>{children(renderPowerUp)}</>;
};