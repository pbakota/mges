package game

import (
	"github.com/pbakota/mges/engine"
	"github.com/veandco/go-sdl2/sdl"
)

type PlayerBullet struct {
	engine.Sprite
	Active     bool
	Supersized bool
}

func NewPlayerBullet(game *RabbitGame) *PlayerBullet {
	return &PlayerBullet{
		Sprite:     *engine.NewSprite(game.Assets.PlayerBullet, 16, 16),
		Active:     true,
		Supersized: false,
	}
}

func (b *PlayerBullet) Supersize() {
	b.Supersized = true
	b.Size = engine.Vector2i{X: b.Size.X * 2, Y: b.Size.Y * 2}
	b.Hitbox = sdl.Rect{X: 0, Y: b.Size.Y / 4, W: b.Size.X, H: b.Size.Y / 2}
}

func (b *PlayerBullet) Update(dt float64) {
	b.Position.X += b.Velocity.X * dt
	b.Position.Y += b.Velocity.Y * dt
}
