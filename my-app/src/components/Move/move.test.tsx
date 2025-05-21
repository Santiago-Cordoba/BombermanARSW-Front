import { render, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PlayerController } from './PlayerMovement';

describe('PlayerController', () => {
  it('debe llamar onPositionChange al moverse con teclas W, A, S, D y respetar límites', async () => {
    const onPositionChange = vi.fn();
    const onPlaceBomb = vi.fn();

    const boardSize = 5;
    const initialPosition = { row: 2, col: 2 };

    render(
      <PlayerController
        initialPosition={initialPosition}
        boardSize={boardSize}
        onPositionChange={onPositionChange}
        onPlaceBomb={onPlaceBomb}
      />
    );

    // Usamos act para que React procese la actualización de estado antes de hacer la siguiente comprobación

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
    });

    expect(onPositionChange).toHaveBeenLastCalledWith({ row: 1, col: 2 });

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    });

    expect(onPositionChange).toHaveBeenLastCalledWith({ row: 1, col: 1 });

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
    });

    expect(onPositionChange).toHaveBeenLastCalledWith({ row: 2, col: 1 });

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
    });

    expect(onPositionChange).toHaveBeenLastCalledWith({ row: 2, col: 2 });

    // Probar límites: no debería llamar con posiciones fuera del board

    onPositionChange.mockClear();

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' })); // 2->1
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' })); // 1->0 (limite)
    });

    // No debería llamar onPositionChange con {row: 0, col: 2} porque está fuera de límites
    expect(onPositionChange).not.toHaveBeenCalledWith({ row: 0, col: 2 });

    onPositionChange.mockClear();

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' })); // 2->1
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' })); // 1->0 (limite)
    });

    expect(onPositionChange).not.toHaveBeenCalledWith({ row: 1, col: 0 });
  });

  it('debe llamar onPlaceBomb al presionar tecla F', async () => {
    const onPositionChange = vi.fn();
    const onPlaceBomb = vi.fn();

    render(
      <PlayerController
        initialPosition={{ row: 2, col: 2 }}
        boardSize={5}
        onPositionChange={onPositionChange}
        onPlaceBomb={onPlaceBomb}
      />
    );

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' }));
    });

    expect(onPlaceBomb).toHaveBeenCalled();
  });

  it('debe limpiar el event listener al desmontar', () => {
    const onPositionChange = vi.fn();
    const onPlaceBomb = vi.fn();

    const { unmount } = render(
      <PlayerController
        initialPosition={{ row: 2, col: 2 }}
        boardSize={5}
        onPositionChange={onPositionChange}
        onPlaceBomb={onPlaceBomb}
      />
    );

    const removeSpy = vi.spyOn(window, 'removeEventListener');

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
