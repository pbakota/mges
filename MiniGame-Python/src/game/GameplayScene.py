from random import random
from sdl2 import *  # type: ignore
from engine import Control, Sprite, Text, Vector2f
from .HiscoreHelper import readHiscore, writeHiscore
from .Mob import Mob, MobBee, MobBlue, MobSniky, MobFoxy
from .Hero import Hero
from .Powerup import Medkit, Bomb
from .Gameover import Getready, Gameover
from .Scene import Scene, GameScene
from . import Colors

__all__ = ['GameplayScene']


class GameplayScene(Scene):
    def __init__(self, game):
        super().__init__(game)
        self._mobs: list[Mob] = []
        self._explosions: list[Explosion] = []
        self._dirts: list[Dirt] = []
        self._isGameover = False
        self._player = Hero(game)
        self._medkit = Medkit(game)
        self._bomb = Bomb(game)
        self._healthbar = Healthbar(game)
        self._medkitTimer = 0.0
        self._bombTimer = 0.0
        self._gameover = Gameover(game)
        self._getready = Getready(game)
        self._score = 0
        self._hiscore = 0
        self._nextMob = 0.0
        self._nextMobTimer = 0.0
        self._bombExploded = False
        self._bombExplodeTimer = 0.0
        self._bombExplodedAlpha = 255

    def enter(self):
        # Read highscore from file
        newHiscore = readHiscore()
        if newHiscore > 0:
            self._hiscore = newHiscore

        Control.reset()
        self._mobs = []
        self._explosions = []
        self._dirts = []
        self._isGameover = False
        self._score = 0
        self._player.reset()
        self._getready.reset()
        self._nextMob = 0.0
        self._nextMobTimer = 0.0
        self._bombExploded = False
        self._bombExplodeTimer = 0.0
        self._bombExplodedAlpha = 255
        self._medkitTimer = 0.0
        self._bombTimer = 0.0

        self._killed = 0
        self._missed = 0
        self._bombsCollected = 0
        self._medkitCollected = 0
        self._gameover.reset()

    def leave(self):
        # Store highscore
        if self._isGameover:
            writeHiscore(self._hiscore)

    def update(self, dt):
        self._removeInactiveEntities()
        if Control.Exit:
            self._game.changeScene(GameScene.TITLE)
            return

        if self._isGameover:
            self._gameover.update(dt)
            self._score = self._gameover._score
            if self._score > self._hiscore:
                self._hiscore = self._score
        else:
            self._player.update(dt)

        if not self._getready._isReady:
            self._getready.update(dt)

        if not self._medkit._active and not self._isGameover:
            self.medkitSpawn(dt)
        else:
            self.updateMedkit(dt)

        if not self._bomb._active and not self._isGameover:
            self.bombSpawn(dt)

        self.updateBomb(dt)

        if self._getready._isReady and not self._isGameover:
            self.mobSpawn(dt)

        # Update mobs
        self.updateMobs(dt)

        # Update other entities
        for exp in [exp for exp in self._explosions if exp._active]:
            exp.update(dt)

        for dirt in [dirt for dirt in self._dirts if dirt._active]:
            dirt.update(dt)

    def medkitSpawn(self, dt: float):
        self._medkitTimer += dt
        if self._medkitTimer > 20.0:
            self._medkitTimer -= 20.0
            self._medkit.reset(random() * self._game._w - 32)

    def updateMedkit(self, dt: float):
        self._medkit.update(dt)
        if not self._isGameover and self._medkit.hit(self._player):
            self._game._sound.playSoundFromMemory(
                self._game.assets.pickupFx, 255)
            self._score += self._medkit._points
            self._healthbar.inc(20)
            self._medkitCollected += 1

    def bombSpawn(self, dt: float):
        self._bombTimer += dt
        if self._bombTimer > 30.0:
            self._bombTimer -= 30.0
            self._bomb.reset(random() * self._game._w - 32)

    def updateBomb(self, dt: float):
        if self._bombExploded:
            self._bombExplodeTimer += dt
            if self._bombExplodeTimer > 2.0:
                self._bombExploded = False
                self._bombExplodedAlpha = 0

        if self._bomb._active:
            self._bomb.update(dt)
            if not self._isGameover and self._bomb.hit(self._player):
                self._game._sound.playSoundFromMemory(
                    self._game.assets.explosionLongFx, 255)
                self._score += self._bomb._points
                self._bombsCollected += 1

                for mob in [mob for mob in self._mobs if mob._active]:
                    self.mobKilled(mob)

                self._bombExplodeTimer = 0.0
                self._bombExploded = True
                self._bombExplodedAlpha = 10

    def mobSpawn(self, dt: float):
        self._nextMobTimer += dt
        if self._nextMobTimer > self._nextMob:
            self._nextMobTimer = 0.0
            self._nextMob = random() * 0.8
            flipped = True if random() * 2 > 1.0 else False
            mobid = int(random() * 100)

            newMob: Mob
            if mobid < 10:
                newMob = MobSniky(self._game, flipped)
            elif mobid < 40 and mobid >= 10:
                newMob = MobBlue(self._game, flipped)
            elif mobid < 70 and mobid >= 40:
                newMob = MobBee(self._game, flipped)
            else:
                newMob = MobFoxy(self._game, flipped)

            self._mobs.append(newMob)

    def updateMobs(self, dt: float):
        for mob in [mob for mob in self._mobs if mob._active]:
            mob.update(dt)
            if not self._isGameover:
                if not mob._active:
                    self._missed += 1
                else:
                    if self._player.bulletHit(mob):
                        if mob.gotHit(self._player):
                            self.mobKilled(mob)
                        else:
                            self._game._sound.playSoundFromMemory(
                                self._game.assets.mobHitFx, 64)

                    if self._player.hit(mob):
                        self._healthbar.dec(1)
                        if self._healthbar._health == 0:
                            self.gameover()
        pass

    def mobKilled(self, mob: Mob):
        self._killed += 1
        self._game._sound.playSoundFromMemory(
            self._game.assets.explosionFx, 255)

        newExp = Explosion(self._game)
        newExp.position = Vector2f(mob.position.x, mob.position.y)
        self._explosions.append(newExp)

        mob._active = False
        newDirt = Dirt(self._game)
        newDirt.position = Vector2f(mob.position.x, 280.0 + 32.0)
        self._dirts.append(newDirt)

        self._score += mob._points
        if self._score > self._hiscore:
            self._hiscore = self._score

    def gameover(self):
        self._isGameover = True
        self._gameover.set(self._killed, self._missed,
                           self._medkitCollected, self._bombsCollected, self._score)

    def draw(self, renderer, delta):
        self.drawBack(renderer, delta)

        # Get ready
        if not self._getready._isReady:
            self._getready.draw(renderer, delta)

        if self._medkit._active:
            self._medkit.draw(renderer, delta)

        if self._bomb._active:
            self._bomb.draw(renderer, delta)

        if self._isGameover:
            self._gameover.draw(renderer, delta)
        else:
            self._player.draw(renderer, delta)
            # self._player.debug(renderer)

        # Entities
        for mob in [mob for mob in self._mobs if mob._active]:
            mob.draw(renderer, delta)
            # mob.debug(renderer)

        for exp in [exp for exp in self._explosions if exp._active]:
            exp.draw(renderer, delta)

    def drawBack(self, renderer: SDL_Renderer, delta: float):
        # Static background (forest)
        r = SDL_Rect(0, 16, self._game._w, 312)
        SDL_RenderCopy(renderer, self._game.assets.forest, None, r)

        # Platform
        d = SDL_Rect(0, 280+32, 32, 32)
        for i in range(0, int(self._game._w/32)):
            d.x = i * 32
            SDL_RenderCopy(renderer, self._game.assets.ground, None, d)

        # Health
        self._healthbar.draw(renderer, delta)

        # Score
        Text.drawText(renderer, 0, 0, Colors.WhiteColor,
                      Colors.DkGrayColor, f"Score: {self._score:08}")
        Text.drawText(renderer, 356, 0, Colors.WhiteColor,
                      Colors.DkGrayColor, f"HI-Score: {self._hiscore:08}")

        # Dirt
        for dirt in [dirt for dirt in self._dirts if dirt._active]:
            dirt.draw(renderer, delta)

        # Lighting effect
        if self._bombExploded:
            SDL_SetRenderDrawColor(renderer, Colors.WhiteColor.r,
                                   Colors.WhiteColor.g, Colors.WhiteColor.b, self._bombExplodedAlpha)
            SDL_SetRenderDrawBlendMode(renderer, SDL_BLENDMODE_BLEND)
            SDL_RenderFillRect(renderer, r)
            SDL_SetRenderDrawBlendMode(renderer, SDL_BLENDMODE_NONE)

    def _removeInactiveEntities(self):
        self._mobs = [mob for mob in self._mobs if mob._active]
        self._explosions = [exp for exp in self._explosions if exp._active]
        self._dirts = [dirt for dirt in self._dirts if dirt._active]


