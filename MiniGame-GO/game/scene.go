package game

import "github.com/veandco/go-sdl2/sdl"

type IScene interface {
	Update(dt float64)
	Draw(renderer *sdl.Renderer, delta float64)
	Enter()
	Leave()
}
