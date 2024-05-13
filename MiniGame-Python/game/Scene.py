from enum import Enum

__all__ = ['Scene', 'GameScene']


class GameScene(Enum):
    TITLE = 0,
    GAMEPLAY = 1


class Scene:

    def __init__(self, game):
        self._game = game

    # Virtual methods
    def enter(self): pass
    def leave(self): pass

    # Abstract methods
    def update(self, dt): raise NotImplementedError()
    def draw(self, renderer, delta): raise NotImplementedError()
