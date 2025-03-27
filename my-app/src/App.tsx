import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HostPage from './pages/Host/hostPage'; // Ruta para la página del host
import HomePage from "./pages/Home/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/host" element={<HostPage />} />
      </Routes>
    </Router>
  );
}

export default App;
