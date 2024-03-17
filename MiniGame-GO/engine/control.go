package engine

import "github.com/veandco/go-sdl2/sdl"

type Control struct {
	Left  bool
	Right bool
	Up    bool
	Down  bool
	Fire  bool
	Exit  bool
}

func NewControl() *Control {
	return &Control{}
}

func (c *Control) HandleEvent(evt *sdl.KeyboardEvent) {
	switch evt.Type {
	case sdl.KEYDOWN:
		if evt.Keysym.Sym == sdl.K_LEFT {
			c.Left = true
		} else if evt.Keysym.Sym == sdl.K_RIGHT {
			c.Right = true
		} else if evt.Keysym.Sym == sdl.K_UP {
			c.Up = true
		} else if evt.Keysym.Sym == sdl.K_DOWN {
			c.Down = true
		} else if evt.Keysym.Sym == sdl.K_z {
			c.Fire = true
		} else if evt.Keysym.Sym == sdl.K_ESCAPE {
			c.Exit = true
		}
	case sdl.KEYUP:
		if evt.Keysym.Sym == sdl.K_LEFT {
			c.Left = false
		} else if evt.Keysym.Sym == sdl.K_RIGHT {
			c.Right = false
		} else if evt.Keysym.Sym == sdl.K_UP {
			c.Up = false
		} else if evt.Keysym.Sym == sdl.K_DOWN {
			c.Down = false
		} else if evt.Keysym.Sym == sdl.K_z {
			c.Fire = false
		} else if evt.Keysym.Sym == sdl.K_ESCAPE {
			c.Exit = false
		}
	}
}
