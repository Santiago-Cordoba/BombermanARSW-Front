import React, { useState, useEffect } from "react";

interface HUDProps {
  initialTime: number; 
  roomCode: string;
  lives: number;
  isRunning?: boolean; 
  onTimeEnd?: () => void; 
}

const HUD: React.FC<HUDProps> = ({ 
  initialTime, 
  roomCode,
  lives,
  isRunning = true,
  onTimeEnd
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
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

  return (
    <div className="hud-container">
      <div className="hud-section">
        <div className="hud-room-code">Sala: {roomCode}</div>
        <div className="hud-time">Tiempo: {formatTime(timeLeft)}</div>
      </div>
      
      <div className="hud-section">
        <div className="hud-lives">Vidas: {lives}</div>
      </div>
    </div>
  );
};

export default HUD;