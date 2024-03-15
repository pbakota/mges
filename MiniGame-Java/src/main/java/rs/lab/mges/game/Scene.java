package rs.lab.mges.game;

import io.github.libsdl4j.api.render.SDL_Renderer;

public abstract class Scene {

    protected RabbitGame game;

    public Scene(RabbitGame game) {
        this.game = game;
    }

    void enter() {
    }

    void leave() {
    }

    abstract void update(float dt);

    abstract void draw(SDL_Renderer renderer, float delta);
}
