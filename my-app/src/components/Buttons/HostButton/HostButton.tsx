import React from "react";
import { useNavigate } from "react-router-dom";
import "./HostButton.css";

interface RetroButtonProps {
  onClick?: () => void;
}

const RetroButton: React.FC<RetroButtonProps> = ({ onClick }) => {
  const navigate = useNavigate();

  const handleHostClick = () => {
    if (onClick) onClick();
    navigate("/hostconfig"); 
  };

  return (
    <div className="button-container-host">
      <button className="retro-button-host" onClick={handleHostClick}>
        Host
      </button>
    </div>
  );
};

export default RetroButton;