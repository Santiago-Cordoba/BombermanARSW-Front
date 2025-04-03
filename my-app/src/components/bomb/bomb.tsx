import React, { useState, useEffect, useRef } from 'react';
import bombImage from '../images/bomb.png';

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
  onBombExplode?: (position: Position) => void;
}

export const BombManager: React.FC<BombManagerProps> = ({ 
  children, 
  onBombPlaced,
  onBombExplode 
}) => {
  const [bombs, setBombs] = useState<Array<{position: Position, timer: number}>>([]);
  const lastUpdateTime = useRef(Date.now());

  const placeBomb = (position: Position) => {
    setBombs(prev => [...prev, {
      position,
      timer: 3 
    }]);
    onBombPlaced();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateTime.current) / 1000;
      lastUpdateTime.current = now;

      setBombs(prev => {
        const updatedBombs = prev.map(bomb => ({
          ...bomb,
          timer: bomb.timer - deltaTime
        }));

        const explodedBombs = prev.filter(
          bomb => bomb.timer > 0 && bomb.timer - deltaTime <= 0
        );
        
        if (explodedBombs.length > 0 && onBombExplode) {
          explodedBombs.forEach(bomb => {
            onBombExplode(bomb.position); 
          });
        }

        return updatedBombs.filter(bomb => bomb.timer > 0);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onBombExplode]);

  const renderBomb = (row: number, col: number) => {
    const isBomb = bombs.some(bomb => 
      bomb.position.row === row && bomb.position.col === col
    );
    
    return isBomb ? (
      <div 
        className="game-cell bomb"
        style={{ 
          backgroundImage: `url(${bombImage})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundColor: 'transparent'
        }}
        key={`bomb-${row}-${col}`}
      />
    ) : null;
  };

  return <>{children(bombs.map(b => b.position), placeBomb, renderBomb)}</>;
};