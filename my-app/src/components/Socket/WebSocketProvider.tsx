import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

type MessageBody = Record<string, unknown> | unknown[];

interface WebSocketContextType {
  stompClient: Client | null;
  isConnected: boolean;
  connect: (roomCode: string, playerName: string, onDisconnect?: () => void) => Promise<void>;
  disconnect: () => void;
  subscribe: <T = MessageBody>(
    destination: string, 
    callback: (message: T) => void
  ) => StompSubscription | null;
  sendMessage: <T = MessageBody>(destination: string, body: T) => void;
  currentRoom: string | null;
  currentPlayer: string | null;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const stompClient = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);
  const disconnectCallbacks = useRef<(() => void)[]>([]);
  const subscriptions = useRef<StompSubscription[]>([]);

  const checkRoomExists = useCallback(async (roomCode: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/redis/room/${roomCode}`);
      return response.ok;
    } catch (error) {
      console.error('Error checking room:', error);
      return false;
    }
  }, []);

  const connect = useCallback(async (roomCode: string, playerName: string, onDisconnect?: () => void): Promise<void> => {
    if (stompClient.current?.connected && currentRoom === roomCode) return;

    return new Promise(async (resolve, reject) => {
      // Limpiar conexión anterior si existe
      if (stompClient.current) {
        stompClient.current.deactivate();
        subscriptions.current.forEach(sub => sub.unsubscribe());
        subscriptions.current = [];
      }

      if (onDisconnect) {
        disconnectCallbacks.current.push(onDisconnect);
      }

      const roomExists = await checkRoomExists(roomCode);
      const client = new Client({
        brokerURL: 'wss://sirve.canadacentral.cloudapp.azure.com/ws',
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (str) => console.debug('STOMP:', str),
      });

      client.onConnect = () => {
        setIsConnected(true);
        setCurrentRoom(roomCode);
        setCurrentPlayer(playerName);
        
        // Suscribirse a actualizaciones de la sala
        const roomSubscription = client.subscribe(
          `/topic/room/${roomCode}`,
          (message) => {
            try {
              const data = JSON.parse(message.body);
              console.log('Room update:', data);
            } catch (error) {
              console.error('Error parsing room update:', error);
            }
          }
        );
        subscriptions.current.push(roomSubscription);

        // Unirse a la sala
        client.publish({
          destination: `/app/room/${roomCode}/join`,
          body: JSON.stringify({ 
            playerName,
            isReconnecting: roomExists 
          }),
          headers: { 'content-type': 'application/json' }
        });

        resolve();
      };

      client.onStompError = (frame) => {
        console.error('STOMP error:', frame);
        reject(new Error(frame.headers.message || 'STOMP connection error'));
      };

      client.onWebSocketError = (error) => {
        console.error('WebSocket error:', error);
        reject(new Error('WebSocket connection error'));
      };

      client.onDisconnect = () => {
        setIsConnected(false);
        setCurrentRoom(null);
        setCurrentPlayer(null);
        subscriptions.current = [];
        disconnectCallbacks.current.forEach(cb => cb());
        disconnectCallbacks.current = [];
      };

      stompClient.current = client;
      client.activate();
    });
  }, [currentRoom, checkRoomExists]);

  const disconnect = useCallback(() => {
    if (stompClient.current?.connected) {
      stompClient.current.deactivate();
    }
    stompClient.current = null;
    setIsConnected(false);
    setCurrentRoom(null);
    setCurrentPlayer(null);
    subscriptions.current = [];
    disconnectCallbacks.current.forEach(cb => cb());
    disconnectCallbacks.current = [];
  }, []);

  const subscribe = useCallback(<T = MessageBody>(
    destination: string, 
    callback: (message: T) => void
  ): StompSubscription | null => {
    if (!stompClient.current?.connected) {
      console.error('Cannot subscribe - no active connection');
      return null;
    }
    
    const subscription = stompClient.current.subscribe(destination, (message: IMessage) => {
      try {
        const parsedBody = JSON.parse(message.body) as T;
        callback(parsedBody);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });
    
    subscriptions.current.push(subscription);
    return subscription;
  }, []);

  const sendMessage = useCallback(<T = MessageBody>(destination: string, body: T): void => {
    if (!stompClient.current?.connected) {
      console.error('Cannot send message - no active connection');
      return;
    }
    
    stompClient.current.publish({
      destination,
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json' }
    });
  }, []);

  // Limpieza al desmontar el componente
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return (
    <WebSocketContext.Provider value={{
      stompClient: stompClient.current,
      isConnected,
      connect,
      disconnect,
      subscribe,
      sendMessage,
      currentRoom,
      currentPlayer
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
