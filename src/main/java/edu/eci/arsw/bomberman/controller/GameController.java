package edu.eci.arsw.bomberman.controller;

import edu.eci.arsw.bomberman.model.GameConfig;
import edu.eci.arsw.bomberman.model.GameSession;
import edu.eci.arsw.bomberman.service.GameService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/game")
@CrossOrigin(origins = "*")
public class GameController {
    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    /**
     * Creates a new game with the provided configuration
     * @param config Game configuration
     * @param bindingResult Validation results
     * @return ResponseEntity with game session or error message
     */
    @PostMapping("/create")
    public ResponseEntity<?> createGame(@Valid @RequestBody GameConfig config, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = bindingResult.getFieldErrors()
                    .stream()
                    .collect(Collectors.toMap(
                            FieldError::getField,
                            fieldError -> fieldError.getDefaultMessage() != null ?
                                    fieldError.getDefaultMessage() : "Invalid value"
                    ));
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            GameSession game = gameService.createGame(config);
            return ResponseEntity.ok(game);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to create game: " + e.getMessage()));
        }
    }

    /**
     * Allows a player to join an existing game
     * @param code Game code
     * @param request Contains username
     * @return ResponseEntity with game session or error message
     */
    @PostMapping("/join")
    public ResponseEntity<?> joinGame(
            @RequestParam String code,
            @RequestBody Map<String, String> request) {

        Map<String, String> errors = new HashMap<>();

        if (code == null || code.length() != 5) {
            errors.put("code", "Invalid game code (must be 5 digits)");
        }

        String username = request.get("username");
        if (username == null || username.isEmpty()) {
            errors.put("username", "Username is required");
        }

        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            GameSession game = gameService.joinGame(code, username);
            return ResponseEntity.ok(game);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to join game: " + e.getMessage()));
        }
    }

    /**
     * Retrieves information about an existing game
     * @param code Game code
     * @return ResponseEntity with game info or error message
     */
    @GetMapping("/info")
    public ResponseEntity<?> getGameInfo(@RequestParam String code) {
        if (code == null || code.length() != 5) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid game code (must be 5 digits)"));
        }

        try {
            GameSession game = gameService.getGameInfo(code);
            return ResponseEntity.ok(game);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to get game info"));
        }
    }
}
