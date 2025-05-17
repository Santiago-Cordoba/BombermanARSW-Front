
import React, { useState } from 'react';
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
    onConfigChange?: (config: { lives: number; duration: number }) => void;
    initialConfig?: { lives: number; duration: number };
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
    error = '',
    onConfigChange = () => {},
    initialConfig = { lives: 3, duration: 180 }
}) => {
    const currentPlayer = players.find(p => p.name === currentPlayerName);
    const [config, setConfig] = useState(initialConfig);


     const handleConfigChange = (key: 'lives' | 'duration', value: number) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        onConfigChange(newConfig);
    };

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

            {isHost && (
                <div className="retro-config-panel">
                    <h3 className="config-title">CONFIGURACIÓN</h3>
                    
                    <div className="config-item">
                        <label>VIDAS:</label>
                        <div className="config-controls">
                            <button 
                                className="config-button"
                                onClick={() => handleConfigChange('lives', Math.max(1, config.lives - 1))}
                                disabled={config.lives <= 1}
                            >
                                -
                            </button>
                            <span className="config-value">{config.lives}</span>
                            <button 
                                className="config-button"
                                onClick={() => handleConfigChange('lives', config.lives + 1)}
                                disabled={config.lives >= 5}
                            >
                                +
                            </button>
                        </div>
                    </div>
                    
                    <div className="config-item">
                        <label>TIEMPO (seg):</label>
                        <div className="config-controls">
                            <button 
                                className="config-button"
                                onClick={() => handleConfigChange('duration', Math.max(60, config.duration - 30))}
                                disabled={config.duration <= 60}
                            >
                                -
                            </button>
                            <span className="config-value">{config.duration}</span>
                            <button 
                                className="config-button"
                                onClick={() => handleConfigChange('duration', config.duration + 30)}
                                disabled={config.duration >= 300}
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="players-list">
                {players.map((player) => (
                    <div 
                        key={player.id} 
                        className={`player-card ${player.ready ? 'ready' : ''} ${player.name === currentPlayerName ? 'current-player' : ''}`}
                    >
                        <span className="player-name">
                            {player.name} 
                            {player.host && <span className="host-badge"> (Host)</span>}
                            {player.name === currentPlayerName && <span className="you-badge"> (Tú)</span>}
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