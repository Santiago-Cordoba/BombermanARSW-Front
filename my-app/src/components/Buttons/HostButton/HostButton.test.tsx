/**
 * @vitest-environment happy-dom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

import HostButton from './HostButton';

describe('HostButton component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('Test 8 – llama a onClick y navega a /create-room al hacer clic', () => {
    const onClickMock = vi.fn();
    render(<HostButton onClick={onClickMock} />);
    const btn = screen.getByRole('button', { name: /crear partida/i });
    fireEvent.click(btn);

    expect(onClickMock).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/create-room');
    console.log('✅ Test 8 HostButton onClick + navigation');
  });

  it('Test 9 – navega a /create-room si no se pasa onClick', () => {
    render(<HostButton />);
    const btn = screen.getByRole('button', { name: /crear partida/i });
    fireEvent.click(btn);

    expect(mockNavigate).toHaveBeenCalledWith('/create-room');
    console.log('✅ Test 9 HostButton navigation only');
  });
});
