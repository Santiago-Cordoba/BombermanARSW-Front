// src/pages/CreateRoom/CreateRoomForm.test.tsx
/**
 * @vitest-environment happy-dom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateRoomForm from './CreateRoomForm';
import { useNavigate } from 'react-router-dom';

// Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

describe('CreateRoomForm component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renderiza inputs y botón', () => {
    render(<CreateRoomForm />);
    // Buscamos por placeholder en lugar de label
    expect(screen.getByPlaceholderText('Ej: SalaDePablo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: Pablo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crear Sala/i })).toBeInTheDocument();
    console.log('✅ Renderizado inicial correcto');
  });

  it('actualiza los valores de los inputs al teclear', () => {
    render(<CreateRoomForm />);
    const roomInput = screen.getByPlaceholderText('Ej: SalaDePablo') as HTMLInputElement;
    const playerInput = screen.getByPlaceholderText('Ej: Pablo') as HTMLInputElement;

    fireEvent.change(roomInput, { target: { value: 'MiSala' } });
    fireEvent.change(playerInput, { target: { value: 'Carlos' } });

    expect(roomInput.value).toBe('MiSala');
    expect(playerInput.value).toBe('Carlos');
    console.log('✅ Inputs actualizan correctamente');
  });

  it('al enviar con datos válidos, guarda en localStorage y navega a la ruta correcta', () => {
    render(<CreateRoomForm />);
    const roomInput = screen.getByPlaceholderText('Ej: SalaDePablo') as HTMLInputElement;
    const playerInput = screen.getByPlaceholderText('Ej: Pablo') as HTMLInputElement;
    const button = screen.getByRole('button', { name: /Crear Sala/i });

    fireEvent.change(roomInput, { target: { value: 'Sala Pablo' } });
    fireEvent.change(playerInput, { target: { value: 'Pablo' } });
    fireEvent.click(button);

    expect(localStorage.getItem('playerName')).toBe('Pablo');
    expect(mockNavigate).toHaveBeenCalledWith('/room/Sala%20Pablo');
    console.log('✅ Envío exitoso, localStorage y navigate correctos');
  });

  it('no navega si alguno de los campos está vacío', () => {
    render(<CreateRoomForm />);
    const roomInput = screen.getByPlaceholderText('Ej: SalaDePablo') as HTMLInputElement;
    const playerInput = screen.getByPlaceholderText('Ej: Pablo') as HTMLInputElement;
    const button = screen.getByRole('button', { name: /Crear Sala/i });

    // Ambos vacíos
    fireEvent.click(button);
    expect(mockNavigate).not.toHaveBeenCalled();

    // Solo sala
    fireEvent.change(roomInput, { target: { value: 'X' } });
    fireEvent.click(button);
    expect(mockNavigate).not.toHaveBeenCalled();

    // Solo nombre
    fireEvent.change(roomInput, { target: { value: '' } });
    fireEvent.change(playerInput, { target: { value: 'Y' } });
    fireEvent.click(button);
    expect(mockNavigate).not.toHaveBeenCalled();
    console.log('✅ No navega con campos inválidos');
  });
});
