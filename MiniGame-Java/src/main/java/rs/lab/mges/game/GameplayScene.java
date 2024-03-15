package rs.lab.mges.game;

import io.github.libsdl4j.api.blendmode.SDL_BlendMode;
import io.github.libsdl4j.api.rect.SDL_Point;
import io.github.libsdl4j.api.render.SDL_Renderer;
import io.github.libsdl4j.api.render.SDL_RendererFlip;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import rs.lab.mges.engine.Drawable.Sprite;
import rs.lab.mges.engine.SDLUtils;
import rs.lab.mges.engine.SDLUtils.Vector2f;
import rs.lab.mges.game.Powerup.Bomb;
import rs.lab.mges.game.Powerup.Medkit;
import rs.lab.mges.game.GameOver.GetReady;
import rs.lab.mges.engine.Control;
import rs.lab.mges.engine.Sound;
import rs.lab.mges.engine.Text;
import rs.lab.mges.game.Mob.MobBee;
import rs.lab.mges.game.Mob.MobBlue;
import rs.lab.mges.game.Mob.MobFoxy;
import rs.lab.mges.game.Mob.MobSniky;
import rs.lab.mges.game.RabbitGame.GameScene;

import static io.github.libsdl4j.api.render.SdlRender.SDL_RenderCopy;
import static io.github.libsdl4j.api.render.SdlRender.SDL_RenderCopyEx;
import static io.github.libsdl4j.api.render.SdlRender.SDL_RenderFillRect;
import static io.github.libsdl4j.api.render.SdlRender.SDL_SetRenderDrawBlendMode;
import static io.github.libsdl4j.api.render.SdlRender.SDL_SetRenderDrawColor;

public class GameplayScene extends Scene {

    private static final Random rand = new Random();

    private final Healthbar healthbar;
    private final Hero player;
    private final List<Mob> mobs = new ArrayList<>();
    private final List<Explosion> explosions = new ArrayList<>();
    private final List<Dirt> dirts = new ArrayList<>();
    private float nextMob;
    private float nextMobTimer;
    private int score = 0;
    private int hiscore = 10000;
    private final GetReady ready;
    private boolean isGameOver;
    private final GameOver gameOver;
    private final Bomb bomb;
    private float bombTimer = 0.0f;
    private final Medkit medkit;
    private float medkitTimer = 0.0f;
    private int killed;
    private int missed;
    private int medkitCollected;
    private int bombsCollected;
    private float bombExplodeTimer;
    private boolean bombExploded;
    private int bombExplodeAlpha = 255;

    public GameplayScene(RabbitGame game) {
        super(game);

        player = new Hero(game);
        healthbar = new Healthbar(game);
        ready = new GetReady(game);
        medkit = new Medkit(game);
        bomb = new Bomb(game);
        gameOver = new GameOver(game);
    }

    @Override
    void enter() {
//       if (File.Exists(_game.HiscoreFilePath))
//            if (int.TryParse(File.ReadAllText(_game.HiscoreFilePath), out var hs))
//                _hiscore = hs;

        Control.reset();

        score = 0;
        isGameOver = false;
        dirts.clear();
        explosions.clear();
        mobs.clear();
        healthbar.reset();
        nextMob = 0.0f;
        nextMobTimer = 0.0f;
        player.reset();
        ready.reset();
        bombExploded = false;
        medkitTimer = 0f;
        bombTimer = 0f;

        killed = 0;
        missed = 0;
        medkitCollected = 0;
        bombsCollected = 0;
        gameOver.reset();
    }

    @Override
    void leave() {
//        if (_isGameOver)
//            File.WriteAllText(_game.HiscoreFilePath, $"{_hiscore}");
    }

    @Override
    void update(float dt) {
        removeInactiveEntities();

        if (Control.Exit) {
            game.changeScene(GameScene.TITLE);
            return;
        }

        if (isGameOver) {
            gameOver.update(dt);
            score = gameOver.score;
            if (score > hiscore) {
                hiscore = score;
            }
        } else {
            player.update(dt);
        }

        if (!ready.isReady) {
            ready.update(dt);
        }

        if (!medkit.active && !isGameOver) {
            medkitSpawn(dt);
        } else {
            updateMedkit(dt);
        }

        if (!bomb.active && !isGameOver) {
            bombSpawn(dt);
        }

        updateBomb(dt);

        if (ready.isReady && !isGameOver) {
            mobSpawn(dt);
        }

        updateMobs(dt);
        updateActiveEntities(dt);
    }

