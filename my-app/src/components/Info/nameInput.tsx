import React, { useState } from "react";
import "./nameInput.css"; // Asegúrate de que el archivo de estilos esté correctamente importado

const RetroNameInput = () => {
  const [name, setName] = useState<string>(""); // Especifica que el estado es de tipo string

  // Define el tipo del evento para handleSubmit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(`¡Hola, ${name}!`); // Muestra el nombre del usuario
  };

  // Define el tipo del evento para onChange
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value); // Actualiza el estado con el valor del input
  };

  return (
    <div className="retro-form-container">
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
          Enviar
        </button>
      </form>
    </div>
  );
};

export default RetroNameInput;