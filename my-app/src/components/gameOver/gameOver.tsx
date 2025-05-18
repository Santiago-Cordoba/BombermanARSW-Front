import React from 'react';
import './GameOverCard.css';

interface GameOverCardProps {
  message: string;
  onClose?: () => void;
}

export const GameOverCard: React.FC<GameOverCardProps> = ({ message, onClose }) => {
  return (
    <div className="game-over-card-overlay">
      <div className="game-over-card">
        <h2>{message}</h2>
        <button onClick={onClose} className="game-over-button">
          Cerrar
        </button>
      </div>
    </div>
  );
};