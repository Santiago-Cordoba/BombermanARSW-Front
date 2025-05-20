// src/components/BlinkingText/BlinkingText.test.tsx
/**
 * @vitest-environment happy-dom
 */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import BlinkingText from './BlinkingText';

describe('BlinkingText component', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  it('Test 37 – renderiza texto por defecto y con opacidad inicial', () => {
    render(<BlinkingText />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Da click para empezar a jugar');
    expect(heading).toHaveClass('opacity-100');
    console.log('✅ Test 37 BlinkingText default render and initial visibility');
  });

  it('Test 38 – alterna la opacidad cada 500ms', () => {
    render(<BlinkingText text="Hola" />);
    const heading = screen.getByText('Hola');

    // initial visible
    expect(heading).toHaveClass('opacity-100');

    act(() => {
      vi.advanceTimersByTime(500);
    });
    // after 500ms toggles to invisible
    expect(heading).toHaveClass('opacity-0');

    act(() => {
      vi.advanceTimersByTime(500);
    });
    // after another 500ms back to visible
    expect(heading).toHaveClass('opacity-100');

    console.log('✅ Test 38 BlinkingText toggles opacity correctly');
  });
});
