// src/components/PowerupInvincible/PowerupInvincible.test.tsx
/**
 * @vitest-environment happy-dom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import PowerupInvincible from './PowerupInvincible';

describe('PowerupInvincible component', () => {
  it('Test 48 – renderiza imagen con alt y estilo correctos', () => {
    render(<PowerupInvincible />);
    const img = screen.getByRole('img', { name: /invincibility power-up/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src');
    // El src debe contener 'powerup2.png'
    expect(img.getAttribute('src')).toMatch(/powerup2\.png$/);
    expect(img).toHaveStyle({ width: '20px', height: '20px' });
    console.log('✅ Test 48 PowerupInvincible render image');
  });
});
