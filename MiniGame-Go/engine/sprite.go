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
	r := &sdl.Rect{
		X: int32(math.Round(s.Position.X)),
		Y: int32(math.Round(s.Position.Y)),
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

	// renderer.SetDrawColor(0, 255, 0, 255)
	// renderer.DrawRect(r)

	renderer.CopyEx(s.Frame, nil, r, 0.0, nil, flip)

	if s.Alpha < 255 {
		s.Frame.SetAlphaMod(255)
	}
}

func (s *Sprite) Debug(renderer *sdl.Renderer) {
	renderer.SetDrawColor(255, 0, 0, 255)
	renderer.DrawRect(s.GetHitbox())
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
