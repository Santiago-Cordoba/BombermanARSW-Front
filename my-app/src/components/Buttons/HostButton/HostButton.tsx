import React from "react";
import "./HostButton.css";

// Define el tipo de las props
interface RetroButtonProps {
  onClick: () => void; // onClick es una función que no recibe parámetros y no devuelve nada
}

const RetroButton: React.FC<RetroButtonProps> = ({ onClick }) => {
  return (
    <div className="button-container-host">
      <button className="retro-button-host" onClick={onClick}>
        Host
      </button>
    </div>
  );
};

export default RetroButton;