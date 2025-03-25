// HostPage.tsx o HostPage.js
import { useState } from 'react';
import './hostPage.css'; // Asegúrate de que este archivo CSS esté bien enlazado
import GuestButton from "../../components/Buttons/GuestButton/GuestButton";
import HostButton from "../../components/Buttons/HostButton/HostButton";
import BackButton from "../../components/Buttons/BackButton/BackButton";

const HostPage = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <div className="host-page-container">
      <BackButton />
      <h1>Selecciona una opción:</h1>
      {selectedOption === null ? (
        <div className="button-container">
          <GuestButton onClick={() => setSelectedOption("Guest")} />
          <HostButton onClick={() => setSelectedOption("Host")} />
        </div>
      ) : (
        <p>Has seleccionado: {selectedOption}</p>
      )}
    </div>
  );
};

export default HostPage;
