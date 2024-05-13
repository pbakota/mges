import ctypes
from sdl2 import *  # type: ignore

from engine import AssetLoader, SDLUtils

__all__ = ['Text', 'DrawTextOptions']


class DrawTextOptions:
    size: float
    angle: float
    vflip: bool
    hflip: bool

    def __init__(self, size: float = 1.0, angle: float = 0.0, vflip: bool = False, hflip: bool = False):
        self.size = size
        self.angle = angle
        self.vflip = vflip
        self.hflip = hflip


class Text:

    FONT_SIZE = 16
    FONT_COUNT = 74
    COLOR_INDEX = 31
    SHADOW_INDEX = 25
    TRANSPARENT_INDEX = 0

    fontData = []

    @staticmethod
    def init():
        font = AssetLoader.loadBitmapFont("Fonts/font.bmp")
        if SDL_MUSTLOCK(font):
            SDL_LockSurface(font)

        Text.fontData = [0 for v in range(
            0, Text.FONT_SIZE * Text.FONT_SIZE * Text.FONT_COUNT)]
        pixels = ctypes.cast(font.contents.pixels, ctypes.POINTER(Uint8))
        dptr = 0
        for c in range(0, Text.FONT_COUNT):
            for y in range(0, Text.FONT_SIZE):
                for x in range(0, Text.FONT_SIZE):
                    Text.fontData[dptr] = pixels[Text.FONT_SIZE *
                                                 c + y * font.contents.pitch + x]
                    dptr += 1

        if SDL_MUSTLOCK(font):
            SDL_UnlockSurface(font)
        SDL_FreeSurface(font)

    @staticmethod
    def __drawToCharBuffer(pixels: ctypes._Pointer, pitch: int, color: int, shadow: int, chr: int):
        offset = Text.FONT_SIZE * Text.FONT_SIZE * (chr - 0x21)
        for y in range(0, Text.FONT_SIZE):
            for x in range(0, Text.FONT_SIZE):
                if Text.fontData[offset] == Text.COLOR_INDEX:
                    pixels[y * pitch + x * 4 + 0] = (color) & 0xff
                    pixels[y * pitch + x * 4 + 1] = (color >> 8) & 0xff
                    pixels[y * pitch + x * 4 + 2] = (color >> 16) & 0xff
                    pixels[y * pitch + x * 4 + 3] = (color >> 24) & 0xff
                elif Text.fontData[offset] == Text.SHADOW_INDEX:
                    pixels[y * pitch + x * 4 + 0] = (shadow) & 0xff
                    pixels[y * pitch + x * 4 + 1] = (shadow >> 8) & 0xff
                    pixels[y * pitch + x * 4 + 2] = (shadow >> 16) & 0xff
                    pixels[y * pitch + x * 4 + 3] = (shadow >> 24) & 0xff
                elif Text.fontData[offset] == Text.TRANSPARENT_INDEX:
                    # Do nothing
                    pass
                offset += 1

    @staticmethod
    def __drawChar(surface: SDL_Surface, x: int, color: int, shadow: int, chr: int):
        pxbuf = ctypes.cast(surface.contents.pixels + x *
                            Text.FONT_SIZE * 4, ctypes.POINTER(Uint8))
        Text.__drawToCharBuffer(
            pxbuf, surface.contents.pitch, color, shadow, chr)

    @staticmethod
    def __drawText(surface: SDL_Surface,  text: str, color: int, shadow: int):
        if SDL_MUSTLOCK(surface):
            SDL_LockSurface(surface)

        x = 0
        for c in text.upper():
            if c != 0x20:
                Text.__drawChar(surface, x, color, shadow, chr=ord(c))
            x += 1

        if SDL_MUSTLOCK(surface):
            SDL_UnlockSurface(surface)

    @staticmethod
    def drawText(renderer: SDL_Renderer, x: int, y: int, color: SDL_Color, shadow: SDL_Color, text: str, options: DrawTextOptions = DrawTextOptions()):
        surface = SDL_CreateRGBSurface(0, len(
            text) * Text.FONT_SIZE, Text.FONT_SIZE, 32, 0xff000000, 0x00ff0000, 0x0000ff00, 0x000000ff)
        Text.__drawText(surface, text, SDLUtils.toRGBA(
            color), SDLUtils.toRGBA(shadow))
        texture = SDL_CreateTextureFromSurface(renderer, surface)
        dst = SDL_Rect(x, y, (int)(len(text) * Text.FONT_SIZE *
                       options.size), (int)(Text.FONT_SIZE * options.size))
        flip = SDL_FLIP_NONE
        if options.hflip:
            flip |= SDL_FLIP_HORIZONTAL
        if options.vflip:
            flip |= SDL_FLIP_VERTICAL
        SDL_RenderCopyEx(renderer, texture, None, dst,
                         options.angle, None, flip)
        SDL_DestroyTexture(texture)
        SDL_FreeSurface(surface)
