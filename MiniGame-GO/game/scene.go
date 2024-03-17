package game

import "github.com/veandco/go-sdl2/sdl"

type IScene interface {
	Update(dt float64)
	Draw(renderer *sdl.Renderer, delta float64)
	Enter()
	Leave()
}

type Scene struct {
	Proxy IScene
}

func (s *Scene) Update(dt float64)                          { s.Proxy.Update(dt) }
func (s *Scene) Draw(renderer *sdl.Renderer, delta float64) { s.Proxy.Draw(renderer, delta) }
func (s *Scene) Enter()                                     { s.Proxy.Enter() }
func (s *Scene) Leace()                                     { s.Proxy.Leave() }
