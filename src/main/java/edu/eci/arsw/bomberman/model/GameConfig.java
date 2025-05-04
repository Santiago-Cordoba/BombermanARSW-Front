package edu.eci.arsw.bomberman.model;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class GameConfig {
    @NotBlank(message = "Host username is required")
    private String host;

    @NotBlank(message = "Scenario is required")
    private String scenario;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    @Max(value = 60, message = "Duration cannot exceed 60 minutes")
    private Integer duration;

    @NotNull(message = "Player count is required")
    @Min(value = 1, message = "Player count must be at least 1")
    @Max(value = 4, message = "Player count cannot exceed 4")
    private Integer playerCount;

    @NotNull(message = "Block count is required")
    @Min(value = 1, message = "Block count must be at least 1")
    @Max(value = 30, message = "Block count cannot exceed 30")
    private Integer blockCount;

    @NotNull(message = "Lives count is required")
    @Min(value = 1, message = "Lives must be at least 1")
    @Max(value = 10, message = "Lives cannot exceed 10")
    private Integer livesPerPlayer;

    // Constructors
    public GameConfig() {}

    public GameConfig(String host, String scenario, Integer duration,
                      Integer playerCount, Integer blockCount, Integer livesPerPlayer) {
        this.host = host;
        this.scenario = scenario;
        this.duration = duration;
        this.playerCount = playerCount;
        this.blockCount = blockCount;
        this.livesPerPlayer = livesPerPlayer;
    }

    // Getters and Setters
    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public String getScenario() {
        return scenario;
    }

    public void setScenario(String scenario) {
        this.scenario = scenario;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public Integer getPlayerCount() {
        return playerCount;
    }

    public void setPlayerCount(Integer playerCount) {
        this.playerCount = playerCount;
    }

    public Integer getBlockCount() {
        return blockCount;
    }

    public void setBlockCount(Integer blockCount) {
        this.blockCount = blockCount;
    }

    public Integer getLivesPerPlayer() {
        return livesPerPlayer;
    }

    public void setLivesPerPlayer(Integer livesPerPlayer) {
        this.livesPerPlayer = livesPerPlayer;
    }

    @Override
    public String toString() {
        return "GameConfig{" +
                "host='" + host + '\'' +
                ", scenario='" + scenario + '\'' +
                ", duration=" + duration +
                ", playerCount=" + playerCount +
                ", blockCount=" + blockCount +
                ", livesPerPlayer=" + livesPerPlayer +
                '}';
    }
}
