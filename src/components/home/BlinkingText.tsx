import { useState, useEffect } from "react";

export default function BlinkingText({ text = "Da click para empezar a jugar" }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((prev) => !prev);
    }, 500); // Parpadeo cada 500ms

    return () => clearInterval(interval);
  }, []);

  return (
    <h2 className={`text-2xl font-bold text-white ${visible ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}>
      {text}
    </h2>
  );
}
