// src/App.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('App (smoke test)', () => {
  it('Test 1 – monta el componente sin fallar y muestra el botón Empezar', async () => {
    const { container } = render(<App />);
    const startBtn = screen.getByRole('button', { name: /empezar/i });
    expect(startBtn).toBeInTheDocument();
    console.log('✅ Test 1 App Mount');
  });

  it('Test 2 – renderiza el elemento audio con loop y la ruta correcta', () => {
    const { container } = render(<App />);
    const audio = container.querySelector('audio');
    expect(audio).toBeInTheDocument();
    expect(audio).toHaveAttribute('loop');
    expect(audio).toHaveAttribute(
      'src',
      '/Bomberman (NES) Music - Stage Theme.mp3'
    );
    console.log('✅ Test 2 Audio App');
  });

  it('Test 3 – el contenedor .homepage-container tiene el background-image correcto', () => {
    const { container } = render(<App />);
    const homepage = container.querySelector('.homepage-container');
    expect(homepage).toBeInTheDocument();
    expect(homepage).toHaveStyle(
      'background-image: url("/src/images/f1.png")'
    );
    console.log('✅ Test 3 Background Image');
  });
});
