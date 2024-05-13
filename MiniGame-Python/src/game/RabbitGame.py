from engine import Game, Sound, Text
from .TitleScene import TitleScene
from .GameplayScene import GameplayScene
from .Assets import Assets
from .Scene import GameScene
from game import Scene

__all__ = ['RabbitGame', 'GameScene']


class RabbitGame(Game):
    def __init__(self):
        super().__init__(640, 480, title="Rabbit unleashed")
        self._currentScene: Scene | None = None

    def init(self, renderer):
        # Init text rendering
        Text.init()
        
        self._sound = Sound.initAudio()
        self.assets = Assets(renderer, self._sound)
        self._currentScene = TitleScene(self)
        self._sound.playMusicFromMemory(self.assets.music)  # type: ignore

    def free(self):
        del self.assets

    def changeScene(self, scene):
        newScene = None
        if scene == GameScene.TITLE:
            newScene = TitleScene(self)
        elif scene == GameScene.GAMEPLAY:
            newScene = GameplayScene(self)

        if self._currentScene == newScene:
            return

        self._currentScene.leave()  # type: ignore
        self._currentScene = newScene
        self._currentScene.enter()  # type: ignore

    def update(self, dt):
        if self._currentScene != None:
            self._currentScene.update(dt)

    def draw(self, renderer, delta):
        if self._currentScene != None:
            self._currentScene.draw(renderer, delta)
