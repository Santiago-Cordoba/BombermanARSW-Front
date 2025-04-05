import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HostPage from './pages/Host/hostPage'; 
import HomePage from "./pages/Home/Home";
import HostConfig from './pages/HostConfig/HostConfig';
import GamePage from './pages/GamePage/GamePage';
import WaitingRoomPage from './pages/room/WaitingRoomPage';
import CreateRoomForm from './pages/CreateRoom/createRoomForm';
import RoomEntryPage from './pages/Entry/RoomEntryPage';
import { WebSocketProvider } from './components/Socket/WebSocketProvider';

function App() {
  return (
    <WebSocketProvider>
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