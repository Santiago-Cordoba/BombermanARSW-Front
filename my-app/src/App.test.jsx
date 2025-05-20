import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('App (smoke test)', () => {
  it('monta el componente sin fallar y muestra el botón Empezar', async () => {
    const { container } = render(<App />);
    const startBtn = screen.getByRole('button', { name: /empezar/i });
    expect(startBtn).toBeInTheDocument();
  });

  it('renderiza el elemento audio con loop y la ruta correcta', () => {
    const { container } = render(<App />);
    const audio = container.querySelector('audio');
    // debe existir
    expect(audio).toBeInTheDocument();
    // tiene loop
    expect(audio).toHaveAttribute('loop');
    // src coincide con tu fichero de música
    expect(audio).toHaveAttribute(
      'src',
      '/Bomberman (NES) Music - Stage Theme.mp3'
    );
  });
});
