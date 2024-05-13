
from engine import Sprite
from sdl2 import * # type: ignore

from engine.Utils import Vector2f
from game import Hero, RabbitGame

__all__ = ['Bomb', 'Medkit']

class Powerup(Sprite):
    def __init__(self, frame, points):
        super().__init__(frame, 32,32)
        self._active = False
        self._points = points
        self._waitTimer = 0.0
        self._hitbox = SDL_Rect(0,10, int(self._size.x), int(self._size.y-10))

    def hit(self, hero: Hero):
        if Sprite.AABB(self.hitbox, hero.hitbox):
            self._active = False
            return True
        else:
            return False
        
    def update(self, dt):
        if self._position.y < 280.0:
            self._velocity.y += SDL_STANDARD_GRAVITY
            self._position.y += dt * self._velocity.y
        else:
            self._position.y = 280.0
            self._waitTimer += dt
            if self._waitTimer > 3.0:
                if self._alpha < 10:
                    self._alpha = 0
                    self._active = False
                else:
                    self._alpha -= 5
    
    def reset(self, x:float):
        self._position = Vector2f(x, 100.0)
        self._velocity = Vector2f(0.0, 50.0)
        self._waitTimer = 0.0
        self._alpha = 255
        self._active = True
        self._oldPosition = None

class Bomb(Powerup):
    def __init__(self, game: RabbitGame):
        super().__init__(game.assets.bomb, 500)

class Medkit(Powerup):
    def __init__(self, game: RabbitGame):
        super().__init__(game.assets.medKit, 500)
