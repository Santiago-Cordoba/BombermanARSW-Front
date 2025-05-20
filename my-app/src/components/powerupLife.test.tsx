/**
 * @vitest-environment happy-dom
 */
import React from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";
import { PowerUpManager } from "./powerupLife";

describe("PowerUpManager", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  const boardSize = 3;
  const gameMap = [
    [
      { x: 0, y: 0, isWall: true, isDestructible: false },
      { x: 1, y: 0, isWall: true, isDestructible: false },
      { x: 2, y: 0, isWall: true, isDestructible: false },
    ],
    [
      { x: 0, y: 1, isWall: true, isDestructible: false },
      { x: 1, y: 1, isWall: false, isDestructible: false },
      { x: 2, y: 1, isWall: true, isDestructible: false },
    ],
    [
      { x: 0, y: 2, isWall: true, isDestructible: false },
      { x: 1, y: 2, isWall: true, isDestructible: false },
      { x: 2, y: 2, isWall: true, isDestructible: false },
    ],
  ];

  let onCollectMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Forzamos siempre la misma posición: (1,1)
    vi.spyOn(Math, "random").mockReturnValue(0);
    onCollectMock = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Test 10 – genera y muestra el power-up en (1,1) sin colectar", () => {
    render(
      <PowerUpManager
        boardSize={boardSize}
        playerPosition={{ row: 0, col: 0 }}  // distinto para NO disparar onCollect
        maxLives={3}
        currentLives={2}
        onCollect={onCollectMock}
        gameMap={gameMap}
      >
        {(renderPowerUp) => (
          <div data-testid="cell">{renderPowerUp(1, 1)}</div>
        )}
      </PowerUpManager>
    );

    act(() => {
      vi.advanceTimersByTime(15_000);
    });

    const cell = screen.getByTestId("cell");
    const powerup = cell.querySelector(".game-cell.powerup.life");
    expect(powerup).not.toBeNull();
    expect(onCollectMock).not.toHaveBeenCalled();
    console.log("✅ Test 10 PowerUpManager render power-up");
  });

  it("Test 11 – llama a onCollect cuando el jugador está en la posición", () => {
    render(
      <PowerUpManager
        boardSize={boardSize}
        playerPosition={{ row: 1, col: 1 }}
        maxLives={3}
        currentLives={2}
        onCollect={onCollectMock}
        gameMap={gameMap}
      >
        {(renderPowerUp) => <div data-testid="noop">{renderPowerUp(1, 1)}</div>}
      </PowerUpManager>
    );

    act(() => {
      vi.advanceTimersByTime(15_000);
    });

    expect(onCollectMock).toHaveBeenCalled();
    console.log("✅ Test 11 PowerUpManager onCollect");
  });
});
