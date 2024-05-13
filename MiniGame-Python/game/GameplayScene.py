from sdl2 import *  # type: ignore
from .Scene import Scene, GameScene
from engine import Control


class GameplayScene(Scene):
    def __init__(self, game):
        super().__init__(game)

    def enter(self):
        Control.reset()

    def leave(self):
        pass

    def update(self, dt):
        if Control.Exit:
            self._game.changeScene(GameScene.TITLE)
            return

    def draw(self, renderer, delta):
        # Static background (forest)
        r = SDL_Rect(0, 16, self._game._w, 312)
        SDL_RenderCopy(renderer, self._game.assets.forest, None, r)

        # Platform
        d = SDL_Rect(0, 280+32, 32, 32)
        for i in range(0, int(self._game._w/32)):
            d.x = i * 32
            SDL_RenderCopy(renderer, self._game.assets.ground, None, d)