// Explosion.tsx
import React, { useEffect, useState } from 'react';
import './Explosion.css';

interface ExplosionProps {
  x: number;
  y: number;
  range: number;
  onComplete: () => void;
}

const Explosion: React.FC<ExplosionProps> = ({ x, y, range, onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 500); // Duración de la animación

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <>
      <div 
        className="explosion-center"
        style={{
          left: `${x * 32}px`,
          top: `${y * 32}px`
        }}
      />
      {[...Array(range).keys()].map(i => (
        <React.Fragment key={i}>
          <div 
            className="explosion-direction"
            style={{
              left: `${(x + i + 1) * 32}px`,
              top: `${y * 32}px`
            }}
          />
          <div 
            className="explosion-direction"
            style={{
              left: `${(x - i - 1) * 32}px`,
              top: `${y * 32}px`
            }}
          />
          <div 
            className="explosion-direction"
            style={{
              left: `${x * 32}px`,
              top: `${(y + i + 1) * 32}px`
            }}
          />
          <div 
            className="explosion-direction"
            style={{
              left: `${x * 32}px`,
              top: `${(y - i - 1) * 32}px`
            }}
          />
        </React.Fragment>
      ))}
    </>
  );
};

export default Explosion;