    private void medkitSpawn(double dt) {
        medkitTimer += dt;
        if (medkitTimer > 20.0f) {
            medkitTimer -= 20.0f;
            medkit.reset(rand.nextFloat() * (game.w - 32));
        }
    }

    private void updateMedkit(float dt) {
        medkit.update(dt);
        if (!isGameOver) {
            if (medkit.hit(player)) {
                Sound.playSoundFromMemory(game.assets.pickupFx, 255);
                score += medkit.point;
                healthbar.incHealth(20);
                ++medkitCollected;
            }
        }
    }

    private void bombSpawn(double dt) {
        bombTimer += dt;
        if (bombTimer > 30.0f) {
            bombTimer -= 30.0f;
            bomb.reset(rand.nextFloat() * (game.w - 32));
        }
    }

    private void updateBomb(float dt) {
        if (bombExploded) {
            bombExplodeTimer += dt;
            if (bombExplodeTimer > 0.2f) {
                bombExploded = false;
            }
        }

        if (bomb.active) {
            bomb.update(dt);
            if (!isGameOver) {
                if (bomb.hit(player)) {
                    Sound.playSoundFromMemory(game.assets.explosionLongFx, 255);
                    score += bomb.point;
                    bombsCollected++;

                    for (var m : mobs.stream().filter(m -> m.active).toList()) {
                        mobKilled(m);
                    }
                    bombExplodeTimer = 0.0f;
                    bombExploded = true;
                    bombExplodeAlpha = 10;
                }
            }
        }
    }

    private void mobSpawn(float dt) {
        nextMobTimer += dt;
        if (nextMobTimer > nextMob) {
            nextMobTimer = 0.0f;
            nextMob = rand.nextFloat() * 0.8f;

            var flipped = rand.nextInt(0, 2) == 0;
            var mobid = rand.nextFloat() * 100;

            Mob newMob;
            if (mobid < 10) {
                newMob = new MobSniky(game, flipped);
            } else if (mobid < 40 && mobid >= 10) {
                newMob = new MobBlue(game, flipped);
            } else if (mobid < 70 && mobid >= 40) {
                newMob = new MobBee(game, flipped);
            } else {
                newMob = new MobFoxy(game, flipped);
            }

            mobs.add(newMob);
        }
    }

    private void updateMobs(float dt) {
        for (var mob : mobs) {
            mob.update(dt);
            if (!isGameOver) {
                if (!mob.active) {
                    ++missed;
                }
                if (player.bulletHit(mob)) {
                    if (mob.gotHit(player)) {
                        mobKilled(mob);
                    } else {
                        // Just hit
                        Sound.playSoundFromMemory(game.assets.mobHitFx);
                    }
                }

                if (player.hit(mob)) {
                    healthbar.decHealth(1);
                    if (healthbar.health == 0) {
                        gameOver();
                    }
                }
            }
        }
    }

    private void mobKilled(Mob mob) {
        ++killed;
        Sound.playSoundFromMemory(game.assets.explosionFx, 255);

        Explosion newExplosion = new Explosion(game).setPosition(new Vector2f(mob.position.x, mob.position.y));
        explosions.add(newExplosion);

        mob.active = false;
        Dirt newDirt = new Dirt(game).setPosition(new Vector2f(mob.position.x, 280.0f + 32.0f));
        dirts.add(newDirt);

        score += mob.point;

        if (score > hiscore) {
            hiscore = score;
        }
    }

    private void gameOver() {
        isGameOver = true;
        gameOver.set(killed, missed, medkitCollected, bombsCollected, score);
        //_gameOver.Set(998, 127, 9, 4, 0);
    }

    private void updateActiveEntities(float dt) {
        explosions.stream().filter(x -> x.active).toList().forEach(e -> e.update(dt));
        dirts.stream().filter(x -> x.active).forEach(d -> d.update(dt));
    }

    private void removeInactiveEntities() {
        mobs.removeIf(x -> !x.active);
        dirts.removeIf(x -> !x.active);
        explosions.removeIf(x -> !x.active);
    }

    @Override
    void draw(SDL_Renderer renderer, float delta) {
        drawBackground(renderer, delta);

        // Get ready
        if (!ready.isReady) {
            ready.draw(renderer, delta);
        }

        if (medkit.active) {
            medkit.draw(renderer, delta);
        }

        if (bomb.active) {
            bomb.draw(renderer, delta);
        }

        if (isGameOver) {
            gameOver.draw(renderer, delta);
        } else {
            player.draw(renderer, delta);
        }

        drawEntities(renderer, delta);
    }

