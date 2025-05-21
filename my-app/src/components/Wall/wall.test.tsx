import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WallManager } from './wall';

// Mock para la imagen
vi.mock('../../images/wall.png', () => ({
  default: 'wall-image-path'
}));

describe('WallManager Component', () => {
  const mockChildren = vi.fn((renderWall) => (
    <div data-testid="test-children">
      {renderWall(1, 1)}
      {renderWall(2, 2)}
    </div>
  ));

  const baseProps = {
    size: 5,
    center: { row: 2, col: 2 },
    children: mockChildren,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<WallManager {...baseProps} />);
    expect(mockChildren).toHaveBeenCalled();
  });

  test('does not render walls when blocks is 0', () => {
    render(<WallManager {...baseProps} blocks={0} />);
    const renderWallFunction = mockChildren.mock.calls[0][0];
    expect(renderWallFunction(1, 1)).toBeNull();
    expect(renderWallFunction(3, 3)).toBeNull();
  });

  test('generates correct number of walls', () => {
    const { rerender } = render(<WallManager {...baseProps} blocks={3} />);
    const renderWallFunction = mockChildren.mock.calls[0][0];
    
    let wallCount = 0;
    for (let row = 0; row < baseProps.size; row++) {
      for (let col = 0; col < baseProps.size; col++) {
        if (renderWallFunction(row, col) !== null) {
          wallCount++;
        }
      }
    }
    expect(wallCount).toBe(3);

    // Prueba con más bloques de los disponibles
    rerender(<WallManager {...baseProps} blocks={20} />);
    const newRenderWallFunction = mockChildren.mock.calls[1][0];
    let newWallCount = 0;
    
    for (let row = 0; row < baseProps.size; row++) {
      for (let col = 0; col < baseProps.size; col++) {
        if (newRenderWallFunction(row, col) !== null) {
          newWallCount++;
        }
      }
    }
    
    const maxPossibleWalls = (baseProps.size - 2) ** 2 - 1;
    expect(newWallCount).toBe(maxPossibleWalls);
  });

  test('never places a wall in the center position', () => {
    render(<WallManager {...baseProps} blocks={10} />);
    const renderWallFunction = mockChildren.mock.calls[0][0];
    expect(renderWallFunction(baseProps.center.row, baseProps.center.col)).toBeNull();
  });

  test('renderWall returns correct JSX for wall positions', () => {
    // Forzar posiciones conocidas para la prueba
    const mockMath = Object.create(global.Math);
    mockMath.random = () => 0.5;
    global.Math = mockMath;

    render(<WallManager {...baseProps} blocks={2} />);
    const renderWallFunction = mockChildren.mock.calls[0][0];
    const wallElement = renderWallFunction(1, 1);
    
    if (wallElement) {
      const { container } = render(wallElement);
      expect(container.firstChild).toHaveClass('game-cell wall-block');
      expect(container.firstChild).toHaveStyle({
        backgroundImage: 'url(wall-image-path)',
        backgroundColor: 'transparent',
      });
    } else {
      expect.fail('Expected a wall element but got null');
    }
  });
});