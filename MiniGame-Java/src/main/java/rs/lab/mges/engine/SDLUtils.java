package rs.lab.mges.engine;

import com.sun.jna.PointerType;
import io.github.libsdl4j.api.log.SDL_LogCategory;
import io.github.libsdl4j.api.log.SdlLog;
import java.util.function.Supplier;

import static io.github.libsdl4j.api.error.SdlError.SDL_GetError;
import io.github.libsdl4j.api.pixels.SDL_Color;
import io.github.libsdl4j.api.rect.SDL_Rect;

public final class SDLUtils {

    private SDLUtils() {
    }

    public abstract static class Vector2<T> {

        public T y;
        public T x;

        public Vector2() {
        }

        public Vector2(T x, T y) {
            this.x = x;
            this.y = y;
        }
    }

    public static class Vector2f extends Vector2<Float> {

        public Vector2f(Float x, Float y) {
            super(x, y);
        }

        public Vector2f() {
            this.x = 0.0f;
            this.y = 0.0f;
        }
    }

    public static class Vector2i extends Vector2<Integer> {

        public Vector2i(Integer x, Integer y) {
            super(x, y);
        }

        public Vector2i() {
            this.x = 0;
            this.y = 0;
        }
    }

    public static void CheckSDLErr(Supplier<Integer> act) {
        if (act.get() != 0) {
            LogErr(SDL_GetError());
            System.exit(1);
        }
    }

    public static PointerType CheckSDLErrPointer(Supplier<PointerType> act) {
        var ptr = act.get();
        if (ptr == null) {
            LogErr(SDL_GetError());
            System.exit(1);
        }

        return ptr;
    }

    public static int toRGBA(SDL_Color color) {
        return (int) ((color.r & 0xff) << 24) | (int) ((color.g & 0xff) << 16) | (int) ((color.b & 0xff) << 8) | (int) (color.a & 0xff);
    }

    public static SDL_Rect rect(int x, int y, int w, int h) {
        var r = new SDL_Rect();
        r.x = x;
        r.y = y;
        r.w = w;
        r.h = h;

        return r;
    }

    public static SDL_Rect rect(float x, float y, int w, int h) {
        return rect((int) x, (int) y, w, h);
    }

    public static void LogErr(String text, Object... args) {
        SdlLog.SDL_LogError((int) SDL_LogCategory.SDL_LOG_CATEGORY_APPLICATION, text, args);
    }

    public static void LogInfo(String text, Object... args) {
        SdlLog.SDL_LogInfo((int) SDL_LogCategory.SDL_LOG_CATEGORY_APPLICATION, text, args);
    }

    public static void LogDebug(String text, Object... args) {
        SdlLog.SDL_LogDebug((int) SDL_LogCategory.SDL_LOG_CATEGORY_APPLICATION, text, args);
    }
}
