package bomberman.arsw.Model;

import java.util.logging.Logger;

public class Map {
    private Cell[][] cells;
    private int width;
    private int height;

    public Map(int width, int height) {
        this.width = width;
        this.height = height;
        this.cells = new Cell[height][width];

        // Inicializar todas las celdas con sus coordenadas
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                cells[y][x] = new Cell(x, y);
            }
        }
    }

    public void setCell(int x, int y, char type) {
        Cell cell = cells[y][x];
        switch (type) {
            case '#': // Pared indestructible
                cell.setWall(true, false);
                break;
            case 'D': // Pared destructible
                cell.setWall(true, true);
                break;
            case 'P': // Jugador
                cell.setPlayer(true);
                break;
            case 'B': // Bomba
                cell.setBomb(true);
                break;
            case 'E': // Explosión
                cell.setExplosion(true);
                break;
            case '.': // Vacío
                cell.setWall(false, false);
                cell.setPlayer(false);
                cell.setBomb(false);
                cell.setExplosion(false);
                break;
        }
    }

    public Cell getCell(int x, int y) {
        return cells[y][x];
    }

    public boolean isValidPosition(int x, int y) {
        return x >= 0 && x < width && y >= 0 && y < height;
    }

    public char getChar(int x, int y) {
        Cell cell = cells[y][x];
        if (cell.hasPlayer()) return 'P';
        if (cell.hasBomb()) return 'B';
        if (cell.hasWall()) return cell.isDestructible() ? 'D' : '#';
        return '.';
    }

    public boolean isCellEmpty(int x, int y) {
        return cells[y][x].isEmpty();  // Se asume que isEmpty() está en Cell.java
    }

    public void setBlock(int x, int y) {
        cells[y][x].setBlock(true);
        logger.info("Bloque colocado en (" + x + ", " + y + ")");
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }

    public void printMap() {
        logger.info("Imprimiendo el mapa...");
        for (int i = 0; i < height; i++) {
            StringBuilder row = new StringBuilder();
            for (int j = 0; j < width; j++) {
                if (cells[i][j].hasPlayer()) {
                    row.append("P ");
                } else if (cells[i][j].hasWall()) {
                    row.append("# ");
                } else {
                    row.append(". ");
                }
            }
            logger.info(row.toString());
        }
    }

    public boolean isDestructibleWall(int x, int y) {
        return isValidPosition(x, y) && cells[y][x].hasWall() && cells[y][x].isDestructible();
    }

    private static final Logger logger = Logger.getLogger(Map.class.getName());

}
