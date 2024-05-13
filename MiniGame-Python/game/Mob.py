from engine import AnimatedSprite
from random import random

__all__ = ['Mob', 'MobBee', 'MobBlue', 'MobFoxy', 'MobSniky']


class Mob(AnimatedSprite):
    def __init__(self, frames, flipped, hp, speed, points):
        super().__init__(frames, 32, 32)
        self._flipped = flipped
        self._active = True
        self._hp = hp
        self._points = points
        self._speed = speed

        if self._flipped:
            self._position.x = 640.0
            self._velocity.x = -self._speed
        else:
            self._position.x = -32.0
            self._velocity.x = self._speed

    def update(self, dt):
        if self._flipped:
            if self._velocity.x > 0:
                self._velocity.x -= 1.0
                if self._velocity.x < 1.0:
                    self._velocity.x = -self._speed
        else:
            if self._velocity.x < 0:
                self._velocity.x += 1.0
                if self._velocity.x >= 0.0:
                    self._velocity.x = self._speed

        self._position.x += self._velocity.x * dt

        self._animTimer += dt
        if self._animTimer > 0.25:
            self._animTimer = 0.0
            self._animFrame = 1 - self._animFrame

        if self._position.x < -32.0 or self._position.x > 640.0:
            self._active = False

    def gotHit(self, hero):
        if self._hp <= 0:
            return True

        if hero.flipped:
            self._velocity.x = -self._speed * 1.2
        else:
            self._velocity.x = self._speed * 1.2

        return False


class MobBee(Mob):
    def __init__(self, game, flipped):
        super().__init__(game.assets.beeFrames, flipped, hp=2, speed=40, points=20)
        self._position.y = 280.0 - 32 * random() * 32.0


class MobBlue(Mob):
    def __init__(self, game, flipped):
        super().__init__(game.assets.blueFrames, flipped, hp=3, speed=60, points=50)
        self._position.y = 280.0 - 32 * random() * 32.0


class MobFoxy(Mob):
    def __init__(self, game, flipped):
        super().__init__(game.assets.foxyFrames, flipped, hp=2, speed=50, points=100)
        self._position.y = 280.0
        self._hitbox.x = int(self._size.x / 4 - 8)
        self._hitbox.y = int(self._size.y / 4)
        self._hitbox.h -= self._hitbox.y


class MobSniky(Mob):
    def __init__(self, game, flipped):
        super().__init__(game.assets.snikyFrames, flipped, hp=5, speed=10, points=200)
        self._position.y = 280.0
        self._hitbox.y = int(self._size.y / 2)
        self._hitbox.h -= int(self._hitbox.y)
