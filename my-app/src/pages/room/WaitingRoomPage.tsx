import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RetroWaitingRoom from '../../components/room/WaitingRoom';
import './WaitingRoomPage.css';
import { useWebSocket } from '../../components/Socket/WebSocketProvider';

interface Player {
    id: string;
    name: string;
    ready: boolean;
    host: boolean;
    lives: number;
    bombCapacity: number;
    bombRange: number;
}

interface GameConfig {
    duration?: number;
    players?: number;
    lives?: number;
}

interface PlayerUpdateMessage {
    type: 'PLAYER_UPDATE';
    players: Player[];
}

interface GameCell {
    isDestructible: boolean;
    hasPowerUp: boolean;
    x: number;
    y: number;
    isWall: boolean;
  }

interface GameMap {
    width: number;
    height: number;
    cells: GameCell[][];
  }

  interface GameStartMessage {
    type: 'GAME_START';
    config: GameConfig;
    players: Player[];
    map: GameMap;
  }
  


type SocketMessage = PlayerUpdateMessage | GameStartMessage;

const WaitingRoomPage: React.FC = () => {
    const { roomCode } = useParams<{ roomCode: string }>();
    const navigate = useNavigate();
    const [playerName, setPlayerName] = useState('');
    const [players, setPlayers] = useState<Player[]>([]);
    const [isHost, setIsHost] = useState(false);
    const [error, setError] = useState('');
    const [gameStarting, setGameStarting] = useState(false);
    const [gameConfig, setGameConfig] = useState({
        lives: 3,
        duration: 180
    });
    
    
    const { isConnected, connect, disconnect, subscribe, sendMessage } = useWebSocket();

    // Obtener nombre del jugador desde localStorage
    useEffect(() => {
        const savedName = localStorage.getItem('playerName');
        if (savedName) {
            setPlayerName(savedName);
        }
    }, []);

    // Manejar conexión y suscripciones
    useEffect(() => {
        if (!playerName || !roomCode || gameStarting) return;

        const setupConnection = async () => {
            try {
                await connect(roomCode, playerName, () => {
                    // Callback que se ejecuta al desconectarse
                    navigate('/');
                });
                
                // Suscribirse a actualizaciones de la sala
                subscribe(`/topic/room/${roomCode}`, (message: SocketMessage) => {
                    console.log('Received message:', message);
                    
                    switch (message.type) {
                        case 'PLAYER_UPDATE': {
                            setPlayers(message.players);
                            const currentPlayer = message.players.find(p => p.name === playerName);
                            setIsHost(currentPlayer?.host || false);
                            break;
                        }
                            
                        case 'GAME_START': {
                            setGameStarting(true);
                            const currentPlayer = message.players.find(p => p.name === playerName);
                            navigate(`/game/${roomCode}`, { 
                                state: { 
                                    initialGameData: {
                                        config: message.config || {},
                                        players: message.players || [],
                                        map: message.map || { width: 0, height: 0, cells: [] },
                                        powerUps: []
                                    },
                                    playerId: currentPlayer?.id
                                } 
                            });
                            break;
                        }
                    }
                });
            } catch (err) {
                console.error('Connection error:', err);
                setError('Error connecting to the room');
                navigate('/');
            }
        };

        setupConnection();

        return () => {
            // No desconectar aquí para mantener conexión global
        };
    }, [roomCode, playerName, navigate, gameStarting, connect, subscribe]);


    const handleConfigChange = useCallback((newConfig: { lives: number; duration: number }) => {
        setGameConfig(newConfig);
        if (isHost) {
            sendMessage(`/app/room/${roomCode}/config`, { 
                config: newConfig
            });
        }
    }, [isHost, roomCode, sendMessage]);

    const handleToggleReady = useCallback(() => {
        const playerId = players.find(p => p.name === playerName)?.id;
        if (playerId) {
            sendMessage(`/app/room/${roomCode}/ready`, { playerId });
        }
    }, [playerName, players, roomCode, sendMessage]);

    const handleStartGame = useCallback(() => {
    if (isHost) {
        const player = players.find(p => p.name === playerName);
        if (player) {
            console.log('Sending start game request'); // Debug
            sendMessage(`/app/room/${roomCode}/start`, { 
                playerId: player.id,
                config: {  // <-- Envía la configuración actual
                    lives: gameConfig.lives,
                    duration: gameConfig.duration
                },
                timestamp: Date.now()
            });
        }
    }
}, [isHost, playerName, players, roomCode, sendMessage, gameConfig]);

    const handleLeaveRoom = useCallback(() => {
        const playerId = players.find(p => p.name === playerName)?.id;
        if (playerId) {
            sendMessage(`/app/room/${roomCode}/leave`, { playerId });
        }
        disconnect();
        navigate('/');
    }, [playerName, players, roomCode, sendMessage, disconnect, navigate]);

    if (!roomCode) {
        return (
            <div className="error-container">
                <h2>Error: No room code provided</h2>
                <button onClick={() => navigate('/')}>RETURN TO HOME</button>
            </div>
        );
    }

    return (
        <RetroWaitingRoom
            players={players}
            currentPlayerName={playerName}
            roomCode={roomCode}
            onStartGame={handleStartGame}
            onToggleReady={handleToggleReady}
            onLeaveRoom={handleLeaveRoom}
            isHost={isHost}
            isConnected={isConnected}
            error={error}
            onConfigChange={handleConfigChange}
            initialConfig={gameConfig}
        />
    );
};

export default WaitingRoomPage;