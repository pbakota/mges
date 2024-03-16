package rs.lab.mges.game;

import io.github.libsdl4j.api.render.SDL_Renderer;
import java.util.ArrayList;
import java.util.List;
import rs.lab.mges.engine.Control;
import rs.lab.mges.engine.Drawable.AnimatedSprite;
import rs.lab.mges.engine.SDLUtils;
import rs.lab.mges.engine.SDLUtils.Vector2f;
import rs.lab.mges.engine.SDLUtils.Vector2i;
import rs.lab.mges.engine.Sound;
import rs.lab.mges.engine.Drawable;

import static io.github.libsdl4j.api.sensor.SdlSensorConst.SDL_STANDARD_GRAVITY;

public class Hero extends AnimatedSprite {

    private final List<PlayerBullet> playerBullets = new ArrayList<>();

    private boolean onGround;
    private float bulletTimer;
    private float supersizeTimer;
    private boolean supersized;
    private final RabbitGame game;

    public Hero(RabbitGame game) {
        super(game.assets.playerFrames, 32, 32);
        this.game = game;

        position = new Vector2f(300f, 200f);
        hitbox = SDLUtils.rect(size.x / 4, size.y / 4, size.x / 2, size.y / 2);

        bulletTimer = 0;
        supersizeTimer = 0;
        supersized = false;
    }

    public void reset() {
        playerBullets.clear();
        position = new Vector2f(300f, 200f);
        velocity = new Vector2f();
        bulletTimer = 0;
        supersizeTimer = 0;
        supersized = false;
        onGround = false;
        oldPosition = null;
    }

    @Override
    public void update(float dt) {
        playerBullets.removeIf(x -> !x.active);

        if (velocity.x != 0.0f) {
            animTimer += dt;
            if (animTimer >= 0.225f) {
                animFrame = 1 - animFrame;
                animTimer = 0;
            }

            if (velocity.x > 0) {
                velocity.x -= 3.0f;
            } else if (velocity.x < 0) {
                velocity.x += 3.0f;
            }

            if (velocity.x > -1.0f && velocity.x < 1.0f) {
                velocity.x = 0.0f;
                animFrame = 0;
                animTimer = 0;
            }
        }

        // gravity
        if (!onGround) {
            velocity.y += SDL_STANDARD_GRAVITY;
        }

        position.x += velocity.x * dt;
        position.y += velocity.y * dt;

        if (velocity.x > 0) {
            flipped = false;
        }
        if (velocity.x < 0) {
            flipped = true;
        }

        if (!onGround) {
            animFrame = 1;
        } else if (velocity.x == 0) {
            animFrame = 0;
        }

        if (Control.Fire) {
            supersizeTimer += dt;
            if (supersizeTimer >= 3.0f) {
                supersized = true;
            }

            if (bulletTimer == 0.0f) {
                if (playerBullets.size() < 5) {
                    Sound.playSoundFromMemory(game.assets.fireFx, 64);
                    PlayerBullet newBullet = new PlayerBullet(game)
                            .setPosition(new Vector2f(flipped ? position.x - 16 : position.x + 30, supersized ? position.y + 4 : (position.y + 12)))
                            .setVelocity(new Vector2f(flipped ? -300.0f : 300.0f, 0.0f))
                            .setFlipped(flipped);

                    if (supersized) {
                        newBullet.supersize();
                        supersized = false;
                        supersizeTimer = 0;
                    }

                    playerBullets.add(newBullet);
                }
            }
            bulletTimer += dt;
            if (bulletTimer > 0.2f) {
                bulletTimer = 0;
            }
        } else {
            supersized = false;
            supersizeTimer = 0;
            bulletTimer = 0;
        }

        if (Control.Left && velocity.x > -100.0f) {
            velocity.x -= 15.0f;
        }
        if (Control.Right && velocity.x < 100.0f) {
            velocity.x += 15.0f;
        }

        if (position.y > 280) {
            position.y = 280.0f;
            onGround = true;
            velocity.y = 0.0f;
        }

        if (Control.Up) {
            if (onGround) {
                velocity.y = -200.0f;
                onGround = false;
            }
        }

        for (var b : playerBullets) {
            if (b.position.x < -16.0 || b.position.x > 640.0f) {
                b.active = false;
            } else {
                b.update(dt);
            }
        }
    }

    public boolean hit(Mob mob) {
        return Drawable.AABB(getHitbox(), mob.getHitbox());
    }

    public boolean bulletHit(Mob mob) {
        final var mobHitbox = mob.getHitbox();
        for (var b : playerBullets) {
            if (Drawable.AABB(mobHitbox, b.getHitbox())) {
                if (!b.supersized) {
                    b.active = false;
                }

                return true;
            }
        }

        return false;
    }

    @Override
    public void draw(SDL_Renderer renderer, float delta) {
        super.draw(renderer, delta);
        playerBullets.forEach(b -> b.draw(renderer, delta));
    }

    /**
     * Player bullet
     */
    public static class PlayerBullet extends Sprite {

        public boolean active;
        public boolean supersized;

        public PlayerBullet(RabbitGame game) {
            super(game.assets.playerBullet, 16, 16);
            active = true;
        }

        public void supersize() {
            supersized = true;
            size = new Vector2i(size.x * 2, size.y * 2);
            hitbox = SDLUtils.rect(0, size.y / 4, size.x, size.y / 2);
        }

        @Override
        public void update(float dt) {
            position.x += velocity.x * dt;
            position.y += velocity.y * dt;
        }
    }
}
