from sdl2 import *  # type: ignore

from engine import AssetLoader

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

    __font: SDL_Surface

    @staticmethod
    def init():
        Text.__font = AssetLoader.loadBitmapFont("Fonts/font.bmp")

    @staticmethod
    def __drawChar(surface: SDL_Surface, x: int, chr: int):

        s = SDL_Rect((chr-0x21) * Text.FONT_SIZE, 0,
                     Text.FONT_SIZE, Text.FONT_SIZE)
        d = SDL_Rect(x * Text.FONT_SIZE, 0, Text.FONT_SIZE, Text.FONT_SIZE)
        SDL_BlitSurface(Text.__font, s, surface, d)

    @staticmethod
    def __drawText(surface: SDL_Surface,  text: str):
        x = 0
        for c in text.upper():
            if c != 0x20:
                Text.__drawChar(surface, x, chr=ord(c))
            x += 1

    @staticmethod
    def drawText(renderer: SDL_Renderer, x: int, y: int, color: SDL_Color, shadow: SDL_Color, text: str, options: DrawTextOptions = DrawTextOptions()):
        
        colors = Text.__font.contents.format.contents.palette.contents.colors
        colors[Text.COLOR_INDEX] = color
        colors[Text.SHADOW_INDEX] = shadow
        colors[Text.TRANSPARENT_INDEX] = SDL_Color(0, 0, 0, 0)
        
        surface = SDL_CreateRGBSurface(0, len(
            text) * Text.FONT_SIZE, Text.FONT_SIZE, 32, 0xff000000, 0x00ff0000, 0x0000ff00, 0x000000ff)
        Text.__drawText(surface, text)
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
