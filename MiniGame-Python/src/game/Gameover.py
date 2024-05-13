from sdl2 import *  # type: ignore
from enum import Enum
from engine import Control, Text, DrawTextOptions
from . import Colors
from .Scene import GameScene

__all__ = ['Gameover', 'Getready']


class ScoreCounts(Enum):
    ADD_KILLS = 0
    ADD_MISSES = 1
    ADD_MEDIKITS = 2
    ADD_BOMBS = 3
    PRESS_FIRE = 4


class Bonus(Enum):
    KILLS_BONUS = 2
    MISSED_BONUS = 0
    BOMBS_BONUS = 50
    MEDKIT_BONUS = 100


class Gameover:
    def __init__(self, game):
        self._game = game
        self._gameoverTimer = 0.0
        self._killed = 0
        self._missed = 0
        self._medkitCollected = 0
        self._bombsCollected = 0
        self._score = 0
        self._currentScoreCount: ScoreCounts = ScoreCounts.ADD_KILLS
        self._pressFireTimer = float('inf')
        self._countTimer = 0.0

    def reset(self):
        self._countTimer = 0.0
        self._gameoverTimer = 0.0
        self._killed = 0
        self._missed = 0
        self._medkitCollected = 0
        self._bombsCollected = 0
        self._score = 0
        self._currentScoreCount: ScoreCounts = ScoreCounts.ADD_KILLS
        self._pressFireTimer = float('inf')

    def set(self, killed, missed, medkitCollected, bombsCollected, score):
        self._killed = killed
        self._missed = missed
        self._medkitCollected = medkitCollected
        self._bombsCollected = bombsCollected
        self._score = score

    def update(self, dt: float):
        self._gameoverTimer += dt
        if self._gameoverTimer > 3.0:
            self._countTimer += dt
            if self._countTimer > 0.02:
                self._countTimer -= 0.02
                if self._currentScoreCount == ScoreCounts.ADD_KILLS:
                    if self._killed > 10:
                        self._game._sound.playSoundFromMemory(
                            self._game.assets.tickFx, 64)
                        self._score += Bonus.KILLS_BONUS.value * 10
                        self._killed -= 10
                    elif self._killed > 0:
                        self._game._sound.playSoundFromMemory(
                            self._game.assets.tickFx, 64)
                        self._score += Bonus.KILLS_BONUS.value
                        self._killed -= 1
                    else:
                        self._currentScoreCount = ScoreCounts.ADD_MISSES
                elif self._currentScoreCount == ScoreCounts.ADD_MISSES:
                    if self._missed > 10:
                        self._game._sound.playSoundFromMemory(
                            self._game.assets.tickFx, 64)
                        self._score -= Bonus.MISSED_BONUS.value * 10
                        self._missed -= 10
                    elif self._missed > 0:
                        self._game._sound.playSoundFromMemory(
                            self._game.assets.tickFx, 64)
                        self._score -= Bonus.MISSED_BONUS.value
                        self._missed -= 1
                    else:
                        self._currentScoreCount = ScoreCounts.ADD_BOMBS
                elif self._currentScoreCount == ScoreCounts.ADD_BOMBS:
                    if self._bombsCollected > 10:
                        self._game._sound.playSoundFromMemory(
                            self._game.assets.tickFx, 64)
                        self._score += Bonus.BOMBS_BONUS.value * 10
                        self._bombsCollected -= 10
                    elif self._bombsCollected > 0:
                        self._game._sound.playSoundFromMemory(
                            self._game.assets.tickFx, 64)
                        self._score += Bonus.BOMBS_BONUS.value
                        self._bombsCollected -= 1
                    else:
                        self._currentScoreCount = ScoreCounts.ADD_MEDIKITS
                elif self._currentScoreCount == ScoreCounts.ADD_MEDIKITS:
                    if self._medkitCollected > 10:
                        self._game._sound.playSoundFromMemory(
                            self._game.assets.tickFx, 64)
                        self._score += Bonus.MEDKIT_BONUS.value * 10
                        self._medkitCollected -= 10
                    elif self._medkitCollected > 0:
                        self._game._sound.playSoundFromMemory(
                            self._game.assets.tickFx, 64)
                        self._score += Bonus.MEDKIT_BONUS.value
                        self._medkitCollected -= 1
                    else:
                        self._currentScoreCount = ScoreCounts.PRESS_FIRE
                        self._pressFireTimer = self._gameoverTimer + 1

        if self._currentScoreCount == ScoreCounts.PRESS_FIRE:
            if self._gameoverTimer > self._pressFireTimer and Control.Fire:
                self._game.changeScene(GameScene.TITLE)

    def draw(self, renderer: SDL_Renderer, delta: float):
        src = SDL_Rect(0, 0, 160, 16)
        dst = SDL_Rect(160, 50, 160 * 2, 16 * 2)
        SDL_SetTextureAlphaMod(self._game.assets.elements, 255)
        SDL_RenderCopy(renderer, self._game.assets.elements, src, dst)

        Text.drawText(renderer, 170, 100, Colors.WhiteColor,
                      Colors.DkGrayColor, f"Killed: {self._killed:04}")
        Text.drawText(renderer, 400, 104, Colors.WhiteColor, Colors.DkGrayColor,
                      f"x {Bonus.KILLS_BONUS.value}", DrawTextOptions(size=0.5))

        Text.drawText(renderer, 170, 120, Colors.WhiteColor,
                      Colors.DkGrayColor, f"Missed: {self._missed:04}")
        Text.drawText(renderer, 400, 124, Colors.WhiteColor, Colors.DkGrayColor,
                      f"x {Bonus.MISSED_BONUS.value}", DrawTextOptions(size=0.5))

        Text.drawText(renderer, 170, 140, Colors.WhiteColor,
                      Colors.DkGrayColor, f"Bombs : {self._bombsCollected:04}")
        Text.drawText(renderer, 400, 144, Colors.WhiteColor, Colors.DkGrayColor,
                      f"x {Bonus.MEDKIT_BONUS.value}", DrawTextOptions(size=0.5))

        Text.drawText(renderer, 170, 160, Colors.WhiteColor,
                      Colors.DkGrayColor, f"Medkit: {self._medkitCollected:04}")
        Text.drawText(renderer, 400, 164, Colors.WhiteColor, Colors.DkGrayColor,
                      f"x {Bonus.BOMBS_BONUS.value}", DrawTextOptions(size=0.5))

        Text.drawText(renderer, 140, 200, Colors.WhiteColor,
                      Colors.BlackColor, f"FINAL SCORE: {self._score:08}")

        if self._gameoverTimer > self._pressFireTimer:
            Text.drawText(renderer, 200, 250, Colors.WhiteColor,
                          Colors.BlackColor, "Press \"FIRE\"!")


class Getready:
    def __init__(self, game):
        self._game = game
        self._isReady = False
        self._getreadyTimer = 0.0
        self._alpha = 255
    
    def reset(self):
        self._isReady = False
        self._getreadyTimer = 0.0
        self._alpha = 255

    def update(self, dt: float):
        if self._isReady:
            return

        self._getreadyTimer += dt
        if self._getreadyTimer > 2.0:
            self._alpha -= 10
            if self._alpha < 0:
                self._alpha = 0

        if self._getreadyTimer > 5.0:
            self._isReady = True

    def draw(self, renderer: SDL_Renderer, delta: float):
        if self._isReady:
            return

        src = SDL_Rect(0, 16, 160, 16)
        dst = SDL_Rect(160, 150, 160 * 2, 16 * 2)
        SDL_SetTextureAlphaMod(self._game.assets.elements, self._alpha)
        SDL_RenderCopy(renderer, self._game.assets.elements, src, dst)
