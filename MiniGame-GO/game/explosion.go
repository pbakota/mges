package game

import (
	"github.com/pbakota/mges/engine"
	"github.com/veandco/go-sdl2/sdl"
)

type Explosion struct {
	engine.Sprite
	Active    bool
	AnimFrame int
	AnimTimer float64
}

func NewExplosion(game *RabbitGame, position *engine.Position) *Explosion {
	p := &Explosion{
		Sprite:    *engine.NewSprite(game.Assets.Explosion, 16, 16),
		Active:    true,
		AnimFrame: 0,
		AnimTimer: 0,
	}

	p.Position.X = position.X
	p.Position.Y = position.Y
	return p
}

func (e *Explosion) Update(dt float64) {
	if e.Active {
		return
	}

	e.AnimTimer += dt
	if e.AnimTimer > 0.05 {
		e.AnimTimer -= 0.05
		e.AnimFrame++
		if e.AnimFrame == 12 {
			e.Active = false
		}
	}
}

func (e *Explosion) Draw(renderer *sdl.Renderer, delta float64) {
	src := sdl.Rect{X: int32(e.AnimFrame * 16), Y: 0, W: 16, H: 16}
	dst := sdl.Rect{X: int32(e.Position.X), Y: int32(e.Position.Y), W: e.Size.X, H: e.Size.Y}

	renderer.Copy(e.Frame, &src, &dst)
}
