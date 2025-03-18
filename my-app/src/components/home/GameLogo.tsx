import fondo from "../../images/fondo2.jpg";
import BlinkingText from "./BlinkingText"; // Importamos el texto parpadeante

export default function GameLogo() {
  return (
    <div className="relative w-full h-screen">
      {/* Imagen de fondo */}
      <img 
        src={fondo} 
        alt="Bomberman Logo" 
        className="w-full h-full object-cover"
      />

      {/* Texto parpadeante centrado sobre la imagen */}
      <div className="absolute inset-0 flex items-center justify-center">
        <BlinkingText />
      </div>
    </div>
  );
}
