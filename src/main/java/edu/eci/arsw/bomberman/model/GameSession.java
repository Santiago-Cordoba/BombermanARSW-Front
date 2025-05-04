package edu.eci.arsw.bomberman.model;

import java.util.ArrayList;
import java.util.List;

public class GameSession {
    private String code;
    private GameConfig config;
    private List<String> players;
    private boolean inProgress;

    public GameSession(String code, GameConfig config) {
        this.code = code;
        this.config = config;
        this.players = new ArrayList<>();
        this.players.add(config.getHost());
        this.inProgress = false;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public void setConfig(GameConfig config) {
        this.config = config;
    }

    public void setPlayers(List<String> players) {
        this.players = players;
    }

    // Getters y setters
    public String getCode() { return code; }
    public GameConfig getConfig() { return config; }
    public List<String> getPlayers() { return players; }
    public boolean isInProgress() { return inProgress; }
    public void setInProgress(boolean inProgress) { this.inProgress = inProgress; }
}