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

type Powerup struct {
	engine.Sprite
	Active    bool
	Point     int32
	WaitTimer float64
}

func NewPowerup(frame *sdl.Texture, point int32) *Powerup {
	p := &Powerup{
		Sprite: *engine.NewSprite(frame, 32, 32),
		Active: false,
		Point:  point,
	}
	p.Hitbox = sdl.Rect{X: 0, Y: 10, W: p.Size.X, H: p.Size.Y - 10}
	return p
}

func (p *Powerup) Reset(x float64) {
	p.Position.X = x
	p.Position.Y = 100
	p.Velocity.X = 0
	p.Velocity.Y = 50
	p.WaitTimer = 0.0
	p.Alpha = 255
	p.Active = true
	p.OldPosition = nil
}

func (p *Powerup) HitBy(player *Hero) bool {
	if engine.AABB(p.GetHitbox(), player.GetHitbox()) {
		p.Active = false
		return true
	}

	return false
}

func (p *Powerup) Update(dt float64) {
	if p.Position.Y < 280 {
		p.Velocity.Y += sdl.STANDARD_GRAVITY
		p.Position.Y += dt * p.Velocity.Y
	} else {
		p.Position.Y = 280
		p.WaitTimer += dt
		if p.WaitTimer > 3.0 {
			if p.Alpha < 10 {
				p.Alpha = 0
				p.Active = false
			} else {
				p.Alpha -= 5
			}
		}
	}
}

type Bomb struct {
	Powerup
}

func NewBomb(game *RabbitGame) *Bomb {
	const Bomb_Point = 500
	return &Bomb{
		Powerup: *NewPowerup(game.Assets.Bomb, Bomb_Point),
	}
}

type Medkit struct {
	Powerup
}

func NewMedkit(game *RabbitGame) *Medkit {
	const Medkit_Point = 500
	return &Medkit{
		Powerup: *NewPowerup(game.Assets.Medkit, Medkit_Point),
	}
}
