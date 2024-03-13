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

using SDL2;

namespace MiniGameEngine
{
    public static class Control
    {
        public static bool Left { get; private set; }
        public static bool Right { get; private set; }
        public static bool Up { get; private set; }
        public static bool Down { get; private set; }
        public static bool Fire { get; private set; }
        public static bool Exit { get; private set; }

        public static void Reset()
        {
            Left = false;
            Right = false;
            Up = false;
            Down = false;
            Fire = false;
            Exit = false;
        }

        public static void HandleEvent(SDL.SDL_Event evt)
        {
            switch (evt.type)
            {
                case SDL.SDL_EventType.SDL_KEYDOWN:
                    if (evt.key.keysym.sym == SDL.SDL_Keycode.SDLK_LEFT)
                        Left = true;
                    else if (evt.key.keysym.sym == SDL.SDL_Keycode.SDLK_RIGHT)
                        Right = true;
                    else if (evt.key.keysym.sym == SDL.SDL_Keycode.SDLK_UP)
                        Up = true;
                    else if (evt.key.keysym.sym == SDL.SDL_Keycode.SDLK_DOWN)
                        Down = true;
                    else if (evt.key.keysym.sym == SDL.SDL_Keycode.SDLK_z)
                        Fire = true;
                    else if (evt.key.keysym.sym == SDL.SDL_Keycode.SDLK_ESCAPE)
                        Exit = true;
                    break;
                case SDL.SDL_EventType.SDL_KEYUP:
                    if (evt.key.keysym.sym == SDL.SDL_Keycode.SDLK_LEFT)
                        Left = false;
                    else if (evt.key.keysym.sym == SDL.SDL_Keycode.SDLK_RIGHT)
                        Right = false;
                    else if (evt.key.keysym.sym == SDL.SDL_Keycode.SDLK_UP)
                        Up = false;
                    else if (evt.key.keysym.sym == SDL.SDL_Keycode.SDLK_DOWN)
                        Down = false;
                    else if (evt.key.keysym.sym == SDL.SDL_Keycode.SDLK_z)
                        Fire = false;
                    else if (evt.key.keysym.sym == SDL.SDL_Keycode.SDLK_ESCAPE)
                        Exit = false;
                    break;
            }
        }
    }
}
