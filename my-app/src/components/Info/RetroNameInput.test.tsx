// src/components/RetroNameInput/RetroNameInput.test.tsx
/**
 * @vitest-environment happy-dom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';

// Mock CSS import
vi.mock('./nameInput.css', () => ({}));

import RetroNameInput from './nameInput';

describe('RetroNameInput component', () => {
  it('Test 41 – renderiza formulario con input y button', () => {
    const onSubmit = vi.fn();
    render(<RetroNameInput onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText('Nombre');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('');

    const btn = screen.getByRole('button', { name: /Confirmar/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('type', 'submit');

    console.log('✅ Test 41 RetroNameInput initial form render');
  });

  it('Test 42 – al escribir en input se actualiza el valor', () => {
    render(<RetroNameInput onSubmit={() => {}} />);
    const input = screen.getByPlaceholderText('Nombre') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'Alice' } });
    expect(input.value).toBe('Alice');

    console.log('✅ Test 42 RetroNameInput input change');
  });

  it('Test 43 – al enviar form llama onSubmit y muestra saludo', () => {
    const onSubmit = vi.fn();
    render(<RetroNameInput onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText('Nombre');
    const formBtn = screen.getByRole('button', { name: /Confirmar/i });

    fireEvent.change(input, { target: { value: 'Bob' } });
    fireEvent.click(formBtn);

    expect(onSubmit).toHaveBeenCalledTimes(1);

    // Ahora debería mostrar el mensaje de saludo
    const greeting = screen.getByText(/¡Hola, /);
    expect(greeting).toHaveTextContent('¡Hola, Bob!');
    
    // El botón 'Confirmar' ya no debe existir
    expect(screen.queryByRole('button', { name: /Confirmar/i })).toBeNull();

    console.log('✅ Test 43 RetroNameInput form submit and greeting');
  });

  it('Test 44 – al pulsar Volver retorna al formulario', () => {
    render(<RetroNameInput onSubmit={() => {}} />);

    const input = screen.getByPlaceholderText('Nombre');
    const formBtn = screen.getByRole('button', { name: /Confirmar/i });

    fireEvent.change(input, { target: { value: 'Charlie' } });
    fireEvent.click(formBtn);

    // Ahora aparece botón Volver
    const volverBtn = screen.getByRole('button', { name: /Volver/i });
    expect(volverBtn).toBeInTheDocument();

    fireEvent.click(volverBtn);

    // Debería volver el formulario original
    expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirmar/i })).toBeInTheDocument();

    console.log('✅ Test 44 RetroNameInput volver to form');
  });
});
