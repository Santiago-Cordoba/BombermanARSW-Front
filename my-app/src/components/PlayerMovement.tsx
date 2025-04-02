import { ReactNode, useEffect, useState } from 'react';

interface Position {
  row: number;
  col: number;
}

interface PlayerControllerProps {
  initialPosition: Position;
  boardSize: number;
  onPositionChange: (newPosition: Position) => void;
  onPlaceBomb: () => void;
  walls: Position[];
  bombs: Position[];
  children?: ReactNode;
}

export function PlayerController({
  initialPosition,
  boardSize,
  onPositionChange,
  onPlaceBomb,
  walls,
  bombs,
  children
}: PlayerControllerProps) {
  const [position, setPosition] = useState(initialPosition);

  const movePlayer = (newRow: number, newCol: number) => {

    if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize) {
      return;
    }
    
    const isWall = walls.some(wall => wall.row === newRow && wall.col === newCol);
    if (isWall) {
      return;
    }

    const isBomb = bombs.some(bomb => bomb.row === newRow && bomb.col === newCol);
    if (isBomb) {
      return;
    }

    const newPosition = { row: newRow, col: newCol };
    setPosition(newPosition);
    onPositionChange(newPosition);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const { row, col } = position;

      switch(key) {
        case 'w': movePlayer(row - 1, col); break;
        case 's': movePlayer(row + 1, col); break;
        case 'a': movePlayer(row, col - 1); break;
        case 'd': movePlayer(row, col + 1); break;
        case 'f': onPlaceBomb(); break; 
        default: break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [position, onPlaceBomb, bombs]);

  return <>{children}</>;
}