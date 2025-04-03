import React from 'react';
import './WaitingRoom.css';

interface Player {
  id: string;
  name: string;
  ready: boolean;
}

interface RetroWaitingRoomProps {
  players: Player[];
  currentPlayerName: string;
  roomCode: string; // Añade esta prop
  onStartGame?: () => void;
  isHost?: boolean;
}

const RetroWaitingRoom: React.FC<RetroWaitingRoomProps> = ({
  players,
  currentPlayerName,
  roomCode, // Recibe la nueva prop
  onStartGame = () => {},
  isHost = false
}) => {
  return (
    <div className="retro-waiting-room">
      <h1 className="retro-title">SALA DE ESPERA</h1>
      
      <div className="connection-info">
        <p>Código de sala: <span className="highlight">{roomCode}</span></p>
        <p>Jugadores: <span className="highlight">{players.length}/4</span></p>
        {isHost && <p className="host-marker">(Eres el host)</p>}
      </div>
      
      {/* Resto del componente permanece igual */}
      <div className="players-list">
        {players.map((player) => (
          <div 
            key={player.id} 
            className={`player-card ${player.ready ? 'ready' : ''} ${player.name === currentPlayerName ? 'current-player' : ''}`}
          >
            <span className="player-name">{player.name}</span>
            <span className="player-status">
              {player.ready ? ' LISTO' : ' ESPERANDO'}
            </span>
          </div>
        ))}
      </div>

      {isHost && (
        <button 
          className="retro-start-button"
          onClick={onStartGame}
          disabled={players.length < 2}
        >
          INICIAR JUEGO
        </button>
      )}
    </div>
  );
};

export default RetroWaitingRoom;