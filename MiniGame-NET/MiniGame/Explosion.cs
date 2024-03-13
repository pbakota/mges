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

using MiniGameEngine;
using MiniGameEngine.Utils;
using SDL2;

class Explosion : AnimatedSprite
{
    private bool _active;
    public bool Active { get => _active; set => _active = value; }

    public Explosion(IntPtr[] frames) : base(frames, 32, 32)
    {
        _animFrame = 0;
        _animTimer = 0.0f;
        _active = true;
    }

    public override void Update(double dt)
    {
        if(!_active) return;

        _animTimer += dt;
        if(_animTimer > 0.05f) {
            _animTimer -= 0.05f;
            if(++_animFrame == 12) {
                _active = false;
            }
        }
    }

    public override void Draw(IntPtr renderer, double alpha)
    {
        var src = new SDL.SDL_Rect { x = _animFrame*16, y = 0, w = 16, h = 16 };
        var dst = new SDL.SDL_Rect { x = (int)Position.x, y = (int)Position.y, w = Size.x, h = Size.y };

        SDLUtil.CheckSDLErr(() => SDL.SDL_RenderCopyEx(renderer, _frames[0], ref src, ref dst, 0.0f, default, SDL.SDL_RendererFlip.SDL_FLIP_NONE));
    }
}