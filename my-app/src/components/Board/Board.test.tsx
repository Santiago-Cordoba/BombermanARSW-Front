// src/components/Board/Board.test.tsx
/**
 * @vitest-environment happy-dom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { GameInfo, CellComponent } from './Board';

// Test 19: GameInfo
// Verifica formateo de tiempo y despliegue de vidas y jugadores

describe('GameInfo component', () => {
  it('Test 19 – muestra tiempo formateado, vidas y jugadores', () => {
    const config = { duration: 125, lives: 4 };
    const playerCount = 3;

    render(<GameInfo config={config} playerCount={playerCount} />);

    // 125 segundos -> 2:05
    expect(screen.getByText('Tiempo: 2:05')).toBeInTheDocument();
    expect(screen.getByText('Vidas: 4')).toBeInTheDocument();
    expect(screen.getByText('Jugadores: 3')).toBeInTheDocument();
    console.log('✅ Test 19 GameInfo display correct');
  });
});

// Test 20: CellComponent
// Verifica clases y contenido según props
describe('CellComponent', () => {
  it('Test 20a – celda vacía sin jugador ni power-up', () => {
    const cell = { x: 0, y: 0, isWall: false, isDestructible: false, hasPowerUp: false };
    render(<CellComponent cell={cell} />);
    const div = screen.getByTestId('board-cell');
    expect(div).toHaveClass('cell', 'empty');
    expect(div).toBeEmptyDOMElement();
    console.log('✅ Test 20a CellComponent empty cell');
  });

  it('Test 20b – celda destructible muestra clase destructible', () => {
    const cell = { x: 0, y: 0, isWall: true, isDestructible: true, hasPowerUp: false };
    render(<CellComponent cell={cell} />);
    const div = screen.getByTestId('board-cell');
    expect(div).toHaveClass('cell', 'destructible');
    console.log('✅ Test 20b CellComponent destructible');
  });

  it('Test 20c – celda muro muestra clase wall', () => {
    const cell = { x: 0, y: 0, isWall: true, isDestructible: false, hasPowerUp: false };
    render(<CellComponent cell={cell} />);
    const div = screen.getByTestId('board-cell');
    expect(div).toHaveClass('cell', 'wall');
    console.log('✅ Test 20c CellComponent wall');
  });

  it('Test 20d – celda con jugador muestra indicador de jugador', () => {
    const cell = { x: 0, y: 0, isWall: false, isDestructible: false, hasPowerUp: false };
    const player = { id: 'p1', name: '1', x: 0, y: 0 };
    render(<CellComponent cell={cell} player={player} />);
    const div = screen.getByTestId('board-cell');
    const child = div.querySelector('.player-indicator.player-1');
    expect(child).toBeInTheDocument();
    console.log('✅ Test 20d CellComponent player indicator');
  });

  it('Test 20e – celda con power-up INVINCIBILITY muestra 🛡️', () => {
    const cell = { x: 0, y: 0, isWall: false, isDestructible: false, hasPowerUp: true, powerUpType: 'INVINCIBILITY' };
    render(<CellComponent cell={cell} />);
    const div = screen.getByTestId('board-cell');
    const pu = div.querySelector('.power-up-indicator');
    expect(pu).toHaveTextContent('🛡️');
    console.log('✅ Test 20e CellComponent invincibility power-up');
  });

  it('Test 20f – celda con power-up genérico muestra ✨', () => {
    const cell = { x: 0, y: 0, isWall: false, isDestructible: false, hasPowerUp: true, powerUpType: 'SPEED' };
    render(<CellComponent cell={cell} />);
    const div = screen.getByTestId('board-cell');
    const pu = div.querySelector('.power-up-indicator');
    expect(pu).toHaveTextContent('✨');
    console.log('✅ Test 20f CellComponent generic power-up');
  });
});
