__all__ = ['Vector2f', 'lerp']

class Vector2f:
    def __init__(self, x=0.0,y=0.0):
        self.x = x
        self.y = y

def lerp(a,b,delta)->float:
    return a*delta+b*(1.0-delta)


