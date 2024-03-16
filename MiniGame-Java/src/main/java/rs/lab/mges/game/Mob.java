package rs.lab.mges.game;

import io.github.libsdl4j.api.render.SDL_Texture;
import java.util.Random;
import rs.lab.mges.engine.Drawable.AnimatedSprite;
import rs.lab.mges.engine.SDLUtils.Vector2f;

public abstract class Mob extends AnimatedSprite {

    private static final Random rand = new Random();

    public boolean active;
    public int hp;
    public float speed;
    public int point;

    public Mob(SDL_Texture[] frames, boolean flipped, int hp, float speed, int point) {
        super(frames, 32, 32);

        this.flipped = flipped;
        this.active = true;
        this.hp = hp;
        this.speed = speed;
        this.point = point;

        position.x = flipped ? 640f : -32f;
        velocity = new Vector2f(flipped ? -speed : speed, 0f);
    }

    @Override
    public void update(float dt) {
        if (flipped) {
            if (velocity.x > 0) {
                velocity.x -= 1.0f;
                if (velocity.x < 1.0f) {
                    velocity.x = -speed;
                }
            }
        } else {
            if (velocity.x < 0) {
                velocity.x += 1.0f;
                if (velocity.x >= 0.0f) {
                    velocity.x = speed;
                }
            }
        }

        position.x += velocity.x * dt;

        animTimer += dt;
        if (animTimer > 0.25) {
            animTimer = 0.0f;
            animFrame = 1 - animFrame;
        }

        if (position.x < -32.0f || position.x > 640.0f) {
            active = false;
        }
    }

    public boolean gotHit(Hero player) {
        if (hp-- <= 0) {
            return true;
        }

        velocity.x = player.flipped ? -speed * 1.2f : speed * 1.2f;

        return false;
    }

    public static class MobBee extends Mob {

        private static final int HP = 2;
        private static final float SPEED = 40;
        private static final int POINT = 20;

        public MobBee(RabbitGame game, boolean flipped) {
            super(game.assets.beeFrames, flipped, HP, SPEED, POINT);
            position.y = 280.0f - 32 + rand.nextFloat() * 32.0f;
        }
    }

    public static class MobBlue extends Mob {

        private static final int HP = 3;
        private static final float SPEED = 60;
        private static final int POINT = 50;

        public MobBlue(RabbitGame game, boolean flipped) {
            super(game.assets.blueFrames, flipped, HP, SPEED, POINT);
            position.y = 280.0f - 32 + rand.nextFloat() * 32.0f;
        }
    }

    public static class MobFoxy extends Mob {

        private static final int HP = 2;
        private static final float SPEED = 50;
        private static final int POINT = 100;

        public MobFoxy(RabbitGame game, boolean flipped) {
            super(game.assets.foxyFrames, flipped, HP, SPEED, POINT);
            position.y = 280.0f;
            hitbox.x = size.x / 4 - 8;
            hitbox.y = size.y / 4;
            hitbox.h -= hitbox.y;
        }
    }

    public static class MobSniky extends Mob {

        private static final int HP = 5;
        private static final float SPEED = 10;
        private static final int POINT = 200;

        public MobSniky(RabbitGame game, boolean flipped) {
            super(game.assets.snikyFrames, flipped, HP, SPEED, POINT);
            position.y = 280.0f;
            hitbox.y = hitbox.h / 2;
            hitbox.h = hitbox.h - hitbox.y;
        }
    }
}
