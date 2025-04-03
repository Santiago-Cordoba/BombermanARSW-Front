import React, {useMemo } from 'react';
import wallImage from "../../images/wall.png";

interface Position {
  row: number;
  col: number;
}

interface WallManagerProps {
  size: number;
  center: Position;
  blocks?: number;
  children: (renderWall: (row: number, col: number) => React.ReactNode) => React.ReactNode;
}

export const WallManager: React.FC<WallManagerProps> = ({ size, center, blocks = 0, children }) => {
  const walls = useMemo(() => {
    const newWalls: Position[] = [];
    if (blocks <= 0) return newWalls;

    const availablePositions: Position[] = [];
    
    for (let row = 1; row < size - 1; row++) {
      for (let col = 1; col < size - 1; col++) {
        if (!(row === center.row && col === center.col)) {
          availablePositions.push({ row, col });
        }
      }
    }

    const wallsCount = Math.min(blocks, availablePositions.length);
    for (let i = 0; i < wallsCount; i++) {
      const randomIndex = Math.floor(Math.random() * availablePositions.length);
      newWalls.push(availablePositions[randomIndex]);
      availablePositions.splice(randomIndex, 1);
    }

    return newWalls;
  }, []); 

  const renderWall = (row: number, col: number) => {
    const isWall = walls.some(wall => wall.row === row && wall.col === col);
    
    return isWall ? (
      <div 
        className="game-cell wall-block"
        style={{ 
          backgroundImage: `url(${wallImage})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundColor: 'transparent'
        }}
        key={`wall-${row}-${col}`}
      />
    ) : null;
  };

  return <>{children(renderWall)}</>;
};