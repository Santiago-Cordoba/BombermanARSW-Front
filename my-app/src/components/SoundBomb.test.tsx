/**
 * @vitest-environment happy-dom
 */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { SoundPlayer } from './SoundBomb';

describe('SoundPlayer component', () => {
  let OriginalAudio: any;
  let playMock: ReturnType<typeof vi.fn>;
  let mockAudioInstances: any[];

  beforeAll(() => {
    // Guarda Audio real
    OriginalAudio = window.Audio;
    mockAudioInstances = [];
    playMock = vi.fn().mockResolvedValue(undefined);

    // Mock de Audio
    class MockAudio {
      src: string;
      volume: number;
      currentTime: number;
      constructor(src: string) {
        this.src = src;
        this.volume = 1.0;
        this.currentTime = 0;
        mockAudioInstances.push(this);
      }
      play() {
        return playMock();
      }
      pause() {}
    }
    // @ts-ignore
    window.Audio = MockAudio;
  });

  afterAll(() => {
    // Restaura Audio real
    // @ts-ignore
    window.Audio = OriginalAudio;
  });

  it('Test 15 – renderiza children sin reproducir audio inicialmente', () => {
    const { getByText } = render(
      <SoundPlayer soundFile="sound.mp3" volume={0.7} playCondition={false}>
        <span>Test Child</span>
      </SoundPlayer>
    );

    // El child se renderiza
    expect(getByText('Test Child')).toBeInTheDocument();
    // No se ha llamado a play
    expect(playMock).not.toHaveBeenCalled();

    // Se creó una instancia de audio con los props correctos
    expect(mockAudioInstances).toHaveLength(1);
    expect(mockAudioInstances[0].src).toBe('sound.mp3');
    expect(mockAudioInstances[0].volume).toBe(0.7);

    console.log('✅ Test 15 SoundPlayer initial render');
  });

  it('Test 16 – al cambiar playCondition a true, llama a play()', () => {
    const { rerender } = render(
      <SoundPlayer soundFile="sound.mp3" volume={0.7} playCondition={false}>
        <span>Test Child</span>
      </SoundPlayer>
    );

    // Cambiamos la prop playCondition a true
    rerender(
      <SoundPlayer soundFile="sound.mp3" volume={0.7} playCondition={true}>
        <span>Test Child</span>
      </SoundPlayer>
    );

    // Ahora sí debe haberse llamado a play()
    expect(playMock).toHaveBeenCalledTimes(1);
    console.log('✅ Test 16 SoundPlayer play called on playCondition');
  });
});
