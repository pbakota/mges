package rs.lab.mges.game;

import io.github.libsdl4j.api.render.SDL_Renderer;
import rs.lab.mges.engine.Control;
import rs.lab.mges.engine.SDLUtils;
import rs.lab.mges.engine.Text;
import rs.lab.mges.game.Mob.MobBee;
import rs.lab.mges.game.Mob.MobBlue;
import rs.lab.mges.game.Mob.MobFoxy;
import rs.lab.mges.game.Mob.MobSniky;
import rs.lab.mges.game.Powerup.Bomb;
import rs.lab.mges.game.Powerup.Medkit;
import rs.lab.mges.engine.SDLUtils.Vector2f;
import rs.lab.mges.engine.Drawable.AnimatedSprite;
import rs.lab.mges.game.RabbitGame.GameScene;

import static io.github.libsdl4j.api.render.SdlRender.SDL_RenderCopy;
import static io.github.libsdl4j.api.render.SdlRender.SDL_RenderFillRect;
import static io.github.libsdl4j.api.render.SdlRender.SDL_SetRenderDrawColor;

public class TitleScene extends Scene {

    private final MobBee bee;
    private final MobBlue blue;
    private final MobSniky sniky;
    private final MobFoxy foxy;
    private final Medkit medkit;
    private final Bomb bomb;
    private final HeroB heroB;

    public TitleScene(RabbitGame game) {
        super(game);

        bee = new MobBee(game, false).setPosition(new Vector2f(80.0f, 140.0f)).setVelocity(new Vector2f(0f, 0f));
        blue = new MobBlue(game, false).setPosition(new Vector2f(80.0f, 180.0f)).setVelocity(new Vector2f(0f, 0f));
        sniky = new MobSniky(game, false).setPosition(new Vector2f(80.0f, 220.0f)).setVelocity(new Vector2f(0f, 0f));
        foxy = new MobFoxy(game, false).setPosition(new Vector2f(80.0f, 260.0f)).setVelocity(new Vector2f(0f, 0f));
        bomb = new Bomb(game).setPosition(new Vector2f(80.0f, 300.0f)).setVelocity(new Vector2f(0f, 0f));
        medkit = new Medkit(game).setPosition(new Vector2f(80.0f, 340.0f)).setVelocity(new Vector2f(0f, 0f));
        heroB = new HeroB(game).setPosition(new Vector2f(40.0f, 40.0f)).setVelocity(new Vector2f(0f, 0f));
    }

    @Override
    void update(float dt) {
        if (Control.Fire) {
            game.changeScene(GameScene.GAMEPLAY);
            return;
        }

        bee.update(dt);
        blue.update(dt);
        sniky.update(dt);
        foxy.update(dt);

        heroB.update(dt);
    }

    @Override
    void draw(SDL_Renderer renderer, float delta) {
        SDLUtils.CheckSDLErr(() -> SDL_SetRenderDrawColor(renderer, Colors.DkGray2Color.r, Colors.DkGray2Color.g, Colors.DkGray2Color.b, Colors.DkGray2Color.a));
        SDLUtils.CheckSDLErr(() -> SDL_RenderFillRect(renderer, null));

        // static background
        var r = SDLUtils.rect(0, 16, game.w, 312);
        SDLUtils.CheckSDLErr(() -> SDL_RenderCopy(renderer, game.assets.forest, null, r));

        // title
        SDLUtils.CheckSDLErr(() -> SDL_RenderCopy(renderer, game.assets.title, null, null));

        heroB.draw(renderer, delta);

        // mobs
        bee.draw(renderer, delta);
        Text.drawText(renderer, 120, 150, Colors.WhiteColor, Colors.BlackColor, String.format("BEE .......... %3d points", bee.point));

        blue.draw(renderer, delta);
        Text.drawText(renderer, 120, 190, Colors.WhiteColor, Colors.BlackColor, String.format("BLUE ......... %3d points", blue.point));

        sniky.draw(renderer, delta);
        Text.drawText(renderer, 120, 230, Colors.WhiteColor, Colors.BlackColor, String.format("SNIKY ........ %3d points", sniky.point));

        foxy.draw(renderer, delta);
        Text.drawText(renderer, 120, 270, Colors.WhiteColor, Colors.BlackColor, String.format("FOXY ......... %3d points", foxy.point));

        bomb.draw(renderer, delta);
        Text.drawText(renderer, 120, 310, Colors.WhiteColor, Colors.BlackColor, String.format("BOMB ......... %3d points", bomb.point));

        medkit.draw(renderer, delta);
        Text.drawText(renderer, 120, 350, Colors.WhiteColor, Colors.BlackColor, String.format("MEDKIT........ %3d points", medkit.point));

        // texts
        Text.drawText(renderer, 140, 420, Colors.WhiteColor, Colors.DkGrayColor, "PRESS \"FIRE\" TO START");
        Text.drawText(renderer, 135, 480 - 18, Colors.DkGrayColor, Colors.BlackColor, "PRESS \"F12\" TO QUIT OR \"F11\" FOR FULLSCREEN",
                Text.DrawTextOptions.builder().setSize(0.5f));
    }

    @Override
    void enter() {
        Control.reset();
    }

    private static class HeroB extends AnimatedSprite {

        public HeroB(RabbitGame game) {
            super(game.assets.heroBFrames, 64, 64);
        }

        @Override
        public void update(float dt) {
            animTimer += dt;
            if (animTimer > 0.3f) {
                animTimer = 0.0f;
                animFrame = 1 - animFrame;
            }
        }
    }
}
