
import React from "react";

interface HUDProps {
  lives: number;
  timeLeft: string;
  playersLeft: number;
  score?: number;
}

const HUD: React.FC<HUDProps> = ({ lives, timeLeft, playersLeft }) => {
  return (
    <div className="hud-container">
      <div className="hud-section">
        <span className="hud-icon">❤️</span>
        <span className="hud-value">{lives}</span>
      </div>
      <div className="hud-section">
        <span className="hud-icon">⏱️</span>
        <span className="hud-value">{timeLeft}</span>
      </div>
      <div className="hud-section">
        <span className="hud-icon">👥</span>
        <span className="hud-value">{playersLeft}</span>
      </div>
    </div>
  );
};

export default HUD;