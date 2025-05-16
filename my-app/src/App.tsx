import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import HostPage from './pages/Host/hostPage'; 
import HomePage from "./pages/Home/Home";
import HostConfig from './pages/HostConfig/HostConfig';
import GamePage from './pages/GamePage/GamePage';
import WaitingRoomPage from './pages/room/WaitingRoomPage';
import CreateRoomForm from './pages/CreateRoom/createRoomForm';
import RoomEntryPage from './pages/Entry/RoomEntryPage';
import { WebSocketProvider } from './components/Socket/WebSocketProvider';
import './App.css'; // Asegúrate de tener este archivo para los estilos

function App() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Efecto para manejar la reproducción inicial
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Configuración inicial
    audio.volume = 0.3; // Volumen moderado
    audio.loop = true;

    // Intenta reproducir automáticamente (puede fallar)
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsMusicPlaying(true))
        .catch(() => {
          console.log('Reproducción automática bloqueada. Esperando interacción...');
        });
    }

    // Limpieza al desmontar
    return () => {
      audio.pause();
    };
  }, []);

  // Función para toggle música
  const toggleMusic = () => {
    if (!audioRef.current) return;
    
    if (isMusicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play()
        .then(() => setIsMusicPlaying(true))
        .catch(console.error);
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  return (
    <WebSocketProvider>
      {/* Reproductor de audio oculto */}
      <audio 
        ref={audioRef}
        src="/Bomberman (NES) Music - Stage Theme.mp3"
      />
      
      {/* Botón de control de música flotante */}
      <button 
        onClick={toggleMusic}
        className="music-control"
        aria-label={isMusicPlaying ? "Silenciar música" : "Activar música"}
      >
        {isMusicPlaying ? '🔊' : '🔇'}
      </button>

      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/host" element={<HostPage />} />
          <Route path="/hostconfig" element={<HostConfig />} />
          <Route path="/game/:roomCode" element={<GamePage />} />
          <Route path="/room/:roomCode" element={<WaitingRoomPage />} />
          <Route path="/create-room" element={<CreateRoomForm />} />
          <Route path="/entry" element={<RoomEntryPage />} />
        </Routes>
      </Router>
    </WebSocketProvider>
  );
}

export default App;