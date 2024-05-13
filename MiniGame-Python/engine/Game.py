import ctypes
from sdl2 import * # type: ignore

from .Control import Control

__all__ = ['Game']


class Game:
    def __init__(self, w, h, title="MiniGame", flags=0):
        self._w = w
        self._h = h
        self._title = title
        self._flags = flags

    # Abstract methods to override
    def init(self, renderer): raise NotImplementedError()
    def free(self): raise NotImplementedError()
    def update(self, dt): raise NotImplementedError()
    def draw(self, renderer, delta): raise NotImplementedError()

    def run(self):
        perfrequency = SDL_GetPerformanceFrequency()
        SDL_LogSetPriority(SDL_LOG_CATEGORY_APPLICATION,
                           SDL_LOG_PRIORITY_VERBOSE)
        SDL_Init(SDL_INIT_VIDEO | SDL_INIT_AUDIO)

        window = SDL_CreateWindow(
            self._title.encode('utf8'),
            SDL_WINDOWPOS_CENTERED,
            SDL_WINDOWPOS_CENTERED,
            self._w,
            self._h,
            self._flags
        )

        renderer = SDL_CreateRenderer(
            window, -1, SDL_RENDERER_ACCELERATED | SDL_RENDERER_PRESENTVSYNC
        )

        self.init(renderer)

        quit = False
        fullscreen = False
        lastTime = SDL_GetPerformanceCounter()
        targetRate = 1.0 / 60.0
        deltaAccumlator = 0.0

        event = SDL_Event()
        while not quit:
            while SDL_PollEvent(ctypes.byref(event)) != 0:
                if event.type == SDL_QUIT:
                    quit = True
                    break
                elif event.type == SDL_KEYDOWN:
                    if event.key.keysym.sym == SDLK_F11:
                        fullscreen = not fullscreen
                        if fullscreen:
                            SDL_SetWindowFullscreen(
                                window, SDL_WINDOW_FULLSCREEN_DESKTOP
                            )
                            SDL_ShowCursor(0)
                        else:
                            SDL_SetWindowFullscreen(window, 0)
                            SDL_ShowCursor(1)
                    if event.key.keysym.sym == SDLK_F12:
                        quit = True
                    else:
                        Control.handleEvent(event)
                elif event.type == SDL_KEYUP:
                    Control.handleEvent(event)

            now = SDL_GetPerformanceCounter()
            deltaTime = (now - lastTime) / perfrequency

            lastTime = now
            deltaAccumlator += deltaTime
            while deltaAccumlator > targetRate:
                self.update(deltaTime)
                deltaAccumlator -= targetRate

            # title_bytes = utf8(value).encode('utf-8')
            SDL_SetWindowTitle(
                window, f"{self._title} - dt={deltaTime:.6f}, fps={int(1/deltaTime)}".encode('utf8'))
            SDL_SetRenderDrawColor(renderer, 0, 0, 0, 0xFF)
            SDL_RenderClear(renderer)

            self.draw(renderer, deltaAccumlator/targetRate)
            SDL_RenderSetLogicalSize(renderer, self._w, self._h)

            SDL_RenderPresent(renderer)

        SDL_DestroyRenderer(renderer)
        SDL_DestroyWindow(window)
        SDL_Quit()
