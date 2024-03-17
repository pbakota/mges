package engine

import (
	"strings"

	"github.com/veandco/go-sdl2/sdl"
)

const (
	FONT_SIZE         = 16
	FONT_COUNT        = 74
	COLOR_INDEX       = 31
	SHADOW_INDEX      = 25
	TRANSPARENT_INDEX = 0
)

type Text struct {
	fontData []byte
}

type TextDrawOptions struct {
	Size  float64
	Angle float64
	Vflip bool
	Hflip bool
}

func NewText(loader *Loader) *Text {
	p := &Text{}

	font := loader.LoadFont("assets/Fonts/font.bmp")
	defer font.Free()

	if font.MustLock() {
		font.Lock()
	}

	p.fontData = make([]byte, FONT_SIZE*FONT_SIZE*FONT_COUNT)
	pixels := font.Pixels()

	offset := 0
	for c := 0; c < FONT_COUNT; c++ {
		for y := 0; y < FONT_SIZE; y++ {
			for x := 0; x < FONT_SIZE; x++ {
				p.fontData[offset] = pixels[FONT_SIZE*c+y*int(font.Pitch)+x]
				offset++
			}
		}
	}

	if font.MustLock() {
		font.Unlock()
	}
	return p
}

func (t *Text) drawToCharBuffer(pixels []byte, col int, pitch int32, color uint32, shadow uint32, chr byte) {
	offset := FONT_SIZE * FONT_SIZE * int(chr-0x21)
	for y := 0; y < FONT_SIZE; y++ {
		for x := 0; x < FONT_SIZE; x++ {
			switch t.fontData[offset] {
			case COLOR_INDEX:
				pixels[col+y*int(pitch)+x*4+0] = (byte)(color >> 24 & 0xff)
				pixels[col+y*int(pitch)+x*4+1] = (byte)(color >> 16 & 0xff)
				pixels[col+y*int(pitch)+x*4+2] = (byte)(color >> 8 & 0xff)
				pixels[col+y*int(pitch)+x*4+3] = (byte)(color & 0xff)
			case SHADOW_INDEX:
				pixels[col+y*int(pitch)+x*4+0] = (byte)(shadow >> 24 & 0xff)
				pixels[col+y*int(pitch)+x*4+1] = (byte)(shadow >> 16 & 0xff)
				pixels[col+y*int(pitch)+x*4+2] = (byte)(shadow >> 8 & 0xff)
				pixels[col+y*int(pitch)+x*4+3] = (byte)(shadow & 0xff)
			case TRANSPARENT_INDEX:
				// Do nothing here
			}
			offset++
		}
	}
}

func (t *Text) drawChar(surface *sdl.Surface, x int, color uint32, shadow uint32, chr byte) {
	t.drawToCharBuffer(surface.Pixels(), x*FONT_SIZE*4, surface.Pitch, color, shadow, chr)
}

func (t *Text) drawText(surface *sdl.Surface, text string, color uint32, shadow uint32) {
	if surface.MustLock() {
		surface.Lock()
	}

	x := 0
	text = strings.ToUpper(text)
	for c := 0; c < len(text); c++ {
		b := text[c]
		if b == 0x20 {
			x++
		} else {
			t.drawChar(surface, x, color, shadow, b)
			x++
		}
	}

	if surface.MustLock() {
		surface.Unlock()
	}
}

func (t *Text) DrawText(renderer *sdl.Renderer, x, y int32, color *sdl.Color, shadow *sdl.Color, text string) {
	t.DrawTextEx(renderer, x, y, color, shadow, text, &TextDrawOptions{
		Size:  1.0,
		Angle: 0.0,
		Vflip: false,
		Hflip: false,
	})
}

func (t *Text) DrawTextEx(renderer *sdl.Renderer, x, y int32, color *sdl.Color, shadow *sdl.Color, text string, options *TextDrawOptions) {
	surface, err := sdl.CreateRGBSurface(0, int32(len(text)*FONT_SIZE), FONT_SIZE, 32, 0xff000000, 0x00ff0000, 0x0000ff00, 0x000000ff)
	if err != nil {
		panic(err)
	}
	defer surface.Free()

	t.drawText(surface, text, color.Uint32(), shadow.Uint32())
	texture, err := renderer.CreateTextureFromSurface(surface)
	if err != nil {
		panic(err)
	}
	defer texture.Destroy()

	dst := &sdl.Rect{
		X: x,
		Y: y,
		W: (int32)(float64(len(text)) * FONT_SIZE * options.Size),
		H: (int32)(FONT_SIZE * options.Size),
	}

	flip := sdl.FLIP_NONE
	if options.Vflip {
		flip |= sdl.FLIP_VERTICAL
	}
	if options.Hflip {
		flip |= sdl.FLIP_HORIZONTAL
	}

	renderer.CopyEx(texture, nil, dst, options.Angle, nil, flip)
}
