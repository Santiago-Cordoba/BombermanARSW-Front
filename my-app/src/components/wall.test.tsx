/**
 * @vitest-environment happy-dom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WallManager } from "./wall";

vi.useFakeTimers();

describe("WallManager component", () => {
  beforeEach(() => {
    // Siempre elige el primer índice disponible
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("Test 12 – genera un bloque de muro en la posición correcta y lo renderiza", () => {
    let capturedWalls: { row: number; col: number }[] = [];

    render(
      <WallManager
        size={4}
        center={{ row: 1, col: 1 }}
        blocks={1}
      >
        {(renderWall, walls) => {
          capturedWalls = walls;
          return (
            <>
              {/* Esta celda debe renderizar un muro */}
              <div data-testid="wall">{renderWall(1, 2)}</div>
              {/* Esta celda NO debe renderizar nada */}
              <div data-testid="no-wall">{renderWall(1, 1)}</div>
            </>
          );
        }}
      </WallManager>
    );

    // 1) El array 'walls' debe contener exactamente la posición elegida
    expect(capturedWalls).toEqual([{ row: 1, col: 2 }]);

    // 2) renderWall(1,2) debe producir un <div class="game-cell wall-block">
    const wallCell = screen.getByTestId("wall").firstChild;
    expect(wallCell).toHaveClass("game-cell", "wall-block");

    // 3) renderWall(1,1) debe devolver null (no hay muro ahí)
    expect(screen.getByTestId("no-wall").firstChild).toBeNull();

    console.log("✅ Test 12 WallManager renders wall-block correctly");
  });
});
