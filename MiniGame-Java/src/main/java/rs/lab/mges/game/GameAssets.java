package rs.lab.mges.game;

import io.github.libsdl4j.api.render.SDL_Renderer;
import io.github.libsdl4j.api.render.SDL_Texture;
import java.nio.file.Path;
import rs.lab.mges.engine.AssetsLoader;
import rs.lab.mges.engine.Sound;

import static io.github.libsdl4j.api.render.SdlRender.SDL_DestroyTexture;

public final class GameAssets {

    public SDL_Texture[] playerFrames;
    public SDL_Texture[] beeFrames;
    public SDL_Texture[] blueFrames;
    public SDL_Texture[] snikyFrames;
    public SDL_Texture[] foxyFrames;
    public SDL_Texture[] heroBFrames;

    public SDL_Texture playerBullet;
    public SDL_Texture ground;
    public SDL_Texture bloodGround;
    public SDL_Texture bloodParticle;
    public SDL_Texture explosion;
    public SDL_Texture healthbar;
    public SDL_Texture elements;
    public SDL_Texture title;
    public SDL_Texture medKit;
    public SDL_Texture forest;
    public SDL_Texture bomb;

    public Sound.Audio music;
    public Sound.Audio tickFx;
    public Sound.Audio explosionFx;
    public Sound.Audio pickupFx;
    public Sound.Audio mobHitFx;
    public Sound.Audio fireFx;
    public Sound.Audio explosionLongFx;

    private final SDL_Renderer renderer;

    public GameAssets(SDL_Renderer renderer) {
        this.renderer = renderer;

        Sound.initAudio();

        playerFrames = new SDL_Texture[]{
            loadFrame("hero1.bmp"),
            loadFrame("hero2.bmp")
        };

        beeFrames = new SDL_Texture[]{
            loadFrame("bee1a.bmp"),
            loadFrame("bee2a.bmp"),};

        blueFrames = new SDL_Texture[]{
            loadFrame("blue1a.bmp"),
            loadFrame("blue2a.bmp"),};

        snikyFrames = new SDL_Texture[]{
            loadFrame("sniky1.bmp"),
            loadFrame("sniky2.bmp"),};

        foxyFrames = new SDL_Texture[]{
            loadFrame("roka1.bmp"),
            loadFrame("roka2.bmp"),};

        heroBFrames = new SDL_Texture[]{
            loadFrame("hero1b.bmp"),
            loadFrame("hero2b.bmp"),};

        music = loadSound("world_1.wav");

        elements = AssetsLoader.loadBitmap(renderer, "Bitmaps/elements.bmp");
        title = AssetsLoader.loadBitmap(renderer, "Bitmaps/title.bmp");
        forest = AssetsLoader.loadBitmap(renderer, "Bitmaps/background.bmp");

        playerBullet = loadFrame("bullet.bmp");
        ground = loadFrame("tile_0004.bmp");

        bloodGround = loadFrame("blood_tile.bmp");
        bloodParticle = loadFrame("blood.bmp");

        explosion = loadFrame("explosion-4.bmp");
        healthbar = loadFrame("healthbar.bmp");

        medKit = loadFrame("medkit.bmp");
        bomb = loadFrame("bombball.bmp");
        tickFx = loadSound("tick.wav");
        explosionFx = loadSound("explosion.wav");
        pickupFx = loadSound("pickup.wav");
        mobHitFx = loadSound("hit.wav");
        fireFx = loadSound("fire.wav");
        explosionLongFx = loadSound("explosion_long.wav");
    }

    public void freeAll() {
        SDL_DestroyTexture(playerFrames[0]);
        SDL_DestroyTexture(playerFrames[1]);
        SDL_DestroyTexture(beeFrames[0]);
        SDL_DestroyTexture(beeFrames[1]);
        SDL_DestroyTexture(blueFrames[0]);
        SDL_DestroyTexture(blueFrames[1]);
        SDL_DestroyTexture(snikyFrames[0]);
        SDL_DestroyTexture(snikyFrames[1]);
        SDL_DestroyTexture(foxyFrames[0]);
        SDL_DestroyTexture(foxyFrames[1]);

        SDL_DestroyTexture(playerBullet);

        SDL_DestroyTexture(ground);
        SDL_DestroyTexture(bloodGround);
        SDL_DestroyTexture(bloodParticle);
        SDL_DestroyTexture(explosion);
        SDL_DestroyTexture(healthbar);
        SDL_DestroyTexture(title);
        SDL_DestroyTexture(elements);

        Sound.freeAudio(music);
        Sound.freeAudio(tickFx);
        Sound.freeAudio(explosionFx);
        Sound.freeAudio(pickupFx);
        Sound.freeAudio(mobHitFx);
        Sound.freeAudio(fireFx);
        Sound.freeAudio(explosionLongFx);

        Sound.endAudio();
    }

    private SDL_Texture loadFrame(String fileName) {
        return AssetsLoader.loadBitmap(renderer, Path.of("Tiles", fileName).toString());
    }

    private Sound.Audio loadSound(String fileName) {
        return AssetsLoader.loadSoundFx(Path.of("Sounds", fileName).toString());
    }
}
