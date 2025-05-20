import React, { JSX, useEffect, useState } from 'react';
import './Explosion.css';

interface ExplosionProps {
  x: number;
  y: number;
  range: number;
  onComplete?: () => void;
}

const Explosion: React.FC<ExplosionProps> = ({ x, y, range, onComplete }) => {
  const [explosionParts, setExplosionParts] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const parts = [];
    
    // Centro de la explosión
    parts.push(
      <div
        key="center"
        className="explosion-center"
        style={{
          left: `${x * 32}px`,
          top: `${y * 32}px`,
        }}
      />
    );

    // Brazos de explosión
    for (let i = 1; i <= range; i++) {
      // Derecha
      if (x + i < 15) { // Asumiendo ancho de mapa 15
        parts.push(
          <div
            key={`right-${i}`}
            className="explosion-arm right"
            style={{
              left: `${x * 32}px`,
              top: `${y * 32}px`,
              width: `${i * 32}px`
            }}
          />
        );
      }

      // Izquierda
      if (x - i >= 0) {
        parts.push(
          <div
            key={`left-${i}`}
            className="explosion-arm left"
            style={{
              left: `${(x - i) * 32}px`,
              top: `${y * 32}px`,
              width: `${i * 32}px`
            }}
          />
        );
      }

      // Abajo
      if (y + i < 13) { // Asumiendo alto de mapa 13
        parts.push(
          <div
            key={`down-${i}`}
            className="explosion-arm down"
            style={{
              left: `${x * 32}px`,
              top: `${y * 32}px`,
              height: `${i * 32}px`
            }}
          />
        );
      }

      // Arriba
      if (y - i >= 0) {
        parts.push(
          <div
            key={`up-${i}`}
            className="explosion-arm up"
            style={{
              left: `${x * 32}px`,
              top: `${(y - i) * 32}px`,
              height: `${i * 32}px`
            }}
          />
        );
      }
    }

    setExplosionParts(parts);

    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 500);

    return () => clearTimeout(timer);
  }, [x, y, range, onComplete]);

  return <div className="explosion-container">{explosionParts}</div>;
};

export default Explosion;