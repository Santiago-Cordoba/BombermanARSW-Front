// Hud.tsx - Actualiza la interfaz y el componente
import React from "react";

interface HUDProps {
  timeLeft: string;
  score: number;
  roomCode: string;
  lives: number;
}

const HUD: React.FC<HUDProps> = ({ 
  timeLeft, 
  score, 
  roomCode,
  lives 
}) => {
  return (
    <div className="hud-container">
      <div className="hud-section">
        <div className="hud-room-code">Sala: {roomCode}</div>
        <div className="hud-time">Tiempo: {timeLeft}</div>
      </div>
      
      <div className="hud-section">
        <div className="hud-lives">Vidas: {lives}</div>
        <div className="hud-score">Puntos: {score}</div>
      </div>
    </div>
  );
};

export default HUD;