package bomberman.arsw.controller;

import bomberman.arsw.Model.Bomb;
import bomberman.arsw.Model.Game;
import bomberman.arsw.Model.GameConfig;
import bomberman.arsw.service.GameService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

@RestController
@RequestMapping("/game")
public class GameController {

    private static final Logger logger = Logger.getLogger(GameController.class.getName());
    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @PostMapping("/preExplode")
    public ResponseEntity<String> triggerPreExplosion(@RequestBody BombPosition position) {
        Game game = gameService.getCurrentGame();
        if (game == null) {
            return ResponseEntity.status(404).body("No hay una partida activa.");
        }

        game.getBombs().stream()
                .filter(b -> b.getX() == position.x() && b.getY() == position.y())
                .findFirst()
                .ifPresent(Bomb::triggerPreExplosion);

        return ResponseEntity.ok(game.getMapAsString());
    }

    @PostMapping("/explode")
    public ResponseEntity<String> explodeBomb(@RequestBody Bomb bomb) {
        Game game = gameService.getCurrentGame();
        if (game == null) {
            return ResponseEntity.status(404).body("No hay partida activa");
        }

        game.explodeBomb(bomb); // Asegúrate de que este método sea público en Game.java
        return ResponseEntity.ok(game.getMapAsString());
    }

    @PostMapping("/removeBomb")
    public ResponseEntity<String> removeBomb(@RequestParam int x, @RequestParam int y) {
        Game game = gameService.getCurrentGame();
        if (game == null) {
            return ResponseEntity.status(404).body("No hay una partida en curso.");
        }

        game.removeBomb(x, y);
        return ResponseEntity.ok(game.getMapAsString());
    }

    @PostMapping("/placeBomb")
    public ResponseEntity<Map<String, Object>> placeBomb() {
        Game game = gameService.getCurrentGame();
        if (game == null) {
            return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "No hay una partida en curso"
            ));
        }

        Map<Object, Object> rawResponse = game.placeBomb();
        Map<String, Object> response = new HashMap<>();
        for (Map.Entry<Object, Object> entry : rawResponse.entrySet()) {
            if (entry.getKey() instanceof String) {
                response.put((String) entry.getKey(), entry.getValue());
            }
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/move")
    public ResponseEntity<String> movePlayer(@RequestParam String direction) {
        Game game = gameService.getCurrentGame();
        if (game == null) {
            return ResponseEntity.status(404).body("No hay una partida en curso.");
        }

        game.movePlayer(direction);
        return ResponseEntity.ok(game.getMapAsString());
    }

    @PostMapping("/start")
    public ResponseEntity<String> startGame(@RequestBody GameConfig config) {
        try {
            gameService.startGame(config);
            return ResponseEntity.ok("Juego iniciado con configuración: " + config);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/status")
    public ResponseEntity<String> getGameStatus() {
        Game currentGame = gameService.getCurrentGame();
        if (currentGame == null) {
            return ResponseEntity.status(404).body("No hay una partida en curso.");
        }

        int playersConnected = gameService.getConnectedPlayers().size();
        int requiredPlayers = currentGame.getConfig().getPlayerCount();

        if (gameService.allPlayersReady()) {
            return ResponseEntity.ok("Todos los jugadores están listos. La partida puede iniciar.");
        } else {
            return ResponseEntity.ok("Esperando jugadores... " + playersConnected + "/" + requiredPlayers);
        }
    }

    @GetMapping("/map")
    public ResponseEntity<String> getGameMap() {
        Game currentGame = gameService.getCurrentGame();
        if (currentGame == null || currentGame.getMapAsString() == null) {
            return ResponseEntity.status(404).body("No hay una partida en curso o el mapa no está disponible.");
        }
        return ResponseEntity.ok(currentGame.getMapAsString());
    }

    // Record para manejar la posición de una bomba
    public record BombPosition(int x, int y) {}
}
