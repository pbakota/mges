from engine import AnimatedSprite, Control, Sprite, Vector2f
from game import Mob, RabbitGame
from sdl2 import *  # type: ignore


class Hero(AnimatedSprite):
    def __init__(self, game: RabbitGame):
        super().__init__(game.assets.playerFrames, 32, 32)

        self._game = game
        self._position = Vector2f(300.0, 200.0)
        self._hitbox = SDL_Rect(int(self._size.x / 4), int(self._size.y / 4),
                                int(self._size.x / 2), int(self._size.y / 2))

        self._bulletTime = 0.0
        self._supersizeTimer = 0.0
        self._supersized = False
        self._playerBullets: list[PlayerBullet] = []

        self._onGround = False
        self._oldPosition = None

    def reset(self):
        self._playerBullets = []
        self._position = Vector2f(300.0, 200.0)
        self._velocity = Vector2f()
        self._bulletTime = 0.0
        self._supersizeTimer = 0.0
        self._supersized = 0.0
        self._onGround = False
        self._oldPosition = None

    def update(self, dt):
        # Remove inactive bullets
        self._playerBullets = [
            bullet for bullet in self._playerBullets if bullet._active]

        # Apply velocity
        if self._velocity.x != 0.0:
            self._animTimer += dt
            if self._animTimer >= 0.225:
                self._animFrame = 1 - self._animFrame
                self._animTimer = 0.0

            # Friction
            if self._velocity.x > 0:
                self._velocity.x -= 3.0
            elif self._velocity.x < 0:
                self._velocity.x += 3.0

            # Full stop
            if self._velocity.x > -1.0 and self._velocity.x < 1.0:
                self._velocity.x = 0.0
                self._animFrame = 0
                self._animTimer = 0.0

        # Apply gravity
        if not self._onGround:
            self._velocity.y += SDL_STANDARD_GRAVITY

        self._position.x += self._velocity.x * dt
        self._position.y += self._velocity.y * dt

        if self._velocity.x > 0.0:
            self._flipped = False
        elif self._velocity.x < 0.0:
            self._flipped = True

        if not self._onGround:
            self._animFrame = 1
        elif self._velocity.x == 0:
            self._animFrame = 0

        if Control.Fire:
            self._supersizeTimer += dt
            if self._supersizeTimer >= 3.0:
                self._supersized = True

            if self._bulletTime == 0.0:
                if len(self._playerBullets) < 5:
                    self._game._sound.playSoundFromMemory(
                        self._game.assets.fireFx, 64)

                    newBullet = PlayerBullet(self._game, flipped=self._flipped)
                    if self._flipped:
                        newBullet.position.x = self._position.x - 16
                        newBullet.velocity.x = -300.0
                    else:
                        newBullet.position.x = self._position.x + 30
                        newBullet.velocity.x = 300.0

                    if self._supersized:
                        newBullet.position.y = self._position.y + 4
                        newBullet.supersize()
                        self._supersized = False
                        self._supersizeTimer = 0.0
                    else:
                        newBullet.position.y = self._position.y + 12

                    self._playerBullets.append(newBullet)

            self._bulletTime += dt
            if self._bulletTime > 0.2:
                self._bulletTime = 0.0

        else:
            self._supersized = False
            self._supersizeTimer = 0.0
            self._bulletTime = 0.0

        if Control.Left and self._velocity.x > -100.0:
            self._velocity.x -= 15.0

        if Control.Right and self._velocity.x < 100.0:
            self._velocity.x += 15.0

        if self._position.y > 280.0:
            self._position.y = 280.0
            self._onGround = True
            self._velocity.y = 0.0

        if Control.Up and self._onGround:
            self._velocity.y = -200.0
            self._onGround = False

        for bullet in [bullet for bullet in self._playerBullets if bullet._active]:
            bullet.update(dt)

    def hit(self, mob: Mob):
        return Sprite.AABB(self.hitbox, mob.hitbox)

    def bulletHit(self, mob: Mob):
        mhb = mob.hitbox
        for bullet in [bullet for bullet in self._playerBullets if bullet._active]:
            if Sprite.AABB(mhb, bullet.hitbox):
                if not bullet._supersized:
                    bullet._active = False

                return True
        return False
    
    def draw(self, renderer:SDL_Renderer, delta:float):
        super().draw(renderer, delta)
        for bullet in [bullet for bullet in self._playerBullets if bullet._active]:
            bullet.draw(renderer, delta)


class PlayerBullet(Sprite):
    def __init__(self, game: RabbitGame, flipped=False):
        super().__init__(game.assets.playerBullet, 16, 16)
        self._flipped = flipped
        self._active = True
        self._supersized = False

    def supersize(self):
        self._supersized = True
        self._size = Vector2f(self._size.x * 2, self._size.y * 2)
        self._hitbox = SDL_Rect(0, int(self._size.y/4),
                                int(self._size.x), int(self._size.y/2))

    def update(self, dt):
        self._position.x += self._velocity.x * dt
        self._position.y += self._velocity.y * dt
        if self._position.x < -16.0 or self._position.x > 640.0:
            self._active = False
