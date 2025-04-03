import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RetroWaitingRoom from '../../components/room/WaitingRoom';

interface Player {
  id: string;
  name: string;
  ready: boolean;
}

const WaitingRoomPage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const currentPlayerName = localStorage.getItem('playerName') || 'Jugador';

  useEffect(() => {
    // Simulación: el primer jugador es el host (quien creó la sala)
    const mockPlayers: Player[] = [
      { id: '1', name: currentPlayerName, ready: true },
      { id: '2', name: 'Jugador 2', ready: false },
      { id: '3', name: 'Jugador 3', ready: true },
    ];
    setPlayers(mockPlayers);
  }, [roomCode, currentPlayerName]);

  const handleStartGame = () => {
    // Redirigir a la página de configuración del host
    navigate('/hostconfig');
  };

  return (
    <RetroWaitingRoom
      players={players}
      currentPlayerName={currentPlayerName}
      roomCode={roomCode ? decodeURIComponent(roomCode) : ''}
      onStartGame={handleStartGame}
      isHost={true} // El creador siempre es host
    />
  );
};

export default WaitingRoomPage;