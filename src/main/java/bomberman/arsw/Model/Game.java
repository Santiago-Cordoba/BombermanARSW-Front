package bomberman.arsw.Model;

import org.springframework.stereotype.Service;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Random;
import java.util.logging.Logger;

@Service
public class Game {
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private static final Logger logger = Logger.getLogger(Game.class.getName());
    private GameConfig config;
    private Map gameMap;
    private List<Player> players;
    private Random random = new Random();
    private List<Bomb> activeBombs = new ArrayList<>();

    public Game(GameConfig config) {
        this.config = config != null ? config : new GameConfig();
        this.gameMap = new Map(config.getMapaAlto(), config.getMapaAncho());
        this.players = new ArrayList<>();

        assignRandomPositions();
        placeRandomBlocks(config.getBloques());
    }

    public Map getMap() {
        return this.gameMap;
    }

    public void removeBomb(int x, int y) {
        Cell cell = gameMap.getCell(x, y);
        if (cell.hasBomb()) {
            cell.setBomb(false);
            System.out.println("Bomba eliminada en posición: (" + x + ", " + y + ")");
        }
    }

    public HashMap<Object, Object> placeBomb() {
        HashMap<Object, Object> response = new HashMap<>();
        Player player = players.get(0);

        if (!player.canPlaceBomb()) {
            response.put("success", false);
            response.put("message", "Espera a que explote tu bomba anterior");
            return response;
        }

        Bomb bomb = new Bomb(
                player.getXPosition(),
                player.getYPosition(),
                4,  // Radio de explosión
                player
        );

        activeBombs.add(bomb);
        Cell cell = gameMap.getCell(bomb.getX(), bomb.getY());
        cell.setBomb(true); // 🔥 Muy importante para que el mapa la muestre como 'B'

        player.setCanPlaceBomb(false);

        scheduler.schedule(() -> explodeBomb(bomb), 3, TimeUnit.SECONDS);

        response.put("success", true);
        response.put("bomb", bomb);
        return response;
    }

    // 🔓 Método ahora público
    public void explodeBomb(Bomb bomb) {
        int x = bomb.getX();
        int y = bomb.getY();
        int radius = bomb.getRadius();

        gameMap.getCell(x, y).setExplosion(true);

        int[][] directions = {
                {-1, 0}, {1, 0}, {0, -1}, {0, 1}
        };

        for (int[] dir : directions) {
            int dx = dir[0];
            int dy = dir[1];

            for (int i = 1; i <= radius; i++) {
                int newX = x + dx * i;
                int newY = y + dy * i;

                if (!gameMap.isValidPosition(newX, newY)) break;

                Cell cell = gameMap.getCell(newX, newY);
                if (!cell.hasWall()) {
                    gameMap.setCell(newX, newY, 'E');
                } else {
                    break;
                }
            }
        }

        scheduler.schedule(() -> clearExplosion(bomb), 1, TimeUnit.SECONDS);
        bomb.getOwner().setCanPlaceBomb(true);
        notifyAllPlayers();
    }

    private void clearExplosion(Bomb bomb) {
        gameMap.setCell(bomb.getX(), bomb.getY(), '.');
        gameMap.getCell(bomb.getX(), bomb.getY()).setExplosion(false);


        clearExplosionDirection(bomb, 1, 0);
        clearExplosionDirection(bomb, -1, 0);
        clearExplosionDirection(bomb, 0, 1);
        clearExplosionDirection(bomb, 0, -1);
    }

    private void clearExplosionDirection(Bomb bomb, int dx, int dy) {
        for (int i = 1; i <= bomb.getRadius(); i++) {
            int x = bomb.getX() + (dx * i);
            int y = bomb.getY() + (dy * i);

            if (!gameMap.isValidPosition(x, y)) break;

            if (gameMap.getCell(x, y).getCharRepresentation() == 'E') {
                gameMap.getCell(x, y).setExplosion(false);
            } else {
                break;
            }
        }
    }

    private void notifyAllPlayers() {
        // Implementar notificación a clientes vía WebSocket u otra estrategia
    }

    public void movePlayer(String direction) {
        if (players.isEmpty()) return;

        Player player = players.get(0);
        int newX = player.getXPosition();
        int newY = player.getYPosition();

        switch (direction) {
            case "UP": newX--; break;
            case "DOWN": newX++; break;
            case "LEFT": newY--; break;
            case "RIGHT": newY++; break;
        }

        if (newX >= 0 && newX < gameMap.getWidth() &&
                newY >= 0 && newY < gameMap.getHeight() &&
                gameMap.isCellEmpty(newX, newY)) {

            gameMap.getCell(player.getXPosition(), player.getYPosition()).setPlayer(false);
            player.setPosition(newX, newY);
            gameMap.getCell(newX, newY).setPlayer(true);
        }
    }

    public String getMapAsString() {
        StringBuilder mapString = new StringBuilder();
        for (int i = 0; i < gameMap.getHeight(); i++) {
            for (int j = 0; j < gameMap.getWidth(); j++) {
                Cell cell = gameMap.getCell(i, j);
                if (cell.hasExplosion()) {
                    mapString.append("E");
                } else if (cell.hasPlayer()) {
                    mapString.append("P");
                } else if (cell.hasBomb()) {
                    mapString.append("B");
                } else if (cell.hasWall()) {
                    mapString.append("#");
                } else {
                    mapString.append(".");
                }
            }
            mapString.append("\n");
        }
        return mapString.toString();
    }

    public GameConfig getConfig() {
        return config;
    }

    private void assignRandomPositions() {
        int numPlayers = config.getJugadores();
        for (int i = 0; i < numPlayers; i++) {
            int x, y;
            do {
                x = random.nextInt(gameMap.getWidth());
                y = random.nextInt(gameMap.getHeight());
            } while (!gameMap.isCellEmpty(x, y));

            Player newPlayer = new Player(i, x, y);
            players.add(newPlayer);
            gameMap.setCell(x, y, 'P');
        }
    }

    private void placeRandomBlocks(int numBlocks) {
        for (int i = 0; i < numBlocks; i++) {
            int x, y;
            do {
                x = random.nextInt(gameMap.getWidth());
                y = random.nextInt(gameMap.getHeight());
            } while (!gameMap.isCellEmpty(x, y));

            gameMap.setCell(x, y, '#');
        }
    }

    public void startGame() {
        System.out.println("Juego iniciado con la siguiente configuración:");
        System.out.println("Duración: " + config.getDuracion() + " min");
        System.out.println("Jugadores: " + config.getJugadores());
        System.out.println("Bloques: " + config.getBloques());
        System.out.println("Vidas: " + config.getVidas());

        this.gameMap = new Map(config.getMapaAlto(), config.getMapaAncho());
        this.players.clear();

        assignRandomPositions();
        placeRandomBlocks(config.getBloques());

        System.out.println("Mapa generado:\n" + getMapAsString());
    }

    // ✅ Nuevo getter público
    public List<Bomb> getBombs() {
        return this.activeBombs;
    }
}
