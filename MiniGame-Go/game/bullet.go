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
