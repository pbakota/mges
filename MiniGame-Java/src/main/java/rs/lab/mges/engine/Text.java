package rs.lab.mges.engine;

import com.sun.jna.Pointer;
import io.github.libsdl4j.api.pixels.SDL_Color;
import io.github.libsdl4j.api.rect.SDL_Point;
import io.github.libsdl4j.api.render.SDL_Renderer;
import io.github.libsdl4j.api.render.SDL_RendererFlip;
import io.github.libsdl4j.api.surface.SDL_Surface;
import io.github.libsdl4j.api.surface.SdlSurface;

import static io.github.libsdl4j.api.render.SdlRender.SDL_CreateTextureFromSurface;
import static io.github.libsdl4j.api.render.SdlRender.SDL_DestroyTexture;
import static io.github.libsdl4j.api.render.SdlRender.SDL_RenderCopyEx;
import static io.github.libsdl4j.api.surface.SdlSurface.SDL_CreateRGBSurface;
import static io.github.libsdl4j.api.surface.SdlSurface.SDL_FreeSurface;
import static io.github.libsdl4j.api.surface.SdlSurface.SDL_LockSurface;
import static io.github.libsdl4j.api.surface.SdlSurface.SDL_MUSTLOCK;
import static io.github.libsdl4j.api.surface.SdlSurface.SDL_UnlockSurface;

public final class Text {

    public static final int FONT_SIZE = 16;
    public static final int FONT_COUNT = 74;

    private static final int COLOR_INDEX = 31;
    private static final int SHADOW_INDEX = 25;
    private static final int TRANSPARENT_INDEX = 0;

    private static final byte[] fontData;

    static {
        var font = AssetsLoader.loadBitmapFont("Fonts/font.bmp");
        if (SDL_MUSTLOCK(font)) {
            SDLUtils.CheckSDLErr(() -> SDL_LockSurface(font));
        }

        var pixels = font.getPixels();
        fontData = new byte[FONT_SIZE * FONT_SIZE * FONT_COUNT];

        var dptr = 0;
        for (var c = 0; c < FONT_COUNT; ++c) {
            for (var y = 0; y < FONT_SIZE; ++y) {
                for (var x = 0; x < FONT_SIZE; ++x) {
                    fontData[dptr++] = pixels.getByte(FONT_SIZE * c + y * font.getPitch() + x);
                }
            }
        }

        if (SDL_MUSTLOCK(font)) {
            SDL_UnlockSurface(font);
        }
        SdlSurface.SDL_FreeSurface(font);
    }

    private static void drawToCharBuffer(Pointer pixels, int pitch, int color, int shadow, int chr) {
        var offset = FONT_SIZE * FONT_SIZE * (chr - 0x21);
        for (var y = 0; y < FONT_SIZE; ++y) {
            for (var x = 0; x < FONT_SIZE; ++x) {
                switch (fontData[offset++]) {
                    case COLOR_INDEX ->
                        pixels.setInt(y * pitch + x * 4, color);
                    case SHADOW_INDEX ->
                        pixels.setInt(y * pitch + x * 4, shadow);
                    case TRANSPARENT_INDEX -> {
                        // Do nothing here
                    }
                }
            }
        }
    }

    private static void drawChar(SDL_Surface surface, int x, int color, int shadow, int chr) {
        drawToCharBuffer(new Pointer(Pointer.nativeValue(surface.getPixels()) + x * FONT_SIZE * 4), surface.getPitch(), color, shadow, chr);
    }

    private static void drawText(SDL_Surface surface, String text, int color, int shadow) {
        if (SDL_MUSTLOCK(surface)) {
            SDLUtils.CheckSDLErr(() -> SDL_LockSurface(surface));
        }

        var x = 0;
        for (var c : text.toUpperCase().toCharArray()) {
            if (c == 0x20) {
                x++;
            } else {
                drawChar(surface, x++, color, shadow, c);
            }
        }

        if (SDL_MUSTLOCK(surface)) {
            SDL_UnlockSurface(surface);
        }
    }

    public static class DrawTextOptions {

        float size;
        float angle;
        boolean vflip;
        boolean hflip;

        protected DrawTextOptions() {
            this.size = 1.0f;
            this.angle = 0.0f;
            this.vflip = false;
            this.hflip = false;
        }

        // <editor-fold defaultstate="collapsed" desc="Builder">
        public static DrawTextOptions builder() {
            return new DrawTextOptions();
        }

        public DrawTextOptions setSize(float size) {
            this.size = size;
            return this;
        }

        public DrawTextOptions setAngle(float angle) {
            this.angle = angle;
            return this;
        }

        public DrawTextOptions setVflip(boolean vflip) {
            this.vflip = vflip;
            return this;
        }

        public DrawTextOptions setHflip(boolean hflip) {
            this.hflip = hflip;
            return this;
        }
        // </editor-fold>
    }

    public static void drawText(SDL_Renderer renderer, int x, int y, SDL_Color color, SDL_Color shadow, String text) {
        drawText(renderer, x, y, color, shadow, text, DrawTextOptions.builder());
    }

    public static void drawText(SDL_Renderer renderer, int x, int y, SDL_Color color, SDL_Color shadow, String text, DrawTextOptions options) {
        var surface = (SDL_Surface) SDLUtils.CheckSDLErrPointer(() -> SDL_CreateRGBSurface(0, text.length() * FONT_SIZE, FONT_SIZE, 32,
                0xff000000, 0x00ff0000, 0x0000ff00, 0x000000ff));

        drawText(surface, text, SDLUtils.toRGBA(color), SDLUtils.toRGBA(shadow));
        var texture = SDL_CreateTextureFromSurface(renderer, surface);

        var dst = SDLUtils.rect(x, y, (int) (text.length() * FONT_SIZE * options.size), (int) (FONT_SIZE * options.size));
        var flip = (options.hflip ? SDL_RendererFlip.SDL_FLIP_HORIZONTAL : SDL_RendererFlip.SDL_FLIP_NONE)
                | (options.vflip ? SDL_RendererFlip.SDL_FLIP_VERTICAL : SDL_RendererFlip.SDL_FLIP_NONE);

        SDLUtils.CheckSDLErr(() -> SDL_RenderCopyEx(renderer, texture, null, dst, options.angle, (SDL_Point) null, flip));

        SDL_DestroyTexture(texture);
        SDL_FreeSurface(surface);
    }
}
