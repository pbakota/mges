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

import "github.com/veandco/go-sdl2/sdl"

type Loader struct {
	Sound *Sound
}

func NewLoader(s *Sound) *Loader {
	return &Loader{
		Sound: s,
	}
}

func (a *Loader) LoadBitmap(renderer *sdl.Renderer, path string) *sdl.Texture {
	surface, err := sdl.LoadBMP(path)
	if err != nil {
		panic(err)
	}
	defer surface.Free()

	texture, err := renderer.CreateTextureFromSurface(surface)
	if err != nil {
		panic(err)
	}

	return texture
}

func (a *Loader) FreeBitmap(bitmap *sdl.Texture) {
	bitmap.Destroy()
}

func (a *Loader) LoadFont(path string) *sdl.Surface {
	surface, err := sdl.LoadBMP(path)
	if err != nil {
		panic(err)
	}

	return surface
}

func (a *Loader) LoadAudio(path string) *Audio {
	return a.Sound.CreateAudio(path)
}

func (a *Loader) FreeAudio(audio *Audio) {
	a.Sound.FreeAudio(audio)
}
