/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// MOCK de useNavigate antes de importar el componente
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  // traemos todo lo real y sobreescribimos useNavigate
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

import GuestButton from './GuestButton';

describe('GuestButton component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('Test 6 – llama a onClick y navega a /entry al hacer clic', () => {
    const onClickMock = vi.fn();
    render(<GuestButton onClick={onClickMock} />);
    const btn = screen.getByRole('button', { name: /unirse/i });
    fireEvent.click(btn);

    expect(onClickMock).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/entry');
    console.log('Test 6 GuestButton onClick + navigation');
  });

  it('Test 7 – navega a /entry si no se pasa onClick', () => {
    render(<GuestButton />);
    const btn = screen.getByRole('button', { name: /unirse/i });
    fireEvent.click(btn);

    expect(mockNavigate).toHaveBeenCalledWith('/entry');
    console.log('Test 7 GuestButton navigation only');
  });
});
