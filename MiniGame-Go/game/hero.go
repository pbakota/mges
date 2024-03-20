// Copyright 2023 Peter Bakota
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package game

import (
	"github.com/pbakota/mges/engine"
	"github.com/veandco/go-sdl2/sdl"
)

type Hero struct {
	engine.AnimatedSprite
	g *RabbitGame

	PlayerBullets  []*PlayerBullet
	OnGround       bool
	BulletTimer    float64
	SupersizeTimer float64
	Supersized     bool
}

func NewHero(game *RabbitGame) *Hero {
	p := &Hero{g: game,
		AnimatedSprite: *engine.NewAnimatedSprite(game.Assets.PlayerFrames, 32, 32),
	}
	p.Hitbox = sdl.Rect{X: p.Size.X / 4, Y: p.Size.Y / 4, W: p.Size.X / 2, H: p.Size.Y / 2}
	p.Reset()
	return p
}

func (h *Hero) Reset() {
	h.OnGround = false
	h.BulletTimer = 0
	h.SupersizeTimer = 0
	h.Supersized = false
	h.Velocity.X = 0
	h.Velocity.Y = 0
	h.Position.X = 300.0
	h.Position.Y = 200.0
	h.OldPosition = nil
}

func (h *Hero) Update(dt float64) {
	h.removeInactiveBullets()

	if h.Velocity.X != 0.0 {
		h.AnimTimer += dt
		if h.AnimTimer >= 0.225 {
			h.AnimFrame = 1 - h.AnimFrame
			h.AnimTimer = 0
		}

		if h.Velocity.X > 0 {
			h.Velocity.X -= 3.0
		} else if h.Velocity.X < 0 {
			h.Velocity.X += 3.0
		}

		if h.Velocity.X > -1.0 && h.Velocity.X < 1.0 {
			h.Velocity.X = 0.0
			h.AnimFrame = 0
			h.AnimTimer = 0
		}
	}

	// gravity
	if !h.OnGround {
		h.Velocity.Y += sdl.STANDARD_GRAVITY
	}

	h.Position.X += h.Velocity.X * dt
	h.Position.Y += h.Velocity.Y * dt

	if h.Velocity.X > 0 {
		h.Flipped = false
	}
	if h.Velocity.X < 0 {
		h.Flipped = true
	}

	if !h.OnGround {
		h.AnimFrame = 1
	} else if h.Velocity.X == 0 {
		h.AnimFrame = 0
	}

	if h.g.Control.Fire {
		h.SupersizeTimer += dt
		if h.SupersizeTimer >= 3.0 {
			h.Supersized = true
		}

		if h.BulletTimer == 0.0 {
			// Limit the number of bullets
			if len(h.PlayerBullets) < 5 {
				h.g.Sound.PlayAudioVolume(h.g.Assets.FireFx, false, 64)
				newBullet := NewPlayerBullet(h.g)
				if h.Flipped {
					newBullet.Position.X = h.Position.X - 16
					newBullet.Velocity.X = -300.0
				} else {
					newBullet.Position.X = h.Position.X + 30
					newBullet.Velocity.X = 300.0
				}
				if h.Supersized {
					newBullet.Position.Y = h.Position.Y + 4
				} else {
					newBullet.Position.Y = h.Position.Y + 12
				}
				newBullet.Flipped = h.Flipped

				if h.Supersized {
					newBullet.Supersize()
					h.Supersized = false
					h.SupersizeTimer = 0
				}

				h.PlayerBullets = append(h.PlayerBullets, newBullet)
			}
		}
		h.BulletTimer += dt
		if h.BulletTimer > 0.2 {
			h.BulletTimer = 0
		}
	} else {
		h.Supersized = false
		h.SupersizeTimer = 0
		h.BulletTimer = 0
	}

	if h.g.Control.Left && h.Velocity.X > -100.0 {
		h.Velocity.X -= 15.0
	}
	if h.g.Control.Right && h.Velocity.X < 100.0 {
		h.Velocity.X += 15.0
	}

	if h.Position.Y > 280 {
		h.Position.Y = 280.0
		h.OnGround = true
		h.Velocity.Y = 0
	}

	if h.g.Control.Up {
		if h.OnGround {
			h.Velocity.Y = -200.0
			h.OnGround = false
		}
	}

	for b := 0; b < len(h.PlayerBullets); b++ {
		var bullet = h.PlayerBullets[b]
		if bullet.Position.X < -16.0 || bullet.Position.X > 640.0 {
			bullet.Active = false
		} else {
			bullet.Update(dt)
		}
	}
}

func (h *Hero) removeInactiveBullets() {
	for b := len(h.PlayerBullets) - 1; b >= 0; b-- {
		bullet := h.PlayerBullets[b]
		if !bullet.Active {
			h.PlayerBullets = append(h.PlayerBullets[:b], h.PlayerBullets[b+1:]...)
		}
	}
}

func (h *Hero) DrawActiveBullets(renderer *sdl.Renderer, delta float64) {
	for b := 0; b < len(h.PlayerBullets); b++ {
		bullet := h.PlayerBullets[b]
		if bullet.Active {
			bullet.Draw(renderer, delta)
		}
	}
}

func (h *Hero) CheckHitBy(m *Mob) bool {
	return engine.AABB(h.GetHitbox(), m.GetHitbox())
}

func (h *Hero) CheckBulletHit(m *Mob) bool {
	var hitbox = m.GetHitbox()
	for b := 0; b < len(h.PlayerBullets); b++ {
		bullet := h.PlayerBullets[b]
		if engine.AABB(hitbox, bullet.GetHitbox()) {
			if !bullet.Supersized {
				bullet.Active = false
			}
			return true
		}
	}
	return false
}

func (h *Hero) Draw(renderer *sdl.Renderer, delta float64) {
	h.AnimatedSprite.Draw(renderer, delta)
	h.DrawActiveBullets(renderer, delta)
}
