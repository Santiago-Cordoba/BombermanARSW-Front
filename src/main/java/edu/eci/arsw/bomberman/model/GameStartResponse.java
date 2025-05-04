package edu.eci.arsw.bomberman.model;

import java.util.List;

public class GameStartResponse {
    private String code;
    private List<String> players;

    public GameStartResponse(String code, List<String> players) {
        this.code = code;
        this.players = players;
    }

    public String getCode() {
        return code;
    }

    public List<String> getPlayers() {
        return players;
    }
}
