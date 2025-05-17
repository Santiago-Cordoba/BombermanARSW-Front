import React, { useEffect, useState } from "react";
import "./Hud.css";

interface HUDProps {
  time: number;            // Tiempo actual en segundos (manejado desde el padre)
  roomCode: string;        // Código de la sala
  lives: number;           // Vidas actuales del jugador
  lifeChange?: number | null; // Cambio en vidas (para animación)
  isRunning?: boolean;     // Si el juego está activo
  onTimeEnd?: () => void;  // Callback cuando el tiempo llega a 0
}

const HUD: React.FC<HUDProps> = ({ 
  time, 
  roomCode,
  lives,
  lifeChange,
  isRunning = true,
  onTimeEnd
}) => {
  const [showLifeChange, setShowLifeChange] = useState(false);

  // Efecto para animación de cambios de vida
  useEffect(() => {
    if (lifeChange !== null && lifeChange !== undefined) {
      setShowLifeChange(true);
      const timer = setTimeout(() => setShowLifeChange(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [lifeChange]);

  // Formatear tiempo como MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="hud-container">
      <div className="hud-section">
        <div className="hud-room-code">Sala: {roomCode}</div>
        <div className="hud-time">Tiempo: {formatTime(time)}</div>
      </div>
      
      <div className="hud-section">
        <div className={`hud-lives ${showLifeChange ? 'changing' : ''}`}>
          Vidas: {lives}
          {showLifeChange && lifeChange && (
            <span className={`life-change ${lifeChange > 0 ? 'gained' : 'lost'}`}>
              {lifeChange > 0 ? `+${lifeChange}` : lifeChange}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default HUD;