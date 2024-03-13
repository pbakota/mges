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

abstract class Mob : AnimatedSprite
{
    protected static Random _rand = new();
    private bool _active = true;
    public bool Active { get => _active; set => _active = value; }
    private int _hp;
    private readonly double _speed;
    protected int _point;
    public int Point { get => _point; }

    public Mob(IntPtr[] frames, bool flipped, int hp, double speed) : base(frames, 32,32)
    {
        _flipped = flipped;
        _speed = speed;

        _hp = hp;
        Position.x = _flipped ? 640.0f : -32.0f;
        Velocity = new Vector2f(_flipped ? -_speed : _speed, 0.0f);
    }

    public override void Update(double dt)
    {
        if (_flipped)
        {
            if (Velocity.x > 0)
            {
                Velocity.x -= 1.0f;
                if (Velocity.x < 1.0f)
                {
                    Velocity.x = -_speed;
                }
            }
        } else {
            if (Velocity.x < 0)
            {
                Velocity.x += 1.0f;
                if (Velocity.x >= 0.0f)
                {
                    Velocity.x = _speed;
                }
            }
        }

        Position.x += Velocity.x * dt;

        _animTimer += dt;
        if(_animTimer > 0.25) {
            _animTimer = 0.0f;
            _animFrame = 1 - _animFrame;
        }

        if(Position.x < -32.0f || Position.x > 640.0f) {
            _active = false;
        }
    }

    public bool GotHit(Player player) {
        if(_hp -- <= 0) return true;

        Velocity.x = player.Flipped ? -_speed*1.2f : _speed*1.2f;

        return false;
    }
}


class MobBee : Mob
{
    private const int HP = 2;
    private const double SPEED = 40;
    private const int POINT = 20;

    public MobBee(GameAssets assets, bool flipped) : base(assets.BeeFrames, flipped, HP, SPEED)
    {
        Position.y = 280.0f - 32 + _rand.NextDouble() * 32.0f;
        _point = POINT;
    }
}


class MobBlue : Mob
{
    private const int HP = 3;
    private const double SPEED = 60.0f;
    private const int POINT = 50;
    public MobBlue(GameAssets assets, bool flipped) : base(assets.BlueFrames, flipped, HP, SPEED)
    {
        Position.y = 280.0f - 32 + _rand.NextDouble() * 32.0f;
        _point = POINT;
    }
}


class MobFoxy : Mob
{
    private const int HP = 2;
    private const double SPEED = 50.0f;
    private const int POINT = 100;
    public MobFoxy(GameAssets assets, bool flipped) : base(assets.FoxyFrames, flipped, HP, SPEED)
    {
        Position.y = 280.0f;
        _hitbox.y = _hitbox.h / 4;
        _hitbox.h = _hitbox.h - _hitbox.y;

        _point = POINT;
    }
}

class MobSniky : Mob
{
    private const int HP = 5;
    private const double SPEED = 10;
    private const int POINT = 200;

    public MobSniky(GameAssets assets, bool flipped) : base(assets.SnikyFrames, flipped, HP, SPEED)
    {
        Position.y = 280.0f;
        _hitbox.y = _hitbox.h / 2;
        _hitbox.h = _hitbox.h - _hitbox.y;

        _point = POINT;
    }
}