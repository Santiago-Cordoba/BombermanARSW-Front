import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RoomEntryPage.css';

const RoomEntryPage: React.FC = () => {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomCode.trim() || !playerName.trim()) {
      setError('Por favor ingresa un nombre de sala y tu nombre');
      return;
    }

    // Guardar el nombre del jugador en localStorage
    localStorage.setItem('playerName', playerName);
    
    // Navegar a la sala de espera
    navigate(`/room/${encodeURIComponent(roomCode)}`);
  };

  return (
    <div className="room-entry-container">
      <div className="retro-box">
        <h1 className="retro-title">UNIRSE A SALA</h1>
        
        <form onSubmit={handleSubmit} className="room-entry-form">
          <div className="form-group">
            <label htmlFor="roomCode">Código de Sala:</label>
            <input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              maxLength={12}
              placeholder="Ej: ABC123"
              className="retro-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="playerName">Tu Nombre:</label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={12}
              placeholder="Máx. 12 caracteres"
              className="retro-input"
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="retro-button">
            ENTRAR A SALA
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoomEntryPage;