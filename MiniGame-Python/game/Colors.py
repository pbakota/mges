from sdl2 import * # type: ignore

__all__ = ['BlackColor', 'WhiteColor', 'DkGrayColor', 'DkGray2Color']

BlackColor = SDL_Color(0x00, 0x00, 0x00, 0xff)
WhiteColor = SDL_Color(0xff, 0xff, 0xff, 0xff)

DkGrayColor = SDL_Color(64,64,64,255)
DkGray2Color = SDL_Color(12,17,34,255)

