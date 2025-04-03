import React from "react";
import "./GuestButton.css";

// Define el tipo de las props
interface RetroButtonProps {
  onClick: () => void; // onClick es una función que no recibe parámetros y no devuelve nada
}

const RetroButton: React.FC<RetroButtonProps> = ({ onClick }) => {
  return (
    <div className="button-container-guest">
      <button className="retro-button-guest" onClick={onClick}>
        Unirse 
      </button>
    </div>
  );
};

export default RetroButton;