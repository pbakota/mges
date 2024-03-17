package game

import (
	"github.com/pbakota/mges/engine"
	"github.com/veandco/go-sdl2/sdl"
)

type TitleScene struct {
	Scene
	g *RabbitGame
}

func NewTitleScene(game *RabbitGame) *TitleScene {
	p := &TitleScene{
		g: game,
	}

	p.Scene.Proxy = p
	return p
}

func (s *TitleScene) Update(dt float64) {

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

	s.g.Text.DrawText(renderer, 140, 420, WhiteColor, DkGrayColor, "PRESS \"FIRE\" TO START")
	s.g.Text.DrawTextEx(renderer, 135, 480-18, DkGrayColor, BlackColor, "PRESS \"F12\" TO QUIT OR \"F11\" FOR FULLSCREEN", &engine.TextDrawOptions{Size: 0.5})
}

func (s *TitleScene) Enter() {

}

func (s *TitleScene) Leave() {

}
