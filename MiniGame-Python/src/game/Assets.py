from engine import AssetLoader, Audio
from sdl2 import * # type: ignore

__all__ = ['Assets']

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

        self.elements = AssetLoader.loadBitmap(renderer, "Bitmaps/elements.bmp")
        self.title = AssetLoader.loadBitmap(renderer, "Bitmaps/title.bmp")
        self.forest = AssetLoader.loadBitmap(renderer, "Bitmaps/background.bmp")

        self.playerBullet = self.loadFrame("bullet.bmp")
        self.ground = self.loadFrame("tile_0004.bmp")

        self.bloodGround = self.loadFrame("blood_tile.bmp")
        self.bloodParticle = self.loadFrame("blood.bmp")

        self.explosion = self.loadFrame("explosion-4.bmp")
        self.healthbar = self.loadFrame("healthbar.bmp")

        self.medKit = self.loadFrame("medkit.bmp")
        self.bomb = self.loadFrame("bombball.bmp")
        self.tickFx = self.loadSound("tick.wav")
        self.explosionFx = self.loadSound("explosion.wav")
        self.pickupFx = self.loadSound("pickup.wav")
        self.mobHitFx = self.loadSound("hit.wav")
        self.fireFx = self.loadSound("fire.wav")
        self.explosionLongFx = self.loadSound("explosion_long.wav")


    def __del__(self):
        SDL_DestroyTexture(self.elements)
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

        SDL_DestroyTexture(self.playerBullet)
        SDL_DestroyTexture(self.ground)
        SDL_DestroyTexture(self.bloodGround)
        SDL_DestroyTexture(self.bloodParticle)
        SDL_DestroyTexture(self.explosion)
        SDL_DestroyTexture(self.healthbar)
        SDL_DestroyTexture(self.medKit)
        SDL_DestroyTexture(self.bomb)

        self._sound.freeAudio(self.tickFx)
        self._sound.freeAudio(self.explosionFx)
        self._sound.freeAudio(self.pickupFx)
        self._sound.freeAudio(self.mobHitFx)
        self._sound.freeAudio(self.fireFx)
        self._sound.freeAudio(self.explosionLongFx)

        self._sound.freeAudio(self.music)
        self._sound.endAudio()

    def loadFrame(self, fileName) -> SDL_Texture:
        return AssetLoader.loadBitmap(self._renderer, f"Tiles/{fileName}")

    def loadSound(self, fileName) -> Audio:
        return AssetLoader.loadSoundFx(self._sound, f"Sounds/{fileName}")

