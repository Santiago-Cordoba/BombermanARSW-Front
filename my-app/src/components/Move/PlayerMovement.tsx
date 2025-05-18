import { ReactNode, useEffect, useState } from 'react';

interface PlayerControllerProps {
  initialPosition: { row: number; col: number };
  boardSize: number;
  onPositionChange: (newPosition: { row: number; col: number }) => void;
  onPlaceBomb: () => void;
  children?: ReactNode;
}

export function PlayerController({
  initialPosition,
  boardSize,
  onPositionChange,
  onPlaceBomb,
  children
}: PlayerControllerProps) {
  const [position, setPosition] = useState(initialPosition);

  const movePlayer = (newRow: number, newCol: number) => {
    if (newRow <= 0 || newRow >= boardSize - 1 || newCol <= 0 || newCol >= boardSize - 1) {
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
  }, [position, onPlaceBomb]);

  return <>{children}</>;
}