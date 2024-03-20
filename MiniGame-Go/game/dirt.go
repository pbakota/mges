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
)

type Dirt struct {
	engine.Sprite

	AlphaTimer float64
	Active     bool
}

func NewDirt(game *RabbitGame, position *engine.Vector2f) *Dirt {
	p := &Dirt{
		Sprite:     *engine.NewSprite(game.BloodGround, 32, 32),
		AlphaTimer: 0,
		Active:     true,
	}

	p.Position.X = position.X
	p.Position.Y = position.Y
	p.Alpha = 255
	return p
}

func (d *Dirt) Update(dt float64) {
	d.AlphaTimer += dt
	if d.AlphaTimer > 0.2 {
		d.AlphaTimer = 0.0
		d.Alpha--
		if d.Alpha < 10 {
			d.Alpha = 0
			d.Active = false
		}
	}
}
