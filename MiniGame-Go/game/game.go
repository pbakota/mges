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
	"os"

	"github.com/pbakota/mges/engine"
	"github.com/veandco/go-sdl2/sdl"
)

var (
	BlackColor   = &sdl.Color{R: 0, G: 0, B: 0, A: 255}
	WhiteColor   = &sdl.Color{R: 255, G: 255, B: 255, A: 255}
	DkGrayColor  = &sdl.Color{R: 64, G: 64, B: 64, A: 255}
	DkGray2Color = &sdl.Color{R: 12, G: 17, B: 34, A: 255}
)

const (
	GAME_SCENE_TITLE  = 0
	GAME_SCENE_ACTION = 1
)

type RabbitGame struct {
	engine.Game
	*Assets

	TitleScene   *TitleScene
	ActionScene  *ActionScene
	CurrentScene IScene
	NewScene     IScene

	HISCORE_FILEPATH string
}

func setAssetsFolder() {
	// Set assets base folder
	pwd, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	cwd = pwd + "/assets/"
}

func NewRabbitGame(w, h int32, title string) *RabbitGame {

	setAssetsFolder()

	g := &RabbitGame{}
	dir, err := os.UserHomeDir()
	if err == nil {
		g.HISCORE_FILEPATH = dir + "/rabbit-unleashed-hiscore.txt"
	} else {
		g.HISCORE_FILEPATH = ""
	}

	g.Width = w
	g.Height = h
	g.WindowTitle = title
	g.WindowFlags = 0

	g.Proxy = g
	return g
}

func (g *RabbitGame) Init(renderer *sdl.Renderer) {
	g.Assets = NewAssets(renderer, g.AssetLoader)

	g.TitleScene = NewTitleScene(g)
	g.ActionScene = NewActionScene(g)
	g.CurrentScene = g.TitleScene
	g.NewScene = g.TitleScene

	// Start background music
	g.Sound.PlayAudio(g.Assets.Music, true)
}

func (g *RabbitGame) Free() {
	g.Assets.Free(g.AssetLoader)
}

func (g *RabbitGame) Update(dt float64) {

	if g.NewScene != nil && g.CurrentScene != g.NewScene {
		g.CurrentScene.Leave()
		g.CurrentScene = g.NewScene
		g.CurrentScene.Enter()
		g.NewScene = nil
	}

	g.CurrentScene.Update(dt)
}

func (g *RabbitGame) Draw(renderer *sdl.Renderer, delta float64) {
	g.CurrentScene.Draw(renderer, delta)
}

func (g *RabbitGame) ChangeScene(scene int) {
	switch scene {
	case GAME_SCENE_TITLE:
		g.NewScene = g.TitleScene
	case GAME_SCENE_ACTION:
		g.NewScene = g.ActionScene
	}
}
