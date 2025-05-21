/**
 * @vitest-environment happy-dom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import RoomEntryPage from './RoomEntryPage';
import { useNavigate } from 'react-router-dom';

// Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

describe('RoomEntryPage component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renderiza labels, inputs y botón', () => {
    render(<RoomEntryPage />);
    expect(screen.getByLabelText(/Código de Sala/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tu Nombre/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ENTRAR A SALA/i })).toBeInTheDocument();
    console.log('✅ Renderizado inicial correcto');
  });

  it('muestra error si se envía sin completar campos', () => {
    render(<RoomEntryPage />);
    fireEvent.click(screen.getByRole('button', { name: /ENTRAR A SALA/i }));
    expect(screen.getByText(/Por favor ingresa un nombre de sala y tu nombre/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
    console.log('✅ Muestra error en submit inválido');
  });

  it('al enviar con datos válidos, guarda en localStorage y navega', () => {
    render(<RoomEntryPage />);
    fireEvent.change(screen.getByLabelText(/Código de Sala/i), { target: { value: 'ABC123' } });
    fireEvent.change(screen.getByLabelText(/Tu Nombre/i), { target: { value: 'Ana' } });
    fireEvent.click(screen.getByRole('button', { name: /ENTRAR A SALA/i }));

    expect(localStorage.getItem('playerName')).toBe('Ana');
    expect(mockNavigate).toHaveBeenCalledWith('/room/ABC123');
    console.log('✅ Envío valido guarda y navega correctamente');
  });
});
