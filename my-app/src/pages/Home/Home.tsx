import { useState } from "react"; 
import { useNavigate } from "react-router-dom"; 
import fondo from "../../images/f1.png";
import "../../styles/home.css";
import RetroButton from "../../components/Buttons/RetroButton/RetroButton";
import RetroNameInput from "../../components/Info/nameInput"; 

const HomePage = () => {
  const [showNameInput, setShowNameInput] = useState(false); 
  const navigate = useNavigate(); 

  const handleStartClick = () => {
    setShowNameInput(true); 
  };

  const handleNameSubmit = () => {
    navigate('/host'); 
  };

  return (
    <div className="homepage-container" style={{ backgroundImage: `url(${fondo})` }}>
      <div className="button-container">
        {showNameInput ? ( 
          <RetroNameInput onSubmit={handleNameSubmit} /> 
        ) : ( 
          <RetroButton onClick={handleStartClick} />
        )}
      </div>
    </div>
  );
};

export default HomePage;
