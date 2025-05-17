import { useNavigate } from "react-router-dom";
import fondo from "../../images/f1.png";
import "../../styles/home.css";
import RetroButton from "../../components/Buttons/RetroButton/RetroButton";

const HomePage = () => {
  const navigate = useNavigate();

  const handleStartClick = () => {
    navigate('/login'); // Redirige directamente a /host
  };

  return (
    <div 
      className="homepage-container" 
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <div className="button-container">
        <RetroButton onClick={handleStartClick} />
      </div>
    </div>
  );
};

export default HomePage;