// src/components/PlayerController/PlayerControllerWithCollision.test.tsx
/**
 * @vitest-environment happy-dom
 */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import PlayerController from './playerMovement';

describe('PlayerController with collision and bombs', () => {
  const boardSize = 3;
  const initialPosition = { row: 1, col: 1 };
  it('Test 49 – mueve UP si la posición es válida', () => {
    const onPositionChange = vi.fn();
    const onPlaceBomb = vi.fn();
    render(
      <PlayerController
        initialPosition={initialPosition}
        boardSize={boardSize}
        onPositionChange={onPositionChange}
        onPlaceBomb={onPlaceBomb}
        walls={[]}
        bombs={[]}
      >
        <div />
      </PlayerController>
    );
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(onPositionChange).toHaveBeenCalledWith('UP');
  });

  it('Test 50 – no mueve fuera de límites', () => {
    const onPositionChange = vi.fn();
    const onPlaceBomb = vi.fn();
    // initial at top-left corner
    render(
      <PlayerController
        initialPosition={{ row: 0, col: 0 }}
        boardSize={boardSize}
        onPositionChange={onPositionChange}
        onPlaceBomb={onPlaceBomb}
        walls={[]}
        bombs={[]}
      >
        <div />
      </PlayerController>
    );
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(onPositionChange).not.toHaveBeenCalled();
  });

  it('Test 51 – no mueve si hay pared en destino', () => {
    const onPositionChange = vi.fn();
    const onPlaceBomb = vi.fn();
    // wall directly above
    render(
      <PlayerController
        initialPosition={initialPosition}
        boardSize={boardSize}
        onPositionChange={onPositionChange}
        onPlaceBomb={onPlaceBomb}
        walls={[{ row:0, col:1 }]}
        bombs={[]}
      >
        <div />
      </PlayerController>
    );
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(onPositionChange).not.toHaveBeenCalled();
  });

  it('Test 52 – no mueve si hay bomba en destino', () => {
    const onPositionChange = vi.fn();
    const onPlaceBomb = vi.fn();
    // bomb directly to the right
    render(
      <PlayerController
        initialPosition={initialPosition}
        boardSize={boardSize}
        onPositionChange={onPositionChange}
        onPlaceBomb={onPlaceBomb}
        walls={[]}
        bombs={[{ row:1, col:2 }]}
      >
        <div />
      </PlayerController>
    );
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(onPositionChange).not.toHaveBeenCalled();
  });

  it('Test 53 – al pulsar espacio llama onPlaceBomb', () => {
    const onPositionChange = vi.fn();
    const onPlaceBomb = vi.fn();
    render(
      <PlayerController
        initialPosition={initialPosition}
        boardSize={boardSize}
        onPositionChange={onPositionChange}
        onPlaceBomb={onPlaceBomb}
        walls={[]}
        bombs={[]}
      >
        <div />
      </PlayerController>
    );
    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    expect(onPlaceBomb).toHaveBeenCalledTimes(1);
  });
});
