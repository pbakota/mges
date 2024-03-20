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

type IMob interface {
	GetMob() *Mob
}

type Mob struct {
	engine.AnimatedSprite
	Active bool
	HP     int32
	Speed  float64
	Point  int32
}

func (m *Mob) GetMob() *Mob {
	return m
}

func NewMob(frames []*sdl.Texture, flipped bool, hp int32, speed float64, point int32) Mob {
	p := Mob{
		AnimatedSprite: *engine.NewAnimatedSprite(frames, 32, 32),
		Active:         true,
		HP:             hp,
		Speed:          speed,
		Point:          point,
	}

	p.Flipped = flipped
	p.Velocity.Y = 0
	if p.Flipped {
		p.Position.X = 640.0
		p.Velocity.X = -speed
	} else {
		p.Position.X = -32.0
		p.Velocity.X = speed
	}

	return p
}

func (m *Mob) Update(dt float64) {
	if m.Flipped {
		if m.Velocity.X > 0.0 {
			m.Velocity.X -= 1.0
			if m.Velocity.X < 1.0 {
				m.Velocity.X = -m.Speed
			}
		}
	} else {
		if m.Velocity.X < 0 {
			m.Velocity.X += 1.0
			if m.Velocity.X >= 0.0 {
				m.Velocity.X = m.Speed
			}
		}
	}
	m.Position.X += m.Velocity.X * dt
	m.AnimTimer += dt
	if m.AnimTimer > 0.25 {
		m.AnimTimer = 0.0
		m.AnimFrame = 1 - m.AnimFrame
	}
	if m.Position.X < -32.0 || m.Position.X > 640.0 {
		m.Active = false
	}
}

func (m *Mob) HitByBullet(player *Hero) bool {
	m.HP--
	if m.HP <= 0 {
		return true
	}
	if player.Flipped {
		m.Velocity.X = -m.Speed * 1.2
	} else {
		m.Velocity.X = m.Speed * 1.2
	}

	return false
}

type MobBee struct {
	Mob
}

func NewMobBee(game *RabbitGame, flipped bool) *MobBee {
	const (
		MobBee_HP    = 2
		MobBee_Speed = 40
		MobBee_Point = 20
	)
	p := &MobBee{NewMob(game.Assets.BeeFrames, flipped, MobBee_HP, MobBee_Speed, MobBee_Point)}

	p.Position.Y = 280.0 - 32 + engine.Rnd.Float64()*32.0
	return p
}

type MobBlue struct {
	Mob
}

func NewMobBlue(game *RabbitGame, flipped bool) *MobBlue {
	const (
		MobBlue_HP    = 3
		MobBlue_Speed = 60
		MobBlue_Point = 50
	)
	p := &MobBlue{NewMob(game.Assets.BlueFrames, flipped, MobBlue_HP, MobBlue_Speed, MobBlue_Point)}
	p.Position.Y = 280.0 - 32 + engine.Rnd.Float64()*32.0
	return p
}

type MobFoxy struct {
	Mob
}

func NewMobFoxy(game *RabbitGame, flipped bool) *MobFoxy {
	const (
		MobFoxy_HP    = 2
		MobFoxy_Speed = 50
		MobFoxy_Point = 100
	)
	p := &MobFoxy{NewMob(game.Assets.FoxyFrames, flipped, MobFoxy_HP, MobFoxy_Speed, MobFoxy_Point)}
	p.Position.Y = 280.0
	p.Hitbox.X = p.Size.X/4 - 8
	p.Hitbox.Y = p.Size.Y / 4
	p.Hitbox.H -= p.Hitbox.Y
	return p
}

type MobSniky struct {
	Mob
}

func NewMobSniky(game *RabbitGame, flipped bool) *MobSniky {
	const (
		MobSniky_HP    = 2
		MobSniky_Speed = 50
		MobSniky_Point = 100
	)
	p := &MobSniky{NewMob(game.Assets.SnikyFrames, flipped, MobSniky_HP, MobSniky_Speed, MobSniky_Point)}
	p.Position.Y = 280.0
	p.Hitbox.Y = p.Hitbox.H / 2
	p.Hitbox.H = p.Hitbox.H - p.Hitbox.Y
	return p
}
