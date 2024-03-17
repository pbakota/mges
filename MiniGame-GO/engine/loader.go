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
