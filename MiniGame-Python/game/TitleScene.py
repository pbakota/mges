from .Scene import Scene, GameScene
from . import Colors
from .Mob import MobBee, MobBlue, MobFoxy, MobSniky

from engine import Control, Text, Vector2f, AnimatedSprite
from sdl2 import *  # type: ignore


class TitleScene(Scene):
    def __init__(self, game):
        super().__init__(game)

        self._bee = MobBee(self._game, False)
        self._bee.position = Vector2f(80.0, 140.0)
        self._bee.velocity = Vector2f(0.0, 0.0)

        self._blue = MobBlue(self._game, False)
        self._blue.position = Vector2f(80.0, 180.0)
        self._blue.velocity = Vector2f(0.0, 0.0)

        self._sniky = MobSniky(self._game, False)
        self._sniky.position = Vector2f(80.0, 220.0)
        self._sniky.velocity = Vector2f(0.0, 0.0)

        self._foxy = MobFoxy(self._game, False)
        self._foxy.position = Vector2f(80.0, 260.0)
        self._foxy.velocity = Vector2f(0.0, 0.0)

        self._heroB = HeroB(self._game)
        self._heroB.position = Vector2f(40.0, 40.0)
        self._heroB.velocity = Vector2f(0.0, 0.0)

    def enter(self):
        Control.reset()

    def update(self, dt):
        if Control.Fire:
            self._game.changeScene(GameScene.GAMEPLAY)
            return

        self._bee.update(dt)
        self._blue.update(dt)
        self._sniky.update(dt)
        self._foxy.update(dt)

        self._heroB.update(dt)

    def draw(self, renderer, delta):
        SDL_SetRenderDrawColor(
            renderer,
            Colors.DkGray2Color.r,
            Colors.DkGray2Color.g,
            Colors.DkGray2Color.b,
            0xff,
        )

        SDL_RenderFillRect(renderer, None)

        # Static background (forest)
        r = SDL_Rect(0, 16, self._game._w, 312)
        SDL_RenderCopy(renderer, self._game.assets.forest, None, r)

        # Title
        SDL_RenderCopy(renderer, self._game.assets.title, None, None)
        self._heroB.draw(renderer, delta)

        # Mobs
        self._bee.draw(renderer, delta)
        Text.drawText(renderer, 120, 150, Colors.WhiteColor, Colors.BlackColor, f"BEE  ......... {self._bee._points:3} points")

        self._blue.draw(renderer, delta)
        Text.drawText(renderer, 120, 190, Colors.WhiteColor, Colors.BlackColor, f"BLUE  ........ {self._blue._points:3} points")

        self._sniky.draw(renderer, delta)
        Text.drawText(renderer, 120, 230, Colors.WhiteColor, Colors.BlackColor, f"SNIKY ........ {self._blue._points:3} points")

        self._foxy.draw(renderer, delta)
        Text.drawText(renderer, 120, 270, Colors.WhiteColor, Colors.BlackColor, f"FOXY  ........ {self._blue._points:3} points")


class HeroB(AnimatedSprite):
    def __init__(self, game):
        super().__init__(game.assets.heroBFrames, 64, 64)

    def update(self, dt):
        self._animTimer += dt
        if self._animTimer > 0.3:
            self._animTimer = 0.0
            self._animFrame = 1 - self._animFrame
