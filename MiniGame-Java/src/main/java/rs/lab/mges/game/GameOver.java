package rs.lab.mges.game;

import io.github.libsdl4j.api.render.SDL_Renderer;
import rs.lab.mges.engine.SDLUtils;
import rs.lab.mges.engine.Text;
import rs.lab.mges.engine.Text.DrawTextOptions;

import rs.lab.mges.engine.Control;
import rs.lab.mges.engine.Sound;
import rs.lab.mges.game.RabbitGame.GameScene;

import static io.github.libsdl4j.api.render.SdlRender.SDL_RenderCopy;
import static io.github.libsdl4j.api.render.SdlRender.SDL_SetTextureAlphaMod;

public class GameOver {

    private static final int ADD_KILLS = 0;
    private static final int ADD_MISSES = 1;
    private static final int ADD_MEDIKITS = 2;
    private static final int ADD_BOMS = 3;
    private static final int PRESS_FIRE = 4;

    private static final int KILLS_BONUS = 2;
    private static final int MISSED_BONUS = 0;
    private static final int BOMBS_BONUS = 50;
    private static final int MEDKIT_BONUS = 100;

    private float gameOverTimer = 0;
    private float pressFiretimer = 0;
    private float countTimer = 0;
    private int killed = 0;
    private int missed = 0;
    private int medkitCollected = 0;
    private int bombsCollected = 0;
    private int currentScoreCount;

    private final RabbitGame game;

    public int score = 0;

    public GameOver(RabbitGame _game) {
        this.game = _game;
    }

    public void reset() {
        gameOverTimer = 0.0f;
        killed = 0;
        missed = 0;
        medkitCollected = 0;
        bombsCollected = 0;
        score = 0;
        currentScoreCount = ADD_KILLS;
        pressFiretimer = Float.MAX_VALUE;
    }

    public void set(int killed, int missed, int medkitCollected, int bombsCollected, int score) {
        this.killed = killed;
        this.missed = missed;
        this.medkitCollected = medkitCollected;
        this.bombsCollected = bombsCollected;
        this.score = score;
    }

    public void update(float dt) {
        gameOverTimer += dt;
        if (gameOverTimer > 3.0f) {
            countTimer += dt;
            if (countTimer > 0.02f) {
                countTimer -= 0.02f;
                switch (currentScoreCount) {
                    case ADD_KILLS -> {
                        if (killed > 10) {
                            Sound.playSoundFromMemory(game.assets.tickFx, 64);
                            score += KILLS_BONUS * 10;
                            killed -= 10;
                        } else if (killed > 0) {
                            Sound.playSoundFromMemory(game.assets.tickFx, 64);
                            score += KILLS_BONUS;
                            killed--;
                        }
                        if (killed == 0) {
                            currentScoreCount = ADD_MISSES;
                        }
                    }
                    case ADD_MISSES -> {
                        if (missed > 10) {
                            Sound.playSoundFromMemory(game.assets.tickFx, 64);
                            score += MISSED_BONUS * 10;
                            missed -= 10;
                        } else if (missed > 0) {
                            Sound.playSoundFromMemory(game.assets.tickFx, 64);
                            score += MISSED_BONUS;
                            missed--;
                        }
                        if (missed == 0) {
                            currentScoreCount = ADD_BOMS;
                        }
                    }
                    case ADD_BOMS -> {
                        if (bombsCollected > 10) {
                            Sound.playSoundFromMemory(game.assets.tickFx, 64);
                            score += BOMBS_BONUS * 10;
                            bombsCollected -= 10;
                        } else if (bombsCollected > 0) {
                            Sound.playSoundFromMemory(game.assets.tickFx, 64);
                            score += BOMBS_BONUS;
                            bombsCollected--;
                        }
                        if (bombsCollected == 0) {
                            currentScoreCount = ADD_MEDIKITS;
                        }
                    }
                    case ADD_MEDIKITS -> {
                        if (medkitCollected > 10) {
                            Sound.playSoundFromMemory(game.assets.tickFx, 64);
                            score += MEDKIT_BONUS * 10;
                            medkitCollected -= 10;
                        }
                        if (medkitCollected > 0) {
                            Sound.playSoundFromMemory(game.assets.tickFx, 64);
                            score += MEDKIT_BONUS;
                            medkitCollected--;
                        }
                        if (medkitCollected == 0) {
                            currentScoreCount = PRESS_FIRE;
                            pressFiretimer = gameOverTimer + 1;
                        }
                    }
                }
            }

            if (currentScoreCount == PRESS_FIRE) {
                if (gameOverTimer > pressFiretimer) {
                    if (Control.Fire) {
                        game.changeScene(GameScene.TITLE);
                    }
                }
            }
        }
    }

