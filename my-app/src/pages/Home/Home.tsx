import { useState } from "react"; // Importa useState
import fondo from "../../images/f1.png";
import "../../styles/home.css";
import RetroButton from "../../components/Buttons/RetroButton/RetroButton";
import RetroNameInput from "../../components/Info/nameInput" // Importa el componente RetroNameInput

const HomePage = () => {
  const [showNameInput, setShowNameInput] = useState(false); // Estado para controlar la visibilidad del formulario

  const handleStartClick = () => {
    setShowNameInput(true); // Mostrar el formulario al hacer clic en "Empezar"
  };

  return (
    <div className="homepage-container" style={{ backgroundImage: `url(${fondo})` }}>
      {/* Contenedor para el botón o el formulario */}
      <div className="button-container">
        {showNameInput ? ( // Si showNameInput es true, mostrar el formulario
          <RetroNameInput />
        ) : ( // Si es false, mostrar el botón "Empezar"
          <RetroButton onClick={handleStartClick} />
        )}
      </div>
    </div>
  );
};

export default HomePage;