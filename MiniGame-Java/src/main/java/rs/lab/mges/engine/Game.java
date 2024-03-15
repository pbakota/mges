package rs.lab.mges.engine;

import io.github.libsdl4j.api.log.SDL_LogCategory;
import io.github.libsdl4j.api.log.SDL_LogPriority;
import io.github.libsdl4j.api.render.SDL_Renderer;
import io.github.libsdl4j.api.timer.SdlTimer;
import io.github.libsdl4j.api.video.SDL_Window;
import io.github.libsdl4j.api.event.SDL_Event;
import io.github.libsdl4j.api.event.SDL_EventType;
import io.github.libsdl4j.api.video.SDL_WindowFlags;
import java.util.Random;

import static io.github.libsdl4j.api.Sdl.SDL_Init;
import static io.github.libsdl4j.api.Sdl.SDL_Quit;
import static io.github.libsdl4j.api.SdlSubSystemConst.SDL_INIT_AUDIO;
import static io.github.libsdl4j.api.SdlSubSystemConst.SDL_INIT_VIDEO;
import static io.github.libsdl4j.api.event.SdlEvents.SDL_PollEvent;
import static io.github.libsdl4j.api.keycode.SDL_Keycode.SDLK_F11;
import static io.github.libsdl4j.api.keycode.SDL_Keycode.SDLK_F12;
import static io.github.libsdl4j.api.log.SdlLog.SDL_LogSetPriority;
import static io.github.libsdl4j.api.mouse.SdlMouse.SDL_ShowCursor;
import static io.github.libsdl4j.api.render.SDL_RendererFlags.SDL_RENDERER_ACCELERATED;
import static io.github.libsdl4j.api.render.SDL_RendererFlags.SDL_RENDERER_PRESENTVSYNC;
import static io.github.libsdl4j.api.render.SdlRender.SDL_CreateRenderer;
import static io.github.libsdl4j.api.render.SdlRender.SDL_DestroyRenderer;
import static io.github.libsdl4j.api.render.SdlRender.SDL_RenderClear;
import static io.github.libsdl4j.api.render.SdlRender.SDL_RenderPresent;
import static io.github.libsdl4j.api.render.SdlRender.SDL_RenderSetLogicalSize;
import static io.github.libsdl4j.api.render.SdlRender.SDL_SetRenderDrawColor;
import static io.github.libsdl4j.api.timer.SdlTimer.SDL_GetPerformanceCounter;
import static io.github.libsdl4j.api.video.SdlVideo.SDL_CreateWindow;
import static io.github.libsdl4j.api.video.SdlVideo.SDL_DestroyWindow;
import static io.github.libsdl4j.api.video.SdlVideo.SDL_SetWindowFullscreen;
import static io.github.libsdl4j.api.video.SdlVideo.SDL_SetWindowTitle;
import static io.github.libsdl4j.api.video.SdlVideoConst.SDL_WINDOWPOS_CENTERED;

public abstract class Game {

    public int w;
    public int h;

    private String windowTitle;
    private int windowFlags;
    private SDL_Window window;
    private SDL_Renderer renderer;

    protected Random rand;

    public Game(int w, int h) {
        this(w, h, "MiniGame", 0);
    }

    public Game(int w, int h, String windowTitle, int windowFlags) {
        this.w = w;
        this.h = h;
        this.windowTitle = windowTitle;
        this.windowFlags = windowFlags;
    }

    protected void init(SDL_Renderer renderer) {
    }

    protected void free() {
    }

    protected abstract void update(float dt);

    protected abstract void draw(SDL_Renderer renderer, float interpolationDelta);

    public void run() {
        var perfrequency = SdlTimer.SDL_GetPerformanceFrequency();
        /* Enable standard application logging */
        SDL_LogSetPriority((int) SDL_LogCategory.SDL_LOG_CATEGORY_APPLICATION, SDL_LogPriority.SDL_LOG_PRIORITY_VERBOSE);

        SDLUtils.CheckSDLErr(() -> SDL_Init(SDL_INIT_VIDEO | SDL_INIT_AUDIO));

        window = SDL_CreateWindow(windowTitle, SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, w, h, windowFlags);
        renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_ACCELERATED | SDL_RENDERER_PRESENTVSYNC);

        init(renderer);

        var quit = false;
        var fullscreen = false;
        var lastTime = SDL_GetPerformanceCounter();
        final float targetRate = 1.0f / 60.0f;
        var deltaTimeAccumlator = 0.0f;

        var event = new SDL_Event();
        do {
            while (SDL_PollEvent(event) != 0 && !quit) {
                switch (event.type) {
                    case SDL_EventType.SDL_QUIT ->
                        quit = true;
                    case SDL_EventType.SDL_KEYDOWN -> {
                        if (event.key.keysym.sym == SDLK_F11) {
                            fullscreen = !fullscreen;
                            final var f = fullscreen;
                            SDLUtils.CheckSDLErr(() -> SDL_SetWindowFullscreen(window, f ? (int) SDL_WindowFlags.SDL_WINDOW_FULLSCREEN_DESKTOP : 0));
                            SDL_ShowCursor(!fullscreen ? 1 : 0);
                        } else if (event.key.keysym.sym == SDLK_F12) {
                            quit = true;
                        } else {
                            Control.HandleEvent(event);
                        }
                    }
                    case SDL_EventType.SDL_KEYUP -> {
                        Control.HandleEvent(event);
                    }
                }
            }

            var now = SDL_GetPerformanceCounter();
            var deltaTime = (float) (now - lastTime) / perfrequency;

            lastTime = now;

            deltaTimeAccumlator += deltaTime;
            while (deltaTimeAccumlator > targetRate) {
                update(deltaTime);
                deltaTimeAccumlator -= targetRate;
            }

            SDL_SetWindowTitle(window, String.format("%s - dt=%.6f, fps=%d", windowTitle, deltaTime, (int) (1.0f / deltaTime)));

            SDLUtils.CheckSDLErr(() -> SDL_SetRenderDrawColor(renderer, (byte) 0, (byte) 0, (byte) 0, (byte) 0xff));
            SDLUtils.CheckSDLErr(() -> SDL_RenderClear(renderer));

            draw(renderer, deltaTimeAccumlator / targetRate);
            SDLUtils.CheckSDLErr(() -> SDL_RenderSetLogicalSize(renderer, w, h));

            SDL_RenderPresent(renderer);

        } while (!quit);

        free();

        SDL_DestroyRenderer(renderer);
        SDL_DestroyWindow(window);
        SDL_Quit();
    }
}
