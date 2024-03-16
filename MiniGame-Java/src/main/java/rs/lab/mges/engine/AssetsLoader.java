package rs.lab.mges.engine;

import io.github.libsdl4j.api.render.SDL_Renderer;
import io.github.libsdl4j.api.render.SDL_Texture;
import io.github.libsdl4j.api.render.SdlRender;
import io.github.libsdl4j.api.surface.SDL_Surface;
import io.github.libsdl4j.api.surface.SdlSurface;
import java.nio.file.Path;

import static io.github.libsdl4j.api.error.SdlError.SDL_GetError;

public abstract class AssetsLoader {

    public static final String CWD = Helpers.getHere().toString();
    public static String assetsFolder;

    public static void setAssetsFolder(String sf) {
        assetsFolder = sf;
    }

    public static SDL_Texture loadBitmap(SDL_Renderer renderer, String path) {
        final var fullPath = Path.of(CWD, assetsFolder, path);
        var surface = (SDL_Surface) SDLUtils.CheckSDLErrPointer(() -> SdlSurface.SDL_LoadBMP(fullPath.toString()));
        var texture = (SDL_Texture) SDLUtils.CheckSDLErrPointer(() -> SdlRender.SDL_CreateTextureFromSurface(renderer, surface));

        SdlSurface.SDL_FreeSurface(surface);
        return texture;
    }

    public static SDL_Surface loadBitmapFont(String filename) {
        var fullPath = getAssetPath(filename);
        var surface = (SDL_Surface) SDLUtils.CheckSDLErrPointer(() -> SdlSurface.SDL_LoadBMP(fullPath));
        return surface;
    }
    
    public static Sound.Audio loadSoundFx(String path) {
        var fullpath = getAssetPath(path);
        var newAudio = Sound.createAudio(fullpath, false, 100);
        if (newAudio == null) {
            SDLUtils.LogErr("Unable to read audio wav file %s, Error: %s", fullpath, SDL_GetError());
            System.exit(1);
        }
        return newAudio;
    }

    public static String getAssetPath(String fileName) {
        return Path.of(CWD, assetsFolder, fileName).toString();
    }
}
