import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateRoomForm.css';

const CreateRoomForm: React.FC = () => {
  const [roomName, setRoomName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim() && playerName.trim()) {
      // Guardar nombre del jugador en localStorage
      localStorage.setItem('playerName', playerName);
      // Codificar el nombre de la sala para la URL
      const encodedRoomName = encodeURIComponent(roomName.trim());
      // Navegar a la sala con el nombre proporcionado
      navigate(`/room/${encodedRoomName}`);
    }
  };

  return (
    <div className="create-room-container">
      <h2>Crear Nueva Sala</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre de la sala:</label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Ej: SalaDePablo"
            required
            maxLength={20}
          />
        </div>
        
        <div className="form-group">
          <label>Tu nombre:</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Ej: Pablo"
            required
            maxLength={15}
          />
        </div>

        <button type="submit" className="create-room-button">
          Crear Sala
        </button>
      </form>
    </div>
  );
};

export default CreateRoomForm;