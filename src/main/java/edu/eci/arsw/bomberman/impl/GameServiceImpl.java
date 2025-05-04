package edu.eci.arsw.bomberman.impl;

import edu.eci.arsw.bomberman.model.GameConfig;
import edu.eci.arsw.bomberman.model.GameSession;
import edu.eci.arsw.bomberman.service.GameService;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GameServiceImpl implements GameService {
    private final Map<String, GameSession> activeGames = new ConcurrentHashMap<>();

    @Override
    public GameSession createGame(GameConfig config) {
        if (activeGames.values().stream().anyMatch(g -> g.getConfig().getHost().equals(config.getHost()))) {
            throw new IllegalArgumentException("Host already has an active game");
        }

        String gameCode = generateGameCode();
        GameSession newSession = new GameSession(gameCode, config);
        activeGames.put(gameCode, newSession);
        return newSession;
    }

    @Override
    public GameSession joinGame(String code, String username) {
        GameSession game = activeGames.get(code);
        if (game == null) {
            throw new IllegalArgumentException("Game not found");
        }
        if (game.getPlayers().size() >= game.getConfig().getPlayerCount()) {
            throw new IllegalArgumentException("Game is full");
        }
        if (game.getPlayers().contains(username)) {
            throw new IllegalArgumentException("Username already in game");
        }

        game.getPlayers().add(username);
        return game;
    }

    @Override
    public GameSession getGameInfo(String code) {
        GameSession game = activeGames.get(code);
        if (game == null) {
            throw new IllegalArgumentException("Game not found");
        }
        return game;
    }

    private String generateGameCode() {
        String code;
        do {
            code = String.format("%05d", (int)(Math.random() * 100000));
        } while (activeGames.containsKey(code));
        return code;
    }
}