    private void drawBackground(SDL_Renderer renderer, float delta) {
        // static background
        var r = SDLUtils.rect(0, 16, game.w, 312);
        SDLUtils.CheckSDLErr(() -> SDL_RenderCopy(renderer, game.assets.forest, null, r));

        // platform
        var dst = SDLUtils.rect(0, 280 + 32, 32, 32);
        for (var i = 0; i < game.w / 32; ++i) {
            dst.x = i * 32;
            SDLUtils.CheckSDLErr(() -> SDL_RenderCopy(renderer, game.assets.ground, null, dst));
        }

        // Health bar
        healthbar.draw(renderer, delta);

        // Score
        Text.drawText(renderer, 0, 0, Colors.WhiteColor, Colors.DkGrayColor, String.format("Score: %08d", score));
        Text.drawText(renderer, 356, 0, Colors.WhiteColor, Colors.DkGrayColor, String.format("HI-Score: %08d", hiscore));

        // Dirt
        dirts.stream().filter(x -> x.active).forEach(d -> d.draw(renderer, delta));

        if (bombExploded) {
            SDLUtils.CheckSDLErr(() -> SDL_SetRenderDrawColor(renderer, Colors.WhiteColor.r, Colors.WhiteColor.g, Colors.WhiteColor.b, (byte) bombExplodeAlpha));
            SDLUtils.CheckSDLErr(() -> SDL_SetRenderDrawBlendMode(renderer, SDL_BlendMode.SDL_BLENDMODE_BLEND));
            SDLUtils.CheckSDLErr(() -> SDL_RenderFillRect(renderer, r));
            SDLUtils.CheckSDLErr(() -> SDL_SetRenderDrawBlendMode(renderer, SDL_BlendMode.SDL_BLENDMODE_NONE));
        }
    }

    private void drawEntities(SDL_Renderer renderer, float delta) {
        mobs.stream().filter(x -> x.active).forEach(d -> d.draw(renderer, delta));
        explosions.stream().filter(x -> x.active).forEach(d -> d.draw(renderer, delta));
    }

    private static class Explosion extends Sprite {

        public boolean active;
        private int animFrame = 0;
        private float animTimer = 0;

        public Explosion(RabbitGame game) {
            super(game.assets.explosion, 16, 16);
            animFrame = 0;
            animTimer = 0.0f;
            active = true;
        }

        @Override
        public void update(float dt) {
            if (!active) {
                return;
            }

            animTimer += dt;
            if (animTimer > 0.05f) {
                animTimer -= 0.05f;
                if (++animFrame == 12) {
                    active = false;
                }
            }
        }

        @Override
        public void draw(SDL_Renderer renderer, double delta) {
            var src = SDLUtils.rect(animFrame * 16, 0, 16, 16);
            var dst = SDLUtils.rect(position.x, position.y, size.x, size.y);

            SDLUtils.CheckSDLErr(() -> SDL_RenderCopyEx(renderer, frame, src, dst, 0.0f, (SDL_Point) null, SDL_RendererFlip.SDL_FLIP_NONE));
        }
    }

    private static class Dirt extends Sprite {

        private float alphaTimer = 0.0f;
        public boolean active;

        public Dirt(RabbitGame game) {
            super(game.assets.bloodGround, 32, 32);
            alpha = (byte) 255;
            active = true;
        }

        public void Update(double dt) {
            alphaTimer += dt;
            if (alphaTimer > 0.2f) {
                alphaTimer = 0.0f;
                alpha--;
                if (alpha < 10) {
                    alpha = 0;
                    active = false;
                }
            }
        }
    }

    private static class Healthbar extends Sprite {

        private static final int MAXHEIGHT = 96;
        private static final int MAXENERGY = 100;
        public int health;

        public Healthbar(RabbitGame game) {
            super(game.assets.healthbar, 8, MAXHEIGHT);

            position = new Vector2f(10f, 30f);
            health = MAXENERGY;
        }

        public void reset() {
            health = MAXENERGY;
        }

        public void decHealth(int amount) {
            if (health == 0) {
                return;
            }
            health -= amount;
        }

        public void incHealth(int amount) {
            health += amount;
            if (health > MAXENERGY) {
                health = MAXENERGY;
            }
        }

        public void draw(SDL_Renderer renderer, float delta) {
            var p = health / (float) MAXENERGY * (double) MAXHEIGHT;
            var src = SDLUtils.rect(0, 0, 8, (int) p);
            var dst = SDLUtils.rect(position.x, position.y, 8, (int) p);

            SDLUtils.CheckSDLErr(() -> SDL_RenderCopyEx(renderer, frame, src, dst, 0.0f, (SDL_Point) null, SDL_RendererFlip.SDL_FLIP_NONE));
        }
    }
}
