import React from "react";
import { useLocation } from "react-router-dom";
import Board from "../../components/Board/Board";
import './GamePage.css';

const GamePage: React.FC = () => {
  const location = useLocation();
  const gameConfig = location.state || {};

  console.log("Configuración recibida:", gameConfig);

  return (
    <div className="game-page">
      <Board config={gameConfig} />
    </div>
  );
};

export default GamePage;