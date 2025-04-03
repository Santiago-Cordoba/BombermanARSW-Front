import React from "react";
import { useNavigate } from "react-router-dom";
import "./GuestButton.css";

// Define el tipo de las props
interface RetroButtonProps {
  onClick?: () => void; // Hacemos onClick opcional
}

const RetroButton: React.FC<RetroButtonProps> = ({ onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Ejecuta la función onClick si fue proporcionada
    if (onClick) {
      onClick();
    }
    // Redirige a /entry
    navigate("/entry");
  };

  return (
    <div className="button-container-guest">
      <button className="retro-button-guest" onClick={handleClick}>
        Unirse 
      </button>
    </div>
  );
};

export default RetroButton;