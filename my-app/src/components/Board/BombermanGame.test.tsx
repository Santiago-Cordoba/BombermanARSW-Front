// src/components/Board/BombermanGame.test.tsx
/**
 * @vitest-environment happy-dom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';

// Mock useWebSocket before importing the component
const mockSubscribe = vi.fn();
const mockContext = {
  isConnected: false,
  subscribe: mockSubscribe,
  sendMessage: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  stompClient: null,
};
vi.mock('../../components/Socket/WebSocketProvider', () => ({
  useWebSocket: () => mockContext,
}));

import BombermanGame, { GameInfo, GameMapDisplay } from './Board';

// Fake game message
const fakeMessage = {
  type: 'GAME_START',
  config: { duration: 90, lives: 2 },
  players: [{ id: 'p1', name: '1', x: 0, y: 1 }],
  map: {
    width: 2,
    height: 2,
    cells: [
      [
        { x: 0, y: 0, isWall: false, isDestructible: false, hasPowerUp: false },
        { x: 1, y: 0, isWall: false, isDestructible: false, hasPowerUp: false },
      ],
      [
        { x: 0, y: 1, isWall: false, isDestructible: false, hasPowerUp: false },
        { x: 1, y: 1, isWall: false, isDestructible: false, hasPowerUp: false },
      ],
    ],
  },
};

describe('BombermanGame component', () => {
  it('Test 23 – muestra loading mientras no está conectado', () => {
    render(<BombermanGame roomCode="ROOM1" />);
    expect(screen.getByText(/Cargando juego/)).toBeInTheDocument();
    console.log('✅ Test 23 BombermanGame loading state');
  });

  it('Test 24 – recibe mensaje GAME_START y muestra GameInfo y GameMapDisplay', () => {
    mockContext.isConnected = true;
    mockSubscribe.mockImplementation((_dest, cb) => {
      cb(fakeMessage);
      return { unsubscribe: () => {} };
    });

    render(<BombermanGame roomCode="ROOM1" />);

    expect(screen.getByText('Tiempo: 1:30')).toBeInTheDocument();
    expect(screen.getByText('Vidas: 2')).toBeInTheDocument();
    expect(screen.getAllByTestId('board-cell')).toHaveLength(4);
    console.log('✅ Test 24 BombermanGame game start handling');
  });

  it('Test 25 – maneja GAME_UPDATE y actualiza GameInfo', () => {
    const updateMsg = { ...fakeMessage, type: 'GAME_UPDATE', config: { duration: 120, lives: 3 } };
    mockContext.isConnected = true;
    mockSubscribe.mockImplementation((_dest, cb) => {
      cb(fakeMessage);
      cb(updateMsg);
      return { unsubscribe: () => {} };
    });

    render(<BombermanGame roomCode="ROOM1" />);

    expect(screen.getByText('Tiempo: 2:00')).toBeInTheDocument();
    expect(screen.getByText('Vidas: 3')).toBeInTheDocument();
    console.log('✅ Test 25 BombermanGame GAME_UPDATE handling');
  });

  it('Test 26 – limpia suscripción al desmontar', () => {
    const unsubMock = vi.fn();
    mockContext.isConnected = true;
    mockSubscribe.mockReturnValue({ unsubscribe: unsubMock });

    const { unmount } = render(<BombermanGame roomCode="ROOM1" />);
    unmount();
    expect(unsubMock).toHaveBeenCalled();
    console.log('✅ Test 26 BombermanGame unsubscribe on unmount');
  });
});
