import { useEffect, useRef, ReactNode } from 'react';

interface SoundPlayerProps {
  soundFile: string;
  volume?: number;
  children?: ReactNode;
  playCondition: boolean;
}

export const SoundPlayer = ({
  soundFile,
  volume = 0.7,
  children,
  playCondition
}: SoundPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(soundFile);
    audioRef.current.volume = volume;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [soundFile, volume]);

  useEffect(() => {
    if (playCondition && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Error al reproducir sonido:", e));
    }
  }, [playCondition]);

  return <>{children}</>;
};