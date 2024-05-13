from engine import AssetLoader, Audio
from sdl2 import * # type: ignore


class Assets:
    def __init__(self, renderer, sound):
        self._renderer = renderer
        self._sound = sound

        self.playerFrames = [self.loadFrame("hero1.bmp"), self.loadFrame("hero2.bmp")]
        self.beeFrames = [self.loadFrame("bee1a.bmp"), self.loadFrame("bee2a.bmp")]
        self.blueFrames = [self.loadFrame("blue1a.bmp"), self.loadFrame("blue2a.bmp")]
        self.foxyFrames = [self.loadFrame("roka1.bmp"), self.loadFrame("roka2.bmp")]
        self.snikyFrames = [self.loadFrame("sniky1.bmp"), self.loadFrame("sniky2.bmp")]
        self.heroBFrames = [self.loadFrame("hero1b.bmp"), self.loadFrame("hero2b.bmp")]

        self.music = self.loadSound("world_1.wav")

        self.ground = self.loadFrame("tile_0004.bmp")
        self.title = AssetLoader.loadBitmap(renderer, "Bitmaps/title.bmp")
        self.forest = AssetLoader.loadBitmap(renderer, "Bitmaps/background.bmp")

    def __del__(self):
        SDL_DestroyTexture(self.ground)
        SDL_DestroyTexture(self.playerFrames[0])
        SDL_DestroyTexture(self.playerFrames[1])

        SDL_DestroyTexture(self.beeFrames[0])
        SDL_DestroyTexture(self.beeFrames[1])
        SDL_DestroyTexture(self.blueFrames[0])
        SDL_DestroyTexture(self.blueFrames[1])
        SDL_DestroyTexture(self.foxyFrames[0])
        SDL_DestroyTexture(self.foxyFrames[1])
        SDL_DestroyTexture(self.snikyFrames[0])
        SDL_DestroyTexture(self.snikyFrames[1])
        SDL_DestroyTexture(self.heroBFrames[0])
        SDL_DestroyTexture(self.heroBFrames[1])

        SDL_DestroyTexture(self.title)
        SDL_DestroyTexture(self.forest)

        self._sound.freeAudio(self.music)
        self._sound.endAudio()

    def loadFrame(self, fileName) -> SDL_Texture:
        return AssetLoader.loadBitmap(self._renderer, f"Tiles/{fileName}")

    def loadSound(self, fileName) -> Audio:
        return AssetLoader.loadSoundFx(self._sound, f"Sounds/{fileName}")

