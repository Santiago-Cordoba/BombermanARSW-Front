/**
 * @vitest-environment happy-dom
 */

import { render, screen } from '@testing-library/react';
import Hello from './Hello';
import { describe, it, expect } from 'vitest';

describe('Hello component', () => {
  it('muestra el mensaje pasado por props', () => {
    render(<Hello message="¡Hola!" />);
    expect(screen.getByText('¡Hola!')).toBeInTheDocument();
  });
});
