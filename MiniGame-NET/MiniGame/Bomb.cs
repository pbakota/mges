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

class Bomb : Sprite
{
    public readonly int Point =  500;
    private bool _active;
    public bool Active { get => _active; }
    private double _waitTimer;
    public Bomb(GameAssets assets) : base(assets.Bomb, 32, 32)
    {
        _hitbox = SDLUtil.Rect(0, 10, Size.x, Size.y-10);
    }
    public bool Hit(Player player) {
        if(HitBox.AABB(player.HitBox)) {
            _active = false;
            return true;
        }

        return false;
    }
    public void Update(double dt) {
        Velocity.y += SDL.SDL_STANDARD_GRAVITY;
        Position.y += dt * Velocity.y;

        if(Position.y > 280) {
            Position.y = 280;

            if(_alpha < 10) {
                _alpha = 0;
            } else {
                _alpha -= 10;
            }

            _waitTimer += dt;
            if(_waitTimer>0.8f)
                _active = false;
        }
    }
    public void Reset(double x)
    {
        Position.x = x;
        Position.y = 100.0f;
        Velocity.x = 0.0f;
        Velocity.y = 50.0f;
        _waitTimer = 0.0f;
        _alpha = 255;
        _active = true;
        OldPosition = null;
    }
}