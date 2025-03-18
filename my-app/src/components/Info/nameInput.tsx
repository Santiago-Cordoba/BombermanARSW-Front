import React, { useState } from "react";
import "./nameInput.css"; // Asegúrate de que el archivo de estilos esté correctamente importado

const RetroNameInput = () => {
  const [name, setName] = useState<string>(""); // Estado para el nombre
  const [submitted, setSubmitted] = useState<boolean>(false); // Estado para controlar si se ha enviado el nombre

  // Define el tipo del evento para handleSubmit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true); // Marca que el nombre ha sido enviado
  };

  // Define el tipo del evento para onChange
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value); // Actualiza el estado con el valor del input
  };

  return (
    <div className="retro-form-container">
      {submitted ? ( // Si el nombre ha sido enviado, muestra un mensaje
        <div className="retro-message">
          <p>¡Hola, <span className="retro-name">{name}</span>!</p>
          <button
            className="retro-button"
            onClick={() => setSubmitted(false)} // Permite volver al formulario
          >
            Volver
          </button>
        </div>
      ) : ( // Si no, muestra el formulario
        <form onSubmit={handleSubmit} className="retro-form">
          <label htmlFor="name" className="retro-label">
            Ingresa tu nombre:
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={handleNameChange} // Usa la función handleNameChange
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