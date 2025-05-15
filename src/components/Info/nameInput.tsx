import React, { useState } from "react";
import "./nameInput.css"; // Asegúrate de que el archivo de estilos esté correctamente importado

interface RetroNameInputProps {
  onSubmit: () => void; // Tipo de onSubmit, que es una función que no recibe parámetros y no devuelve nada
}

const RetroNameInput: React.FC<RetroNameInputProps> = ({ onSubmit }) => {
  const [name, setName] = useState<string>(""); // Estado para el nombre
  const [submitted, setSubmitted] = useState<boolean>(false); // Estado para controlar si se ha enviado el nombre

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true); // Marca que el nombre ha sido enviado
    onSubmit(); // Llama a onSubmit para redirigir a la página de Host
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value); // Actualiza el estado con el valor del input
  };

  return (
    <div className="retro-form-container">
      {submitted ? (
        <div className="retro-message">
          <p>¡Hola, <span className="retro-name">{name}</span>!</p>
          <button
            className="retro-button"
            onClick={() => setSubmitted(false)} // Permite volver al formulario
          >
            Volver
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="retro-form">
          <label htmlFor="name" className="retro-label">
            Ingresa tu nombre:
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={handleNameChange}
            className="retro-input"
            placeholder="Nombre"
            required
          />
          <button type="submit" className="retro-button">
            Confirmar
          </button>
        </form>
      )}
    </div>
  );
};

export default RetroNameInput;
