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

class Healthbar : Sprite
{
    private const int MAXHEIGHT = 96;
    private const int MAXENERGY = 100;
    private int _health;
    public int Health { get => _health; }

    public Healthbar(GameAssets assets) : base(assets.Healthbar, 8, MAXHEIGHT)
    {
        Position.x = 10.0f;
        Position.y = 30.0f;
        _health = MAXENERGY;
    }

    public void Reset()
    {
        _health = MAXENERGY;
    }

    public void DecHealth(int amount = 1)
    {
        if (_health == 0) return;
        _health -= amount;
    }

    public void IncHealth(int amount = 1)
    {
        _health += amount;
        if (_health > MAXENERGY)
            _health = MAXENERGY;
    }

    public override void Draw(IntPtr renderer, double alpha)
    {
        var p = _health / (float)MAXENERGY * (double)MAXHEIGHT;
        var src = new SDL.SDL_Rect { x = 0, y = 0, w = 8, h = (int)p };
        var dst = new SDL.SDL_Rect { x = (int)Position.x, y = (int)Position.y, w = 8, h = (int)p };

        SDLUtil.CheckSDLErr(() => SDL.SDL_RenderCopyEx(renderer, _frame, ref src, ref dst, 0.0f, IntPtr.Zero, SDL.SDL_RendererFlip.SDL_FLIP_NONE));
    }
}