const stompClient = new StompJs.Client({
    brokerURL: 'ws://localhost:8080/my-websocket'
});

stompClient.onConnect = function () {
    console.log("Conectado al WebSocket");

    // Suscribirse al tópico de configuración
    stompClient.subscribe("/topic/game-config", function (message) {
        const config = JSON.parse(message.body);
        alert(`Configuración Recibida: 
        Duración: ${config.duration} min
        Jugadores: ${config.players} 
        Bloques: ${config.blocks} 
        Vidas: ${config.lives}`);
    });
};

// Activa la conexión STOMP
stompClient.activate();

// Función para enviar la configuración
function sendConfig() {
    const duration = parseInt(document.getElementById("duration").value);
    const players = parseInt(document.getElementById("players").value);
    const blocks = parseInt(document.getElementById("blocks").value);
    const lives = parseInt(document.getElementById("lives").value);

    if (players < 1 || players > 4 || blocks < 1 || blocks > 30 || lives < 1 || lives > 10) {
        alert("Valores fuera de rango. Corrige los datos.");
        return;
    }

    const config = { duration, players, blocks, lives };
    stompClient.publish({ destination: "/app/game-config", body: JSON.stringify(config) });

    console.log("Configuración enviada:", config);
}
