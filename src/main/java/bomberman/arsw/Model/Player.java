package bomberman.arsw.Model;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
public class Player {
    private int id;
    private int xPosition;
    private int yPosition;
    private int lifes;
    private String name;
    private List<Bomb> nBombs;
    private List<Bomb> activeBombs = new ArrayList<>(); // Lista de bombas activas
    private boolean canPlaceBomb = true; // Bandera para controlar bombas

    // Constructor corregido
    public Player(int id, int x, int y) {
        this.id = id;
        this.xPosition = x;
        this.yPosition = y;
        this.lifes = 3;
        this.name = "Player" + id;
    }

    public void setPosition(int x, int y) {
        this.xPosition = x;
        this.yPosition = y;
    }

    public boolean canPlaceBomb() {
        return canPlaceBomb && activeBombs.isEmpty();
    }

    public void addBomb(Bomb bomb) {
        activeBombs.add(bomb);
        canPlaceBomb = false;
    }

    public void removeBomb(Bomb bomb) {
        activeBombs.remove(bomb);
        if (activeBombs.isEmpty()) {
            canPlaceBomb = true;
        }
    }
}
