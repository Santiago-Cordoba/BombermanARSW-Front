package bomberman.arsw.Model;

public class Cell {
    private int x;
    private int y;
    private boolean hasWall;
    private boolean isDestructible;
    private boolean hasPlayer;
    private boolean hasBomb;
    private boolean hasExplosion;

    // Constructor
    public Cell(int x, int y) {
        this.x = x;
        this.y = y;
        this.hasWall = false;
        this.isDestructible = false;
        this.hasPlayer = false;
        this.hasBomb = false;
        this.hasExplosion = false;
    }

    // Método para reiniciar la celda (vacía)
    public void reset() {
        this.hasWall = false;
        this.isDestructible = false;
        this.hasPlayer = false;
        this.hasBomb = false;
        this.hasExplosion = false;
    }

    // Getters
    public int getX() { return x; }
    public int getY() { return y; }
    public boolean hasWall() { return hasWall; }
    public boolean isDestructible() { return isDestructible; }
    public boolean hasPlayer() { return hasPlayer; }
    public boolean hasBomb() { return hasBomb; }
    public boolean hasExplosion() { return hasExplosion; }

    // Setters
    public void setWall(boolean hasWall, boolean isDestructible) {
        this.hasWall = hasWall;
        this.isDestructible = isDestructible;
    }

    public void setBlock(boolean isWall) {
        this.hasWall = isWall;
        this.isDestructible = false; // Por defecto no destructible
    }

    public void setPlayer(boolean hasPlayer) {
        this.hasPlayer = hasPlayer;
    }

    public void setBomb(boolean hasBomb) {
        this.hasBomb = hasBomb;
    }

    public void setExplosion(boolean hasExplosion) {
        this.hasExplosion = hasExplosion;
    }

    // La celda está vacía si no tiene jugador, bomba, explosión ni pared
    public boolean isEmpty() {
        return !hasWall && !hasPlayer && !hasBomb && !hasExplosion;
    }

    // Representación de carácter para el mapa
    public char getCharRepresentation() {
        if (hasExplosion) return 'E';
        if (hasBomb) return 'B';
        if (hasPlayer) return 'P';
        if (hasWall) return isDestructible ? 'D' : '#';
        return '.';
    }
}
