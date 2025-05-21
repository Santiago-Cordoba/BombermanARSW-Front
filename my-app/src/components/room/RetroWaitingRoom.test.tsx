// src/components/room/RetroWaitingRoom.test.tsx
/**
 * @vitest-environment happy-dom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock CSS import
vi.mock('./WaitingRoom.css', () => ({}));

import RetroWaitingRoom from './WaitingRoom';

describe('RetroWaitingRoom component', () => {
  const basePlayers = [
    { id: '1', name: 'Alice', ready: true, host: true },
    { id: '2', name: 'Bob', ready: false },
  ];
  let onStartGame: ReturnType<typeof vi.fn>;
  let onToggleReady: ReturnType<typeof vi.fn>;
  let onLeaveRoom: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onStartGame = vi.fn();
    onToggleReady = vi.fn();
    onLeaveRoom = vi.fn();
  });

  it('Test 54 – muestra título, código de sala, jugadores y estado conectado', () => {
    render(
      <RetroWaitingRoom
        players={basePlayers}
        currentPlayerName="Alice"
        roomCode="ROOM123"
        isConnected={true}
        isHost={true}
        onStartGame={onStartGame}
        onToggleReady={onToggleReady}
        onLeaveRoom={onLeaveRoom}
      />
    );
    expect(screen.getByText('SALA DE ESPERA')).toBeInTheDocument();
    expect(screen.getByText('Código de sala:')).toHaveTextContent('Código de sala: ROOM123');
    expect(screen.getByText('Jugadores:')).toHaveTextContent('Jugadores: 2/4');
    expect(screen.getByText(/Estado:/)).toHaveTextContent('Estado: CONECTADO');
    expect(screen.getByText('(Eres el host)')).toBeInTheDocument();
  });

  it('Test 55 – lista de jugadores con clases ready/current-player y badges', () => {
    render(
      <RetroWaitingRoom
        players={basePlayers}
        currentPlayerName="Alice"
        roomCode="ROOM123"
        isConnected={true}
        isHost={true}
        onStartGame={onStartGame}
        onToggleReady={onToggleReady}
        onLeaveRoom={onLeaveRoom}
      />
    );
    const aliceCard = screen.getByText('Alice').closest('.player-card');
    expect(aliceCard).toHaveClass('ready', 'current-player');
    expect(screen.getByText('(Host)')).toBeInTheDocument();
    expect(screen.getByText('(Tú)')).toBeInTheDocument();

    const bobCard = screen.getByText('Bob').closest('.player-card');
    expect(bobCard).not.toHaveClass('ready');
  });

  it('Test 56 – botón LISTO/NO LISTO llama onToggleReady y se deshabilita si desconectado', () => {
    // conectado
    const { unmount } = render(
      <RetroWaitingRoom
        players={basePlayers}
        currentPlayerName="Alice"
        roomCode="ROOM123"
        isConnected={true}
        isHost={false}
        onStartGame={onStartGame}
        onToggleReady={onToggleReady}
        onLeaveRoom={onLeaveRoom}
      />
    );
    let readyBtn = screen.getByRole('button', { name: /NO LISTO/ });
    expect(readyBtn).toBeEnabled();
    fireEvent.click(readyBtn);
    expect(onToggleReady).toHaveBeenCalledTimes(1);
    unmount();

    // desconectado
    render(
      <RetroWaitingRoom
        players={basePlayers}
        currentPlayerName="Alice"
        roomCode="ROOM123"
        isConnected={false}
        isHost={false}
        onStartGame={onStartGame}
        onToggleReady={onToggleReady}
        onLeaveRoom={onLeaveRoom}
      />
    );
    readyBtn = screen.getByRole('button', { name: /NO LISTO/ });
    expect(readyBtn).toBeDisabled();
  });

  it('Test 57 – botón INICIAR JUEGO habilitado solo si host y todos listos', () => {
    // host pero no todos listos
    const { unmount } = render(
      <RetroWaitingRoom
        players={basePlayers}
        currentPlayerName="Alice"
        roomCode="ROOM123"
        isConnected={true}
        isHost={true}
        onStartGame={onStartGame}
        onToggleReady={onToggleReady}
        onLeaveRoom={onLeaveRoom}
      />
    );
    let startBtn = screen.getByRole('button', { name: /INICIAR JUEGO/ });
    expect(startBtn).toBeDisabled();
    unmount();

    // todos listos
    const allReady = basePlayers.map(p => ({ ...p, ready: true }));
    render(
      <RetroWaitingRoom
        players={allReady}
        currentPlayerName="Alice"
        roomCode="ROOM123"
        isConnected={true}
        isHost={true}
        onStartGame={onStartGame}
        onToggleReady={onToggleReady}
        onLeaveRoom={onLeaveRoom}
      />
    );
    startBtn = screen.getByRole('button', { name: /INICIAR JUEGO/ });
    expect(startBtn).toBeEnabled();
    fireEvent.click(startBtn);
    expect(onStartGame).toHaveBeenCalledTimes(1);
  });

  it('Test 58 – botón SALIR DE LA SALA llama onLeaveRoom', () => {
    render(
      <RetroWaitingRoom
        players={basePlayers}
        currentPlayerName="Alice"
        roomCode="ROOM123"
        isConnected={true}
        isHost={false}
        onStartGame={onStartGame}
        onToggleReady={onToggleReady}
        onLeaveRoom={onLeaveRoom}
      />
    );
    const leaveBtn = screen.getByRole('button', { name: /SALIR DE LA SALA/ });
    expect(leaveBtn).toBeEnabled();
    fireEvent.click(leaveBtn);
    expect(onLeaveRoom).toHaveBeenCalledTimes(1);
  });
});
