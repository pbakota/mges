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

func (c *Control) Reset() {
	c.Left = false
	c.Right = false
	c.Up = false
	c.Down = false
	c.Fire = false
	c.Exit = false
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
