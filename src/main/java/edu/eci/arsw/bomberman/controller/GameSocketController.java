package edu.eci.arsw.bomberman.controller;

import edu.eci.arsw.bomberman.model.GameSession;
import edu.eci.arsw.bomberman.model.GameStartMessage;
import edu.eci.arsw.bomberman.model.GameStartResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class GameSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Simula un almacenamiento de partidas y jugadores (puedes conectarlo a tu lógica real)
    private Map<String, List<String>> gamePlayersMap = new ConcurrentHashMap<>();

    // Esto es llamado cuando el host envía "startGame" desde el cliente
    @MessageMapping("/start")
    public void startGame(GameStartMessage message) {
        List<String> players = gamePlayersMap.getOrDefault(message.getGameCode(), List.of());

        // Envía a todos los suscritos a /topic/game/{code}
        messagingTemplate.convertAndSend("/topic/game/" + message.getGameCode(), new GameStartResponse(message.getGameCode(), players));
    }

    // Puedes agregar métodos para agregar jugadores a la partida si lo necesitas
}
