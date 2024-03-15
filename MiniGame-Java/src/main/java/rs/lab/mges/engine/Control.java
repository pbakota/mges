package rs.lab.mges.engine;

import io.github.libsdl4j.api.event.SDL_Event;
import io.github.libsdl4j.api.event.SDL_EventType;
import io.github.libsdl4j.api.keycode.SDL_Keycode;

public final class Control {

    public static boolean Left;
    public static boolean Right;
    public static boolean Up;
    public static boolean Down;
    public static boolean Fire;
    public static boolean Exit;

    public static void Reset() {
        Left = false;
        Right = false;
        Up = false;
        Down = false;
        Fire = false;
        Exit = false;
    }

    public static void HandleEvent(SDL_Event evt) {
        switch (evt.type) {
            case SDL_EventType.SDL_KEYDOWN -> {
                if (evt.key.keysym.sym == SDL_Keycode.SDLK_LEFT) {
                    Left = true;
                } else if (evt.key.keysym.sym == SDL_Keycode.SDLK_RIGHT) {
                    Right = true;
                } else if (evt.key.keysym.sym == SDL_Keycode.SDLK_UP) {
                    Up = true;
                } else if (evt.key.keysym.sym == SDL_Keycode.SDLK_DOWN) {
                    Down = true;
                } else if (evt.key.keysym.sym == SDL_Keycode.SDLK_Z) {
                    Fire = true;
                } else if (evt.key.keysym.sym == SDL_Keycode.SDLK_ESCAPE) {
                    Exit = true;
                }
            }
            case SDL_EventType.SDL_KEYUP -> {
                if (evt.key.keysym.sym == SDL_Keycode.SDLK_LEFT) {
                    Left = false;
                } else if (evt.key.keysym.sym == SDL_Keycode.SDLK_RIGHT) {
                    Right = false;
                } else if (evt.key.keysym.sym == SDL_Keycode.SDLK_UP) {
                    Up = false;
                } else if (evt.key.keysym.sym == SDL_Keycode.SDLK_DOWN) {
                    Down = false;
                } else if (evt.key.keysym.sym == SDL_Keycode.SDLK_Z) {
                    Fire = false;
                } else if (evt.key.keysym.sym == SDL_Keycode.SDLK_ESCAPE) {
                    Exit = false;
                }
            }
        }
    }
}
