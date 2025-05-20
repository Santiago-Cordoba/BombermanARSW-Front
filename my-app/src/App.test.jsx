// src/App.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('App (smoke test)', () => {
  it('monta el componente sin fallar y muestra el botón Empezar', async () => {
    render(<App />);

    // Esperamos a que aparezca el botón "Empezar", envolviéndolo en waitFor (internamente usa act)
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /empezar/i })
      ).toBeInTheDocument();
    });
  });
});
