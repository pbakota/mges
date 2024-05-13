from xmlrpc.client import Boolean
from sdl2 import * # type: ignore
from sdl2.rect import SDL_Rect # type: ignore
from .Utils import Vector2f, lerp

__all__ = ['Sprite', 'AnimatedSprite']

class Sprite:
    def __init__(self, frame, w, h):
        self._frame = frame

        self._position = Vector2f()
        self._velocity = Vector2f()
        self._oldPosition = None
        self._size = Vector2f(x=w, y=h)
        self._flipped = False
        self._hitbox = SDL_Rect(0,0,int(self._size.x), int(self._size.y))
        self._alpha = 255


    @property
    def position(self) -> Vector2f:
        return self._position
    
    @position.setter
    def position(self, val):
        self._position = val

    @property
    def velocity(self) -> Vector2f:
        return self._velocity

    @velocity.setter
    def velocity(self, val):
        self._velocity = val

    @property
    def flipped(self):
        return self._flipper

    @flipped.setter
    def flipped(self, val):
        self._flipper = val

    @property
    def hitbox(self) -> SDL_Rect:
        return SDL_Rect(
                int(self._position.x + self._hitbox.x),
                int(self._position.y + self._hitbox.y),
                self._hitbox.x,
                self._hitbox.y
        )

    def draw(self, renderer, delta):
        x = 0
        y = 0
        if self._oldPosition != None:
            x = round(lerp(self._oldPosition.x, self._position.x, delta))
            y = round(lerp(self._oldPosition.y, self._position.y, delta))
        else:
            self._oldPosition = self._position
            x = round(self._position.x)
            y = round(self._position.y)

        d = SDL_Rect(x,y,int(self._size.x),int(self._size.y))
        
        if self._flipped:
            flip = SDL_FLIP_HORIZONTAL
        else:
            flip = SDL_FLIP_NONE
    
        if self._alpha < 255:
            SDL_SetTextureAlphaMod(self._frame, self._alpha)

        SDL_RenderCopyEx(renderer, self._frame, None, d, 0.0, None, flip)

        if self._alpha < 255:
            SDL_SetTextureAlphaMod(self._frame, 255)

    # Abstract method
    def update(self, dt):raise NotImplementedError()

    def debug(self, renderer):
        SDL_SetRenderDrawColor(renderer, 255, 0, 0, 255)
        SDL_RenderDrawRect(renderer, self.hitbox)

    @staticmethod
    def AABB(rect1,rect2)->Boolean:
        return SDL_HasIntersection(rect1,rect2)

class AnimatedSprite(Sprite):
    def __init__(self,frames,w,h):
        super().__init__(frames[0],w,h)
        self._frames = frames
        self._animFrame = 0
        self._animTimer = 0

    def draw(self, renderer, delta):
        self._frame = self._frames[self._animFrame]
        super().draw(renderer, delta)

