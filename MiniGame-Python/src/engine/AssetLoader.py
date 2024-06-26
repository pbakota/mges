from sdl2 import * # type: ignore

from engine.Sound import Audio

__all__ = ["loadBitmap", "loadSoundFx"]

CWD = "./assets"


def loadBitmap(renderer, fileName) -> SDL_Texture:
    surface = SDL_LoadBMP(f"{CWD}/{fileName}".encode("utf8"))
    texture = SDL_CreateTextureFromSurface(renderer, surface)
    SDL_FreeSurface(surface)
    return texture


def loadSoundFx(sound, fileName) -> Audio:
    return sound.createAudio(f"{CWD}/{fileName}")


def loadBitmapFont(fileName)-> SDL_Surface:
    return SDL_LoadBMP(f"{CWD}/{fileName}".encode("utf8"))
