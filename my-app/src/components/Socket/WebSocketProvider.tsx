import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
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
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const stompClient = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const disconnectCallbacks = useRef<(() => void)[]>([]);

  const connect = useCallback(async (roomCode: string, playerName: string, onDisconnect?: () => void): Promise<void> => {
    if (stompClient.current?.connected) return;

    if (onDisconnect) {
      disconnectCallbacks.current.push(onDisconnect);
    }

    return new Promise((resolve, reject) => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }

      const client = new Client({
        brokerURL: 'ws://localhost:8080/ws',

        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (str) => console.debug('STOMP:', str),
      });

      client.onConnect = () => {
        setIsConnected(true);
        client.publish({
          destination: `/app/room/${roomCode}/join`,
          body: JSON.stringify({ playerName }),
          headers: { 'content-type': 'application/json' }
        });
        resolve();
      };

      client.onStompError = (frame) => {
        reject(new Error(frame.headers.message || 'STOMP connection error'));
      };

      client.onWebSocketError = () => {
        reject(new Error('WebSocket connection error'));
      };

      client.onDisconnect = () => {
        setIsConnected(false);
        // Ejecutar callbacks de desconexión
        disconnectCallbacks.current.forEach(cb => cb());
        disconnectCallbacks.current = [];
      };

      stompClient.current = client;
      client.activate();
    });
  }, []);

  const disconnect = useCallback(() => {
    if (stompClient.current?.connected) {
      stompClient.current.deactivate();
    }
    stompClient.current = null;
    setIsConnected(false);
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
    
    return stompClient.current.subscribe(destination, (message: IMessage) => {
      try {
        const parsedBody = JSON.parse(message.body) as T;
        callback(parsedBody);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });
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

  React.useEffect(() => () => disconnect(), [disconnect]);

  return (
    <WebSocketContext.Provider value={{
      stompClient: stompClient.current,
      isConnected,
      connect,
      disconnect,
      subscribe,
      sendMessage
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