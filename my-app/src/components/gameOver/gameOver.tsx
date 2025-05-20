import React from 'react';
import { FaBomb, FaArrowLeft } from 'react-icons/fa';
import './gameOver.css';

interface GameOverCardProps {
  message: string;
  players?: {name: string, isCurrentPlayer: boolean}[]; 
  onClose?: () => void;
}

export const GameOverCard: React.FC<GameOverCardProps> = ({ message, players, onClose }) => {
  return (
    <div className="game-over-card-overlay">
      <div className="game-over-card">
        <div className="corner-pixel tl"></div>
        <div className="corner-pixel tr"></div>
        <div className="corner-pixel bl"></div>
        <div className="corner-pixel br"></div>
        
        <h2 className="game-over-title">{message}</h2>
        
        <div className="explosion-icon">
          <FaBomb />
        </div>
        
        {players && players.length > 0 && (
          <div className="tie-players">
            <h3>EMPATE ENTRE:</h3>
            <ul>
              {players.map((player, index) => (
                <li key={index} className={player.isCurrentPlayer ? 'current-player' : ''}>
                  {player.name} {player.isCurrentPlayer && '(TÚ)'}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="pixel-divider"></div>
        
        <button onClick={onClose} className="game-over-button">
          <FaArrowLeft /> MENÚ PRINCIPAL
        </button>
      </div>
    </div>
  );
};