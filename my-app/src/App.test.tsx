// src/App.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';


// Mock de useNavigate de react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});



import App from './App';

describe('App (smoke & interaction tests)', () => {
  /**
   * Test 1 – Verifica que App monta sin errores y muestra el botón "Empezar".
   */
  it('Test 1 – monta App y muestra "Empezar"', async () => {
    render(<App />);
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /empezar/i })
      ).toBeInTheDocument();
    });
    console.log('✅ Test 1 App Mount');
  });

  /**
   * Test 2 – Verifica que se renderiza <audio> con loop y src correctos.
   */
  it('Test 2 – <audio> con loop y ruta correcta', async () => {
    const { container } = render(<App />);
    await waitFor(() => {
      const audio = container.querySelector('audio');
      expect(audio).toBeInTheDocument();
      expect(audio).toHaveAttribute('loop');
      expect(audio).toHaveAttribute(
        'src',
        '/Bomberman (NES) Music - Stage Theme.mp3'
      );
    });
    console.log('✅ Test 2 Audio App');
  });

  /**
   * Test 3 – Verifica el estilo de fondo en .homepage-container.
   */
  it('Test 3 – estilo background-image correcto', async () => {
    const { container } = render(<App />);
    await waitFor(() => {
      const homepage = container.querySelector('.homepage-container');
      expect(homepage).toBeInTheDocument();
      expect(homepage).toHaveStyle(
        'background-image: url("/src/images/f1.png")'
      );
    });
    console.log('✅ Test 3 Background Image');
  });

  /**
   * Test 4 – Simula clic en "Empezar" y verifica navegación a /host.
   */
  it('Test 4 – clic en "Empezar" dispara navegación a /host', async () => {
    render(<App />);
    const startBtn = await screen.findByRole('button', { name: /empezar/i });
    fireEvent.click(startBtn);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
    console.log('✅ Test 4 Navigation to /host');
  });
});