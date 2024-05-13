from sdl2 import * # type: ignore

__all__ = ['Control']


class Control:
    Left = False
    Right = False
    Up = False
    Down = False
    Fire = False
    Exit = False

    @staticmethod
    def reset():
        Control.Left = False
        Control.Right = False
        Control.Up = False
        Control.Down = False
        Control.Fire = False
        Control.Exit = False


    @staticmethod
    def handleEvent(event):
        if event.type == SDL_KEYDOWN:
            if event.key.keysym.sym == SDLK_LEFT:
                Control.Left = True
            elif event.key.keysym.sym == SDLK_RIGHT:
                Control.Right = True
            elif event.key.keysym.sym == SDLK_UP:
                Control.Up = True
            elif event.key.keysym.sym == SDLK_DOWN:
                Control.Down = True
            elif event.key.keysym.sym == SDLK_z:
                Control.Fire = True
            elif event.key.keysym.sym == SDLK_ESCAPE:
                Control.Exit = True
        elif event.type == SDL_KEYUP:
            if event.key.keysym.sym == SDLK_LEFT:
                Control.Left = False
            elif event.key.keysym.sym == SDLK_RIGHT:
                Control.Right = False
            elif event.key.keysym.sym == SDLK_UP:
                Control.Up = False
            elif event.key.keysym.sym == SDLK_DOWN:
                Control.Down = False
            elif event.key.keysym.sym == SDLK_z:
                Control.Fire = False
            elif event.key.keysym.sym == SDLK_ESCAPE:
                Control.Exit = False
