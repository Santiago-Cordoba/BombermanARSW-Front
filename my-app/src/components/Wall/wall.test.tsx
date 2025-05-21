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
    vi.spyOn(Math, 'random').mockRestore();
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
    // Mock para controlar las posiciones generadas
    const mockRandom = vi.spyOn(Math, 'random')
      .mockImplementationOnce(() => 0.1)  // (1,1)
      .mockImplementationOnce(() => 0.3)  // (1,2)
      .mockImplementationOnce(() => 0.5)  // (1,3)
      .mockImplementationOnce(() => 0.7)  // (2,1)
      .mockImplementationOnce(() => 0.9)  // (2,3)
      .mockImplementationOnce(() => 0.2)  // (3,1)
      .mockImplementationOnce(() => 0.4)  // (3,2)
      .mockImplementationOnce(() => 0.6); // (3,3)

    render(<WallManager {...baseProps} blocks={8} />);
    const renderWallFunction = mockChildren.mock.calls[0][0];
    
    let wallCount = 0;
    for (let row = 0; row < baseProps.size; row++) {
      for (let col = 0; col < baseProps.size; col++) {
        if (renderWallFunction(row, col) !== null) {
          wallCount++;
        }
      }
    }
    
    // Verificamos que se generaron exactamente 8 paredes
    expect(wallCount).toBe(8);
  });

  test('never places a wall in the center position', () => {
    vi.spyOn(Math, 'random').mockImplementation(() => 0.5);
    render(<WallManager {...baseProps} blocks={10} />);
    const renderWallFunction = mockChildren.mock.calls[0][0];
    expect(renderWallFunction(baseProps.center.row, baseProps.center.col)).toBeNull();
  });

  test('renderWall returns correct JSX for wall positions', () => {
    // Forzamos una pared específica en (1,1)
    vi.spyOn(Math, 'random').mockImplementation(() => 0.1);
    
    render(<WallManager {...baseProps} blocks={1} />);
    const renderWallFunction = mockChildren.mock.calls[0][0];
    const wallElement = renderWallFunction(1, 1);
    
    expect(wallElement).not.toBeNull();
    
    if (wallElement) {
      const { container } = render(wallElement);
      const wallDiv = container.firstChild as HTMLElement;
      
      expect(wallDiv).toHaveClass('game-cell');
      expect(wallDiv).toHaveClass('wall-block');
      
      // Verificación más flexible del estilo
      expect(wallDiv.style.backgroundImage).toContain('wall-image-path');
      expect(wallDiv.style.backgroundColor).toBe('transparent');
    }
  });
});