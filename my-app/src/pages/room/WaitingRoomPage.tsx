import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import RetroWaitingRoom from '../../components/room/WaitingRoom';
import './WaitingRoomPage.css';

interface Player {
    id: string;
    name: string;
    ready: boolean;
    host: boolean;
}

interface GameConfig {
    duration?: number;
    players?: number;
    lives?: number;
    // Agrega aquí otras propiedades de configuración que necesites
  }

interface SocketMessage {
    type: string;
    players?: Player[];
    host?: string;
    redirectTo?: string;
    config?: GameConfig;
}

const WaitingRoomPage: React.FC = () => {
    const { roomCode } = useParams<{ roomCode: string }>();
    const navigate = useNavigate();
    const [playerName, setPlayerName] = useState('');
    const [players, setPlayers] = useState<Player[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [error, setError] = useState('');
    const stompClientRef = React.useRef<Client | null>(null);
    const [gameStarting, setGameStarting] = useState(false);

    useEffect(() => {
        const savedName = localStorage.getItem('playerName');
        if (savedName) {
            setPlayerName(savedName);
        }
    }, []);

    useEffect(() => {
        if (!playerName || !roomCode || gameStarting) return;
    
        const client = new Client({
          brokerURL: 'ws://localhost:8080/ws',
          debug: (str) => console.log(str),
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });
    
        client.onConnect = (frame) => {
          setIsConnected(true);
          
          client.subscribe(`/topic/room/${roomCode}`, (message) => {
            try {
              const data: SocketMessage = JSON.parse(message.body);
              console.log('Received message:', data);
              
              if (data.type === 'PLAYER_UPDATE') {
                setPlayers(data.players || []);
                const currentPlayer = data.players?.find(p => p.name === playerName);
                setIsHost(currentPlayer?.host || false);
              } else if (data.type === 'GAME_START') {
                setGameStarting(true);
                setTimeout(() => {
                  navigate('/game', { 
                    state: { 
                      roomCode,
                      config: data.config || {},
                      players: data.players || []
                    } 
                  });
                }, 300);
              }
            } catch (error) {
              console.error('Error parsing message:', error);
              setError('Error processing room update');
            }
          });

            // Unirse a la sala
            client.publish({
                destination: `/app/room/${roomCode}/join`,
                body: JSON.stringify({ playerName }),
                headers: { 'content-type': 'application/json' }
            });
        };

        client.onStompError = (frame) => {
            console.error('STOMP error:', frame);
            setError(`Connection error: ${frame.headers.message || 'Unknown error'}`);
        };

        client.onDisconnect = () => {
            setIsConnected(false);
        };

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (!gameStarting && stompClientRef.current?.connected) {
                stompClientRef.current.deactivate();
            }
        };
    }, [roomCode, playerName, navigate, gameStarting]);

    const handleToggleReady = () => {
        if (stompClientRef.current?.connected) {
            const playerId = players.find(p => p.name === playerName)?.id;
            if (playerId) {
                stompClientRef.current.publish({
                    destination: `/app/room/${roomCode}/ready`,
                    body: JSON.stringify({ playerId }),
                    headers: { 'content-type': 'application/json' }
                });
            }
        }
    };

    const handleStartGame = () => {
        if (stompClientRef.current?.connected && isHost) {
            const playerId = players.find(p => p.name === playerName)?.id;
            if (playerId) {
                stompClientRef.current.publish({
                    destination: `/app/room/${roomCode}/start`,
                    body: JSON.stringify({ playerId }),
                    headers: { 'content-type': 'application/json' }
                });
            }
        }
    };

    const handleLeaveRoom = () => {
        if (stompClientRef.current?.connected) {
            const playerId = players.find(p => p.name === playerName)?.id;
            if (playerId) {
                stompClientRef.current.publish({
                    destination: `/app/room/${roomCode}/leave`,
                    body: JSON.stringify({ playerId }),
                    headers: { 'content-type': 'application/json' }
                });
            }
            stompClientRef.current.deactivate();
        }
        navigate('/');
    };

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
        />
    );
};

export default WaitingRoomPage;