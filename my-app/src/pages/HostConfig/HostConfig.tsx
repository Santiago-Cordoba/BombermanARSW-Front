import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './HostConfig.css';

const HostConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const [gameDuration, setGameDuration] = useState(5);
  const [playerCount, setPlayerCount] = useState(2);
  const [blockCount, setBlockCount] = useState(15);
  const [livesCount, setLivesCount] = useState(3);

  const handleStartGame = () => {
    navigate("/game", {
      state: {
        duration: gameDuration,
        players: playerCount,
        blocks: blockCount,
        lives: livesCount
      }
    });
  };
  
  return (
    <div className="retro-config-container">
      <div className="retro-config-panel">
        <h2 className="retro-title">Configuración de Partida</h2>
        
        <div className="retro-config-item">
          <label>Duración (minutos):</label>
          <div className="retro-radio-group">
            {[2, 5, 10].map((minutes) => (
              <label key={minutes} className="retro-radio-label">
                <input
                  type="radio"
                  name="duration"
                  checked={gameDuration === minutes}
                  onChange={() => setGameDuration(minutes)}
                />
                {minutes}
              </label>
            ))}
          </div>
        </div>

        <div className="retro-config-item">
          <label>Jugadores (1-4):</label>
          <input
            type="number"
            min="1"
            max="4"
            value={playerCount}
            onChange={(e) => setPlayerCount(parseInt(e.target.value))}
            className="retro-input"
          />
        </div>

        <div className="retro-config-item">
          <label>Bloques (1-30):</label>
          <input
            type="number"
            min="1"
            max="30"
            value={blockCount}
            onChange={(e) => setBlockCount(parseInt(e.target.value))}
            className="retro-input"
          />
        </div>

        <div className="retro-config-item">
          <label>Vidas (1-10):</label>
          <input
            type="number"
            min="1"
            max="10"
            value={livesCount}
            onChange={(e) => setLivesCount(parseInt(e.target.value))}
            className="retro-input"
          />
        </div>

        <div className="retro-button-group">
          <button 
            className="retro-button-cancel" 
            onClick={() => navigate(-1)}
          >
            Cancelar
          </button>
          <button 
            className="retro-button-start" 
            onClick={handleStartGame}
          >
            Iniciar Partida
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostConfigPage;