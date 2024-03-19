package engine

import (
	"math"

	"github.com/veandco/go-sdl2/sdl"
)

type Position struct {
	Vector2f
}

type Velocity struct {
	Vector2f
}

type Sprite struct {
	Position
	Velocity
	OldPosition *Vector2f
	Size        Vector2i
	Flipped     bool
	Frame       *sdl.Texture
	Alpha       uint8
	Hitbox      sdl.Rect
}

type AnimatedSprite struct {
	Sprite
	AnimTimer float64
	AnimFrame int32
	Frames    []*sdl.Texture
}

func NewSprite(frame *sdl.Texture, w, h int32) *Sprite {
	p := &Sprite{
		Frame: frame,
		Size:  Vector2i{X: w, Y: h},
		Alpha: 255,
	}

	p.Hitbox.X = 0
	p.Hitbox.Y = 0
	p.Hitbox.W = p.Size.X
	p.Hitbox.H = p.Size.Y

	return p
}

func (s *Sprite) Update(dt float64) {}

func (s *Sprite) Draw(renderer *sdl.Renderer, delta float64) {
	var x, y float64
	if s.OldPosition != nil {
		x = s.OldPosition.X*delta + s.Position.X*(1.0-delta)
		y = s.OldPosition.Y*delta + s.Position.Y*(1.0-delta)
	} else {
		s.OldPosition = &Vector2f{X: s.Position.X, Y: s.Position.Y}
		x = s.Position.X
		y = s.Position.Y
	}
	r := &sdl.Rect{
		X: int32(math.Round(x)),
		Y: int32(math.Round(y)),
		W: s.Size.X,
		H: s.Size.Y,
	}
	flip := sdl.FLIP_NONE
	if s.Flipped {
		flip = sdl.FLIP_HORIZONTAL
	}

	if s.Alpha < 255 {
		s.Frame.SetAlphaMod(s.Alpha)
	}

	renderer.CopyEx(s.Frame, nil, r, 0.0, nil, flip)

	if s.Alpha < 255 {
		s.Frame.SetAlphaMod(255)
	}
}

func (s *Sprite) GetHitbox() *sdl.Rect {
	return &sdl.Rect{
		X: s.Hitbox.X + int32(s.Position.X),
		Y: s.Hitbox.Y + int32(s.Position.Y),
		W: s.Hitbox.W,
		H: s.Hitbox.H,
	}
}

func NewAnimatedSprite(frames []*sdl.Texture, w, h int32) *AnimatedSprite {
	return &AnimatedSprite{
		Sprite:    *NewSprite(frames[0], w, h),
		Frames:    frames,
		AnimTimer: 0,
		AnimFrame: 0,
	}
}

func (s *AnimatedSprite) Draw(renderer *sdl.Renderer, delta float64) {
	s.Frame = s.Frames[s.AnimFrame]
	s.Sprite.Draw(renderer, delta)
}

func AABB(rect1, rect2 *sdl.Rect) bool {
	return rect1.HasIntersection(rect2)
}
