/**
 * @vitest-environment happy-dom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import Bomb from './bomb';

describe('Bomb component', () => {
  it('Test 17 – renderiza el temporizador y la clase base', () => {
    render(<Bomb timer={5} isOwner={false} />);
    // Debe mostrar el número 5
    expect(screen.getByText('5')).toBeInTheDocument();

    // El contenedor principal debe tener la clase "bomb" y NO "owner-bomb"
    const container = screen.getByText('5').parentElement;
    expect(container).toHaveClass('bomb');
    expect(container).not.toHaveClass('owner-bomb');

    console.log('✅ Test 17 Bomb basic render');
  });

  it('Test 18 – aplica la clase "owner-bomb" cuando isOwner=true', () => {
    render(<Bomb timer={10} isOwner={true} />);
    // Debe mostrar el número 10
    expect(screen.getByText('10')).toBeInTheDocument();

    // Ahora debe tener ambas clases
    const container = screen.getByText('10').parentElement;
    expect(container).toHaveClass('bomb', 'owner-bomb');

    console.log('✅ Test 18 Bomb owner class');
  });
});
