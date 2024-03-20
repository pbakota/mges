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

type Healthbar struct {
	engine.Sprite
	Health int
}

const (
	MAXHEIGHT = 96
	MAXENERGY = 100
)

func NewHealthbar(game *RabbitGame) *Healthbar {
	p := &Healthbar{Sprite: *engine.NewSprite(game.Assets.Healthbar, 8, MAXHEIGHT)}
	p.Position.X = 10.0
	p.Position.Y = 30.0
	p.Health = MAXENERGY

	return p
}

func (h *Healthbar) Reset() {
	h.Health = MAXENERGY
}

func (h *Healthbar) Dec(amount int) {
	if h.Health == 0 {
		return
	}

	h.Health -= amount
}

func (h *Healthbar) Inc(amount int) {
	h.Health += amount
	if h.Health > MAXENERGY {
		h.Health = MAXENERGY
	}
}

func (h *Healthbar) Draw(renderer *sdl.Renderer, delta float64) {
	p := float64(h.Health) / float64(MAXENERGY) * float64(MAXHEIGHT)
	src := sdl.Rect{X: 0, Y: 0, W: 8, H: int32(p)}
	dst := sdl.Rect{X: int32(h.Position.X), Y: int32(h.Position.Y), W: 8, H: int32(p)}

	renderer.Copy(h.Frame, &src, &dst)
}
