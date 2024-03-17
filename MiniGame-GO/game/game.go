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

type RabbitGame struct {
	*engine.Game
	*Assets

	TitleScene *TitleScene
	// gameplayScene *GameplayScene
	ActiveScene *Scene
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

	g := &RabbitGame{
		Game: engine.NewGame(w, h, title, 0),
	}

	g.TitleScene = NewTitleScene(g)
	g.ActiveScene = &g.TitleScene.Scene
	g.Proxy = g
	return g
}

func (g *RabbitGame) Init(renderer *sdl.Renderer) {
	g.Assets = NewAssets(renderer, g.AssetLoader)

	// Start background music
	g.Sound.PlayAudio(g.Assets.Music, true)
}

func (g *RabbitGame) Free() {
	g.Assets.Free(g.AssetLoader)
}

func (g *RabbitGame) Update(dt float64) {
	g.ActiveScene.Update(dt)
}

func (g *RabbitGame) Draw(renderer *sdl.Renderer, delta float64) {
	g.ActiveScene.Draw(renderer, delta)
}