    public void draw(SDL_Renderer renderer, float delta) {
        var srcrect = SDLUtils.rect(0, 0, 160, 16);
        var dstrect = SDLUtils.rect(160, 50, 160 * 2, 16 * 2);

        SDLUtils.CheckSDLErr(() -> SDL_SetTextureAlphaMod(game.assets.elements, (byte) 255));
        SDLUtils.CheckSDLErr(() -> SDL_RenderCopy(renderer, game.assets.elements, srcrect, dstrect));

        Text.drawText(renderer, 170, 100, Colors.WhiteColor, Colors.DkGrayColor, String.format("Killed: %-4d", killed));
        Text.drawText(renderer, 400, 104, Colors.WhiteColor, Colors.DkGrayColor, String.format("x %d", KILLS_BONUS), DrawTextOptions.builder().setSize(0.5f));

        Text.drawText(renderer, 170, 120, Colors.WhiteColor, Colors.DkGrayColor, String.format("Missed: %-4d", missed));
        Text.drawText(renderer, 400, 124, Colors.WhiteColor, Colors.DkGrayColor, String.format("x %d", MISSED_BONUS), DrawTextOptions.builder().setSize(0.5f));

        Text.drawText(renderer, 170, 140, Colors.WhiteColor, Colors.DkGrayColor, String.format("Bombs : %-4d", bombsCollected));
        Text.drawText(renderer, 400, 144, Colors.WhiteColor, Colors.DkGrayColor, String.format("x %d", MEDKIT_BONUS), DrawTextOptions.builder().setSize(0.5f));

        Text.drawText(renderer, 170, 160, Colors.WhiteColor, Colors.DkGrayColor, String.format("Medkit: %-4d", medkitCollected));
        Text.drawText(renderer, 400, 164, Colors.WhiteColor, Colors.DkGrayColor, String.format("x %d", BOMBS_BONUS), DrawTextOptions.builder().setSize(0.5f));

        Text.drawText(renderer, 140, 200, Colors.WhiteColor, Colors.BlackColor, String.format("FINAL SCORE: %08d", score));

        if (gameOverTimer > pressFiretimer) {
            Text.drawText(renderer, 200, 250, Colors.WhiteColor, Colors.BlackColor, "Press \"FIRE\"!");
        }
    }

    public static class GetReady {

        public boolean isReady = false;

        private float getreadyTimer = 0f;
        private int alpha = 255;
        private final RabbitGame game;

        public GetReady(RabbitGame game) {
            this.game = game;
        }

        public void reset() {
            isReady = false;
            alpha = 255;
            getreadyTimer = 0f;
        }

        public void update(float dt) {
            if (isReady) {
                return;
            }

            getreadyTimer += dt;
            if (getreadyTimer > 2.0f) {
                alpha -= 10;
                if (alpha < 0) {
                    alpha = 0;
                }

            }

            if (getreadyTimer > 5.0f) {
                isReady = true;
            }
        }

        public void draw(SDL_Renderer renderer, float delta) {
            if (isReady) {
                return;
            }

            var srcrect = SDLUtils.rect(0, 16, 160, 16);
            var dstrect = SDLUtils.rect(160, 150, 160 * 2, 16 * 2);
            SDLUtils.CheckSDLErr(() -> SDL_SetTextureAlphaMod(game.assets.elements, (byte) alpha));
            SDLUtils.CheckSDLErr(() -> SDL_RenderCopy(renderer, game.assets.elements, srcrect, dstrect));
        }
    }
}
