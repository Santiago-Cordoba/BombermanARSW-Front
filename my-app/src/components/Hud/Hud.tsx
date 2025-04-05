import React, { useState, useEffect } from "react";
import './HUD.css';

interface HUDProps {
  initialTime: number; 
  roomCode: string;
  lives: number;
  isRunning?: boolean; 
  onTimeEnd?: () => void;
  showLifeGained?: boolean;
}

const HUD: React.FC<HUDProps> = ({ 
  initialTime, 
  roomCode,
  lives,
  isRunning = true,
  onTimeEnd,
  showLifeGained = false
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
        <div className="hud-room-code">Room: {roomCode}</div>
        <div className="hud-time">Time: {formatTime(timeLeft)}</div>
      </div>
      
      <div className="hud-section">
        <div className="hud-lives">
          Lives: {lives}
          {showLifeGained && <span className="life-gained">+1</span>}
        </div>
      </div>
    </div>
  );
};

export default HUD;