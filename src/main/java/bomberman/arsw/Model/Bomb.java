package bomberman.arsw.Model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Bomb {
    private int x;
    private int y;
    private int radius;
    private Player owner;
    private boolean exploded;
    private boolean preExplosion; // Nuevo estado

    public Bomb(int x, int y, int radius, Player owner) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.owner = owner;
        this.exploded = false;

    }

    public void triggerPreExplosion() {
        this.preExplosion = true;
    }

}
