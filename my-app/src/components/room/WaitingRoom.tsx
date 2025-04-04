import React from 'react';
import './WaitingRoom.css';

interface Player {
    id: string;
    name: string;
    ready: boolean;
    host?: boolean;
}

interface RetroWaitingRoomProps {
    players: Player[];
    currentPlayerName: string;
    roomCode: string;
    onStartGame?: () => void;
    onToggleReady?: () => void;
    onLeaveRoom?: () => void;
    isHost?: boolean;
    isConnected?: boolean;
    error?: string;
}

const RetroWaitingRoom: React.FC<RetroWaitingRoomProps> = ({
    players,
    currentPlayerName,
    roomCode,
    onStartGame = () => {},
    onToggleReady = () => {},
    onLeaveRoom = () => {},
    isHost = false,
    isConnected = false,
    error = ''
}) => {
    const currentPlayer = players.find(p => p.name === currentPlayerName);

    return (
        <div className="retro-waiting-room">
            <h1 className="retro-title">SALA DE ESPERA</h1>
            
            <div className="connection-info">
                <p>Código de sala: <span className="highlight">{roomCode}</span></p>
                <p>Jugadores: <span className="highlight">{players.length}/4</span></p>
                <p className="connection-status">
                    Estado: {isConnected ? 'CONECTADO' : 'DESCONECTADO'}
                </p>
                {isHost && <p className="host-marker">(Eres el host)</p>}
                {error && <p className="error-message">{error}</p>}
            </div>
            
            <div className="players-list">
                {players.map((player) => (
                    <div 
                        key={player.id} 
                        className={`player-card ${player.ready ? 'ready' : ''} ${player.name === currentPlayerName ? 'current-player' : ''}`}
                    >
                        <span className="player-name">
                            {player.name} 
                            {player.host && <span className="host-badge"> (Host)</span>}
                        </span>
                        <span className="player-status">
                            {player.ready ? ' LISTO' : ' ESPERANDO'}
                        </span>
                    </div>
                ))}
            </div>

            <div className="action-buttons">
                <button 
                    className="retro-ready-button"
                    onClick={onToggleReady}
                    disabled={!isConnected || !currentPlayer}
                >
                    {currentPlayer?.ready ? 'NO LISTO' : 'LISTO'}
                </button>

                {isHost && (
                    <button 
                        className="retro-start-button"
                        onClick={onStartGame}
                        disabled={!isConnected || players.length < 2 || !players.every(p => p.ready)}
                    >
                        INICIAR JUEGO
                    </button>
                )}

                <button 
                    className="retro-leave-button"
                    onClick={onLeaveRoom}
                >
                    SALIR DE LA SALA
                </button>
            </div>
        </div>
    );
};

export default RetroWaitingRoom;