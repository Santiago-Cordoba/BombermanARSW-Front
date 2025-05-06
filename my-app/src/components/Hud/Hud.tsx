import React, { useEffect, useState } from "react";
import "./Hud.css";

interface HUDProps {
  initialTime: number;
  roomCode: string;
  lives: number;
  lifeChange?: number | null;
  isRunning?: boolean;
  onTimeEnd?: () => void;
}

const HUD: React.FC<HUDProps> = ({ 
  initialTime, 
  roomCode,
  lives,
  lifeChange,
  isRunning = true,
  onTimeEnd
}) => {
  const [time, setTime] = useState(initialTime);
  const [displayLives, setDisplayLives] = useState(lives);
  const [showLifeChange, setShowLifeChange] = useState(false);

  // Sincronizar tiempo cuando cambia initialTime
  useEffect(() => {
    setTime(initialTime);
  }, [initialTime]);

  // Efecto para el contador de tiempo
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeEnd?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, onTimeEnd]);

  // Efecto para animación de cambios de vida
  useEffect(() => {
    if (lifeChange !== null && lifeChange !== undefined) {
      setShowLifeChange(true);
      const timer = setTimeout(() => setShowLifeChange(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [lifeChange]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="hud-container">
      <div className="hud-section">
        <div className="hud-room-code">Room: {roomCode}</div>
        <div className="hud-time">Time: {formatTime(time)}</div>
      </div>
      
      <div className="hud-section">
        <div className={`hud-lives ${showLifeChange ? 'changing' : ''}`}>
          Lives: {lives}
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