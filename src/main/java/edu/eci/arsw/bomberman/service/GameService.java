package edu.eci.arsw.bomberman.service;

import edu.eci.arsw.bomberman.model.GameConfig;
import edu.eci.arsw.bomberman.model.GameSession;

public interface GameService {
    GameSession createGame(GameConfig config) throws IllegalArgumentException;
    GameSession joinGame(String code, String username) throws IllegalArgumentException;
    GameSession getGameInfo(String code) throws IllegalArgumentException;
}