class Explosion(Sprite):
    def __init__(self, game):
        super().__init__(game.assets.explosion, 32, 32)
        self._animFrame = 0
        self._animTimer = 0.0
        self._active = True

    def update(self, dt: float):
        self._animTimer += dt
        if self._animTimer > 0.05:
            self._animTimer -= 0.05
            if self._animFrame == 12:
                self._active = False
            else:
                self._animFrame += 1

    def draw(self, renderer: SDL_Renderer, delta: float):
        src = SDL_Rect(self._animFrame * 16, 0, 16, 16)
        dst = SDL_Rect(int(self._position.x), int(
            self._position.y), int(self._size.x), int(self._size.y))
        SDL_RenderCopyEx(renderer, self._frame, src,
                         dst, 0.0, None, SDL_FLIP_NONE)


class Dirt(Sprite):
    def __init__(self, game):
        super().__init__(game.assets.bloodGround, 32, 32)
        self._alpha = 255
        self._active = True
        self._alphaTimer = 0.0

    def update(self, dt: float):
        self._alphaTimer += dt
        if self._alphaTimer > 0.2:
            self._alphaTimer = 0.0
            self._alpha -= 1
            if self._alpha < 10:
                self._alpha = 0
                self._active = False


class Healthbar(Sprite):
    MAXHEIGHT = 96
    MAXENERGY = 100

    def __init__(self, game):
        super().__init__(game.assets.healthbar, 8, Healthbar.MAXHEIGHT)
        self._position = Vector2f(10.0, 30.0)
        self._health = Healthbar.MAXENERGY

    def reset(self):
        self._health = Healthbar.MAXENERGY

    def dec(self, amt: int):
        if self._health == 0:
            return
        self._health -= amt
        if self._health < 0:
            self._health = 0

    def inc(self, amt: int):
        self._health += amt
        if self._health > Healthbar.MAXENERGY:
            self._health = Healthbar.MAXENERGY

    def draw(self, renderer: SDL_Renderer, delta: float):
        p = int(self._health/Healthbar.MAXENERGY * Healthbar.MAXHEIGHT)
        src = SDL_Rect(0, 0, 8, p)
        dst = SDL_Rect(int(self._position.x), int(self._position.y), 8, p)
        SDL_RenderCopyEx(renderer, self._frame, src,
                         dst, 0.0, None, SDL_FLIP_NONE)
