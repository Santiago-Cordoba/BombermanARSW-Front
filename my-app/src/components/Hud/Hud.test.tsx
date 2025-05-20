/**
 * @vitest-environment happy-dom
 */
import React from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import HUD from "./Hud";

describe("HUD component", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  it("Test 13 – muestra roomCode y lives correctamente", () => {
    render(
      <HUD
        initialTime={60}
        roomCode="ROOM42"
        lives={5}
        isRunning={false}
      />
    );
    // Verificar que aparece el código de sala
    expect(screen.getByText(/ROOM42/)).toBeInTheDocument();
    // Verificar que aparece el contador de vidas
    expect(screen.getByText(/Lives:\s*5/)).toBeInTheDocument();
    console.log("✅ Test 13 HUD display roomCode & lives");
  });

  it("Test 14 – cuenta tiempo y llama onTimeEnd al llegar a 0", () => {
    const onTimeEnd = vi.fn();
    render(
      <HUD
        initialTime={3}     // 3 segundos
        roomCode="X"
        lives={1}
        isRunning={true}
        onTimeEnd={onTimeEnd}
      />
    );

    // Avanzar 3s completos
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // onTimeEnd debe haberse llamado exactamente una vez
    expect(onTimeEnd).toHaveBeenCalledTimes(1);
    console.log("✅ Test 14 HUD onTimeEnd callback");
  });
});
