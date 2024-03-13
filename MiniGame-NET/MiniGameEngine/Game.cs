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

using MiniGameEngine.Utils;
using static SDL2.SDL;

namespace MiniGameEngine;

abstract public class Game
{
    private readonly int _w;
    public int Width { get => _w; }
    private readonly int _h;
    public int Height { get => _h; }
    private readonly string _windowTitle;
    private readonly SDL_WindowFlags _windowFlags;
    private IntPtr _window;
    private IntPtr _renderer;
    public IntPtr GameRenderer { get => _renderer; }
    protected readonly Random _rand = new();
    public Game(int w, int h, string title = "MiniGame", SDL_WindowFlags windowFlags = 0)
    {
        _w = w;
        _h = h;
        _windowTitle = title;
        _windowFlags = windowFlags;
    }
    protected virtual void Init(IntPtr renderer) { }
    protected virtual void Free() { }
    protected virtual void Update(double dt) { }
    protected virtual void Draw(IntPtr renderer, double interpAlpha) { }
    public void Run()
    {
        var perfrequency = SDL_GetPerformanceFrequency();

        /* Enable standard application logging */
        SDL_LogSetPriority((int)SDL_LogCategory.SDL_LOG_CATEGORY_APPLICATION, SDL_LogPriority.SDL_LOG_PRIORITY_VERBOSE);

        SDLUtil.CheckSDLErr(() => SDL_Init(SDL_INIT_VIDEO | SDL_INIT_AUDIO));

        _window = SDL_CreateWindow(_windowTitle, SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, _w, _h, _windowFlags);
        _renderer = SDL_CreateRenderer(_window, -1, SDL_RendererFlags.SDL_RENDERER_ACCELERATED| SDL_RendererFlags.SDL_RENDERER_PRESENTVSYNC);

        Init(_renderer);

        var quit = false;
        var fullscreen = false;
        var lastTime = SDL_GetPerformanceCounter();
        var targetRate = 1.0f / 60.0f;
        var deltaTimeAccumlator = 0.0f;

        do
        {
            while (SDL_PollEvent(out var evt) != 0)
            {
                switch (evt.type)
                {
                    case SDL_EventType.SDL_QUIT:
                        quit = true;
                        break;
                    case SDL_EventType.SDL_KEYDOWN:
                        switch (evt.key.keysym.sym)
                        {
                            case SDL_Keycode.SDLK_F11:
                                {
                                    fullscreen = !fullscreen;
                                    SDLUtil.CheckSDLErr(() => SDL_SetWindowFullscreen(_window, fullscreen ? (uint)SDL_WindowFlags.SDL_WINDOW_FULLSCREEN_DESKTOP : 0));
                                    var _ = SDL_ShowCursor(!fullscreen ? 1 : 0);
                                }
                                break;
                            case SDL_Keycode.SDLK_F12:
                                quit = true;
                                break;
                            default:
                                Control.HandleEvent(evt);
                                break;
                        }
                        break;
                    case SDL_EventType.SDL_KEYUP:
                        Control.HandleEvent(evt);
                        break;
                }
            }

            var now = SDL_GetPerformanceCounter();
            var deltaTime = (float)(now-lastTime)/perfrequency;
            lastTime = now;

            deltaTimeAccumlator += deltaTime;
            while(deltaTimeAccumlator > targetRate) {
                Update(deltaTime);
                deltaTimeAccumlator -= targetRate;
            }

            GC.Collect();

            SDL_SetWindowTitle(_window, $"{_windowTitle} - dt={deltaTime:N6}, fps={(int)(1.0f / deltaTime)}");

            SDLUtil.CheckSDLErr(() => SDL_SetRenderDrawColor(_renderer, 0, 0, 0, 255));
            SDLUtil.CheckSDLErr(() => SDL_RenderClear(_renderer));

            Draw(_renderer, deltaTimeAccumlator/targetRate);

            SDLUtil.CheckSDLErr(() => SDL_RenderSetLogicalSize(_renderer, _w, _h));

            SDL_RenderPresent(_renderer);

        } while (!quit);

        Free();

        SDL_DestroyRenderer(_renderer);
        SDL_DestroyWindow(_window);
        SDL_Quit();
    }
}
