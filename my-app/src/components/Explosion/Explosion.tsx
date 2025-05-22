import React from 'react';
import './Explosion.css';

type ExplosionProps = {
  x: number;
  y: number;
  range: number;
};

const Explosion: React.FC<ExplosionProps> = ({ x, y, range }) => {
  return (
    <>
      <div 
        className="explosion explosion-center"
        style={{
          gridColumn: x + 1,
          gridRow: y + 1,
        }}
      />
      
      {/* Brazos de la explosión */}
      {[...Array(range).keys()].map(i => (
        <React.Fragment key={`explosion-${x}-${y}-${i}`}>
          <div 
            className="explosion explosion-arm"
            style={{
              gridColumn: x - i > 0 ? x - i + 1 : x + 1,
              gridRow: y + 1,
            }}
          />
          <div 
            className="explosion explosion-arm"
            style={{
              gridColumn: x + i + 1,
              gridRow: y + 1,
            }}
          />
          <div 
            className="explosion explosion-arm"
            style={{
              gridColumn: x + 1,
              gridRow: y - i > 0 ? y - i + 1 : y + 1,
            }}
          />
          <div 
            className="explosion explosion-arm"
            style={{
              gridColumn: x + 1,
              gridRow: y + i + 1,
            }}
          />
        </React.Fragment>
      ))}
    </>
  );
};

export default Explosion;