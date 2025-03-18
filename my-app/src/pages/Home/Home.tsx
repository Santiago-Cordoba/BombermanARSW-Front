import { useState } from "react"; // Importa useState
import { useNavigate } from "react-router-dom"; // Usa useNavigate en lugar de useHistory
import fondo from "../../images/f1.png";
import "../../styles/home.css";
import RetroButton from "../../components/Buttons/RetroButton/RetroButton";
import RetroNameInput from "../../components/Info/nameInput"; // Importa el componente RetroNameInput

const HomePage = () => {
  const [showNameInput, setShowNameInput] = useState(false); // Estado para controlar la visibilidad del formulario
  const navigate = useNavigate(); // Usar useNavigate para redirigir a otra página

  const handleStartClick = () => {
    setShowNameInput(true); // Mostrar el formulario al hacer clic en "Empezar"
  };

  const handleNameSubmit = () => {
    navigate('/host'); // Redirigir a HostPage
  };

  return (
    <div className="homepage-container" style={{ backgroundImage: `url(${fondo})` }}>
      {/* Contenedor para el botón o el formulario */}
      <div className="button-container">
        {showNameInput ? ( 
          <RetroNameInput onSubmit={handleNameSubmit} /> // Pasa el handleNameSubmit como prop
        ) : ( 
          <RetroButton onClick={handleStartClick} />
        )}
      </div>
    </div>
  );
};

export default HomePage;
