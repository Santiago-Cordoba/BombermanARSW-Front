import React from "react";
import "./RetroButton.css";

// Define el tipo de las props
interface RetroButtonProps {
  onClick: () => void; // onClick es una función que no recibe parámetros y no devuelve nada
}

const RetroButton: React.FC<RetroButtonProps> = ({ onClick }) => {
  return (
    <div className="button-container">
      <button className="retro-button" onClick={onClick}>
        Empezar
      </button>
    </div>
  );
};

export default RetroButton;