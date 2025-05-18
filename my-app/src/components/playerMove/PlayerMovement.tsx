import React, { useEffect } from 'react';

interface Position {
  row: number;
  col: number;
}

interface PlayerControllerProps {
  initialPosition: Position;
  boardSize: number;
  onPositionChange: (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
  onPlaceBomb: () => void;
  walls: Position[];
  bombs: Position[];
  children: React.ReactNode;
}

const PlayerController: React.FC<PlayerControllerProps> = ({
  initialPosition,
  boardSize,
  onPositionChange,
  onPlaceBomb,
  walls,
  bombs,
  children
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null = null;
      
      switch(e.key) {
        case 'ArrowUp':
          direction = 'UP';
          break;
        case 'ArrowDown':
          direction = 'DOWN';
          break;
        case 'ArrowLeft':
          direction = 'LEFT';
          break;
        case 'ArrowRight':
          direction = 'RIGHT';
          break;
        case ' ':
          onPlaceBomb();
          return;
        default:
          return;
      }

      if (direction) {
        const newPosition = calculateNewPosition(initialPosition, direction);
        
        if (isValidPosition(newPosition, boardSize, walls, bombs)) {
          onPositionChange(direction);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [initialPosition, boardSize, onPositionChange, onPlaceBomb, walls, bombs]);

  return <>{children}</>;
};

// Función auxiliar para calcular nueva posición
const calculateNewPosition = (
  current: Position, 
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
): Position => {
  switch(direction) {
    case 'UP':
      return { row: current.row - 1, col: current.col };
    case 'DOWN':
      return { row: current.row + 1, col: current.col };
    case 'LEFT':
      return { row: current.row, col: current.col - 1 };
    case 'RIGHT':
      return { row: current.row, col: current.col + 1 };
  }
};

// Función auxiliar para validar posición
const isValidPosition = (
  position: Position,
  boardSize: number,
  walls: Position[],
  bombs: Position[]
): boolean => {
  // Verificar límites del tablero
  if (position.row < 0 || position.row >= boardSize || 
      position.col < 0 || position.col >= boardSize) {
    return false;
  }

  // Verificar colisión con paredes
  if (walls.some(w => w.row === position.row && w.col === position.col)) {
    return false;
  }

  // Verificar colisión con bombas
  if (bombs.some(b => b.row === position.row && b.col === position.col)) {
    return false;
  }

  return true;
};

export default PlayerController;