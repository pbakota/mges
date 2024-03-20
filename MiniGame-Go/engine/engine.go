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
	"fmt"
	"math/rand"
	"time"

	"github.com/veandco/go-sdl2/sdl"
)

type Vector2f struct {
	X, Y float64
}

type Vector2i struct {
	X, Y int32
}

type IGame interface {
	Init(renderer *sdl.Renderer)
	Free()
	Update(dt float64)
	Draw(renderer *sdl.Renderer, delta float64)
}

type Game struct {
	Proxy       IGame
	Width       int32
	Height      int32
	WindowTitle string
	WindowFlags int
	Control     *Control
	AssetLoader *Loader
	Sound       *Sound
	Text        *Text
}

func (e *Game) Init(renderer *sdl.Renderer)                { e.Proxy.Init(renderer) }
func (e *Game) Free()                                      { e.Proxy.Free() }
func (e *Game) Update(dt float64)                          { e.Proxy.Update(dt) }
func (e *Game) Draw(renderer *sdl.Renderer, delta float64) { e.Proxy.Draw(renderer, delta) }

func (e *Game) Run() {
	InitRandom()

	perfrequency := sdl.GetPerformanceFrequency()
	sdl.LogSetPriority(sdl.LOG_CATEGORY_APPLICATION, sdl.LOG_PRIORITY_VERBOSE)

	if err := sdl.Init(sdl.INIT_VIDEO | sdl.INIT_AUDIO); err != nil {
		panic(err)
	}
	defer sdl.Quit()

	window, err := sdl.CreateWindow(e.WindowTitle, sdl.WINDOWPOS_CENTERED,
		sdl.WINDOWPOS_CENTERED, e.Width, e.Height, uint32(e.WindowFlags))

	if err != nil {
		panic(err)
	}
	defer window.Destroy()

	renderer, err := sdl.CreateRenderer(window, -1, sdl.RENDERER_ACCELERATED|sdl.RENDERER_PRESENTVSYNC)
	if err != nil {
		panic(err)
	}
	defer renderer.Destroy()

	e.Control = NewControl()
	e.Sound = NewSound()
	e.AssetLoader = NewLoader(e.Sound)
	e.Text = NewText(e.AssetLoader)

	e.Init(renderer)

	quit := false
	fullscreen := false
	lastTime := sdl.GetPerformanceCounter()

	targetRate := 1.0 / 60.0
	deltaAccumlator := 0.0

	for !quit {
		for event := sdl.PollEvent(); event != nil; event = sdl.PollEvent() {
			switch t := event.(type) {
			case *sdl.QuitEvent:
				quit = true
			case *sdl.KeyboardEvent:
				switch t.Type {
				case sdl.KEYDOWN:
					if t.Keysym.Sym == sdl.K_F11 {
						fullscreen = !fullscreen
						if fullscreen {
							window.SetFullscreen(sdl.WINDOW_FULLSCREEN_DESKTOP)
							sdl.ShowCursor(0)
						} else {
							window.SetFullscreen(0)
						}
					} else if t.Keysym.Sym == sdl.K_F12 {
						quit = true
					} else {
						e.Control.HandleEvent(t)
					}
				case sdl.KEYUP:
					e.Control.HandleEvent(t)
				}
			}
		}

		now := sdl.GetPerformanceCounter()
		deltaTime := float64(now-lastTime) / float64(perfrequency)

		lastTime = now
		deltaAccumlator += deltaTime
		for deltaAccumlator > targetRate {
			e.Update(deltaTime)
			deltaAccumlator -= targetRate
		}

		window.SetTitle(fmt.Sprintf("%s - dt=%.6f, fps=%d", e.WindowTitle, deltaTime, int32(1.0/deltaTime)))
		renderer.SetDrawColor(0, 0, 0, 0)
		renderer.Clear()

		e.Draw(renderer, deltaAccumlator/targetRate)
		renderer.SetLogicalSize(e.Width, e.Height)

		renderer.Present()
	}

	e.Free()
}

var Rnd *rand.Rand

func InitRandom() {
	Rnd = rand.New(rand.NewSource(time.Now().UnixNano()))
}
