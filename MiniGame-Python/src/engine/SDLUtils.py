from ctypes import * # type: ignore
from sdl2 import * # type: ignore

__all__ = ['LogInfo', 'LogErr', 'LogWarn', 'toRGBA']

def LogInfo(text):
	SDL_LogInfo(SDL_LOG_CATEGORY_APPLICATION, text.encode('utf8'))

def LogErr(text):
	SDL_LogError(SDL_LOG_CATEGORY_APPLICATION, text.encode('utf8'))

def LogWarn(text):
	SDL_LogWarn(SDL_LOG_CATEGORY_APPLICATION, text.encode('utf8'))

def toRGBA(color: SDL_Color) -> int:
	return ((color.r & 0xff) << 24) | ((color.g & 0xff) << 16) | ((color.b & 0xff) << 8) | (int) (color.a & 0xff)

def fromRGBA(color: int) -> SDL_Color:
	return SDL_Color(r = (color & 0xff000000) >> 24, g=(color & 0x00ff0000) >> 16,  b=(color & 0x0000ff00) >> 8, a=color & 0x000000ff)
