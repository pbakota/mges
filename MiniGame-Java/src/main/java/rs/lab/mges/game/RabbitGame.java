package rs.lab.mges.game;

import io.github.libsdl4j.api.render.SDL_Renderer;
import rs.lab.mges.engine.AssetsLoader;
import rs.lab.mges.engine.Game;
import rs.lab.mges.engine.Sound;

public class RabbitGame extends Game {

    public enum GameScene {
        TITLE,
        GAMEPLAY
    };

    public GameAssets assets;

    private Scene currentScene;
    private TitleScene titleScene;
    private GameplayScene gameplayScene;

    public RabbitGame() {
        super(640, 480, "Rabbit unleashed", 0);

        /* setup assets folder relative to the current folder */
        AssetsLoader.setAssetsFolder("assets");
    }

    @Override
    protected void init(SDL_Renderer renderer) {

        assets = new GameAssets(renderer);
        titleScene = new TitleScene(this);
        gameplayScene = new GameplayScene(this);
        currentScene = titleScene;

        Sound.playMusicFromMemory(assets.music);
    }

    @Override
    protected void free() {
        assets.freeAll();
    }

    public void changeScene(GameScene scene) {
        var newScene = switch (scene) {
            case TITLE ->
                titleScene;
            case GAMEPLAY ->
                gameplayScene;
            default ->
                throw new RuntimeException("Unexpected scene");
        };

        if (currentScene.equals(newScene)) {
            return;
        }

        currentScene.leave();
        currentScene = newScene;
        currentScene.enter();
    }

    @Override
    protected void draw(SDL_Renderer renderer, float interpolationAlpha) {
        currentScene.draw(renderer, interpolationAlpha);
    }

    @Override
    protected void update(float dt) {
        currentScene.update(dt);
    }
}
