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
	"fmt"

	"github.com/pbakota/mges/engine"
	"github.com/veandco/go-sdl2/sdl"
)

type TitleScene struct {
	IScene
	g *RabbitGame

	bee    *MobBee
	blue   *MobBlue
	sniky  *MobSniky
	foxy   *MobFoxy
	medkit *Medkit
	bomb   *Bomb
	heroB  *HeroB
}

func NewTitleScene(game *RabbitGame) *TitleScene {
	p := &TitleScene{
		g: game,
	}

	p.bee = NewMobBee(game, false)
	p.bee.Position.X = 80.0
	p.bee.Position.Y = 140.0
	p.bee.Velocity.X = 0
	p.bee.Velocity.Y = 0

	p.blue = NewMobBlue(game, false)
	p.blue.Position.X = 80.0
	p.blue.Position.Y = 180.0
	p.blue.Velocity.X = 0
	p.blue.Velocity.Y = 0

	p.sniky = NewMobSniky(game, false)
	p.sniky.Position.X = 80.0
	p.sniky.Position.Y = 220.0
	p.sniky.Velocity.X = 0
	p.sniky.Velocity.Y = 0

	p.foxy = NewMobFoxy(game, false)
	p.foxy.Position.X = 80.0
	p.foxy.Position.Y = 260.0
	p.foxy.Velocity.X = 0
	p.foxy.Velocity.Y = 0

	p.bomb = NewBomb(game)
	p.bomb.Position.X = 80.0
	p.bomb.Position.Y = 300.0
	p.bomb.Velocity.X = 0
	p.bomb.Velocity.Y = 0

	p.medkit = NewMedkit(game)
	p.medkit.Position.X = 80.0
	p.medkit.Position.Y = 340.0
	p.medkit.Velocity.X = 0
	p.medkit.Velocity.Y = 0

	p.heroB = NewHeroB(game)
	p.heroB.Position.X = 40.0
	p.heroB.Position.Y = 40.0

	return p
}

func (s *TitleScene) Update(dt float64) {
	if s.g.Control.Fire {
		s.g.ChangeScene(GAME_SCENE_ACTION)
		return
	}
	s.bee.Update(dt)
	s.blue.Update(dt)
	s.sniky.Update(dt)
	s.foxy.Update(dt)
	s.heroB.Update(dt)
}

func (s *TitleScene) Draw(renderer *sdl.Renderer, delta float64) {
	renderer.SetDrawColor(DkGray2Color.R, DkGray2Color.G, DkGray2Color.B, DkGray2Color.A)
	renderer.FillRect(nil)
	r := &sdl.Rect{
		X: 0,
		Y: 16,
		W: s.g.Width,
		H: 312,
	}

	// static background
	renderer.Copy(s.g.Assets.Forest, nil, r)
	// title
	renderer.Copy(s.g.Assets.Title, nil, nil)

	// mobs
	s.bee.Draw(renderer, delta)
	s.g.Text.DrawText(renderer, 120, 150, WhiteColor, BlackColor, fmt.Sprintf("BEE .......... %3d points", s.bee.Point))

	s.blue.Draw(renderer, delta)
	s.g.Text.DrawText(renderer, 120, 190, WhiteColor, BlackColor, fmt.Sprintf("BLUE ......... %3d points", s.blue.Point))

	s.sniky.Draw(renderer, delta)
	s.g.Text.DrawText(renderer, 120, 230, WhiteColor, BlackColor, fmt.Sprintf("SNIKY ........ %3d points", s.sniky.Point))

	s.foxy.Draw(renderer, delta)
	s.g.Text.DrawText(renderer, 120, 270, WhiteColor, BlackColor, fmt.Sprintf("FOXY ......... %3d points", s.foxy.Point))

	s.bomb.Draw(renderer, delta)
	s.g.Text.DrawText(renderer, 120, 310, WhiteColor, BlackColor, fmt.Sprintf("BOMB ......... %3d points", s.bomb.Point))

	s.medkit.Draw(renderer, delta)
	s.g.Text.DrawText(renderer, 120, 350, WhiteColor, BlackColor, fmt.Sprintf("MEDKIT........ %3d points", s.medkit.Point))

	s.heroB.Draw(renderer, delta)

	// texts
	s.g.Text.DrawText(renderer, 140, 420, WhiteColor, DkGrayColor, "PRESS \"FIRE\" TO START")
	s.g.Text.DrawTextEx(renderer, 135, 480-18, DkGrayColor, BlackColor, "PRESS \"F12\" TO QUIT OR \"F11\" FOR FULLSCREEN",
		engine.NewTextDrawOptions(engine.WithSize(0.5)))
}

func (s *TitleScene) Enter() {

}

func (s *TitleScene) Leave() {

}

// HeroB
type HeroB struct {
	engine.AnimatedSprite
}

func NewHeroB(game *RabbitGame) *HeroB {
	return &HeroB{
		AnimatedSprite: *engine.NewAnimatedSprite(game.HeroBFrames, 64, 64),
	}
}

func (h *HeroB) Update(dt float64) {
	h.AnimTimer += dt
	if h.AnimTimer > 0.3 {
		h.AnimTimer = 0
		h.AnimFrame = 1 - h.AnimFrame
	}
}
