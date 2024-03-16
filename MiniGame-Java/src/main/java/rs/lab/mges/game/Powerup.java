package rs.lab.mges.game;

import io.github.libsdl4j.api.render.SDL_Texture;
import rs.lab.mges.engine.Drawable;
import rs.lab.mges.engine.Drawable.Sprite;
import rs.lab.mges.engine.SDLUtils;
import rs.lab.mges.engine.SDLUtils.Vector2f;

import static io.github.libsdl4j.api.sensor.SdlSensorConst.SDL_STANDARD_GRAVITY;

public abstract class Powerup extends Sprite {

    public boolean active;
    public int point;

    private float waitTimer = 0f;

    public Powerup(SDL_Texture frame, int point) {
        super(frame, 32, 32);
        this.point = point;
        hitbox = SDLUtils.rect(0, 10, size.x, size.y - 10);
    }

    public boolean hit(Hero player) {
        if (Drawable.AABB(getHitbox(), player.getHitbox())) {
            active = false;
            return true;
        }

        return false;
    }

    @Override
    public void update(float dt) {
        if (position.y < 280) {
            velocity.y += SDL_STANDARD_GRAVITY;
            position.y += dt * velocity.y;
        } else {
            position.y = 280f;
            waitTimer += dt;
            if (waitTimer > 3.0) {
                if (alpha < 10) {
                    alpha = 0;
                    active = false;
                } else {
                    alpha -= 5;
                }
            }
        }
    }

    public void reset(float x) {
        position = new Vector2f(x, 100.0f);
        velocity = new Vector2f(0.0f, 50.0f);
        waitTimer = 0.0f;
        alpha = 255;
        active = true;
        oldPosition = null;
    }

    public static class Bomb extends Powerup {

        public Bomb(RabbitGame game) {
            super(game.assets.bomb, 500);
        }
    }

    public static class Medkit extends Powerup {

        public Medkit(RabbitGame game) {
            super(game.assets.medKit, 500);
        }
    }
}
