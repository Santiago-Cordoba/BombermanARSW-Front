// src/components/GameLogo/GameLogo.test.tsx
/**
 * @vitest-environment happy-dom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';

// Mock the image import
vi.mock('../../images/fondo2.jpg', () => ({ default: 'mocked-fondo.jpg' }));

import GameLogo from './GameLogo';

describe('GameLogo component', () => {
  it('Test 39 – muestra la imagen de fondo con alt y clase correctas', () => {
    render(<GameLogo />);
    const img = screen.getByRole('img', { name: /bomberman logo/i });
    expect(img).toHaveAttribute('src', 'mocked-fondo.jpg');
    expect(img).toHaveClass('w-full', 'h-full', 'object-cover');
    console.log('✅ Test 39 GameLogo background image');
  });

  it('Test 40 – renderiza BlinkingText dentro', () => {
    render(<GameLogo />);
    // BlinkingText renders an <h2>
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    console.log('✅ Test 40 GameLogo includes BlinkingText');
  });
});
