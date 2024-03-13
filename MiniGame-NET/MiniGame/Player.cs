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

class Player : AnimatedSprite
{
    private bool _onGround;

    private readonly List<PlayerBullet> _playerBullets = new();
    private readonly GameAssets _assets;
    private double _bulletTime = 0.0f;
    private double _superSizeTimer = 0.0f;
    private bool _supersize = false;

    public Player(GameAssets assets) : base(assets.PlayerFrames, 32, 32)
    {
        _assets = assets;
        Position = new Vector2f(300.0f, 200.0f);
        _hitbox.x = Size.x / 4;
        _hitbox.y = Size.y / 4;
        _hitbox.w = Size.x / 2;
        _hitbox.h = Size.y / 2;
    }
    public void Reset()
    {
        _playerBullets.Clear();
        Position.x = 300.0f;
        Position.y = 200.0f;
        Velocity.x = 0.0f;
        Velocity.y = 0.0f;
        _bulletTime = 0.0f;
        _superSizeTimer = 0.0f;
        _supersize = false;
        _onGround = false;
        OldPosition = null;
    }

    public override void Update(double dt)
    {
        _playerBullets.RemoveAll(x => !x.Active);

        if (Velocity.x != 0.0f)
        {
            _animTimer += dt;
            if (_animTimer >= 0.225f)
            {
                _animFrame = 1 - _animFrame;
                _animTimer = 0.0f;
            }

            if (Velocity.x > 0) Velocity.x -= 3.0f;
            else if (Velocity.x < 0) Velocity.x += 3.0f;

            if (Velocity.x > -1.0f && Velocity.x < 1.0f)
            {
                Velocity.x = 0.0f;
                _animFrame = 0;
                _animTimer = 0.0f;
            }
        }


        // gravity
        if (!_onGround)
        {
            Velocity.y += SDL.SDL_STANDARD_GRAVITY;
        }

        Position.x += Velocity.x * dt;
        Position.y += Velocity.y * dt;

        if (Velocity.x > 0) _flipped = false;
        if (Velocity.x < 0) _flipped = true;

        if (!_onGround)
        {
            _animFrame = 1;
        }
        else if (Velocity.x == 0)
        {
            _animFrame = 0;
        }

        if (Control.Fire)
        {
            _superSizeTimer += dt;
            if (_superSizeTimer >= 3.0f)
            {
                _supersize = true;
            }

            if (_bulletTime == 0.0f)
            {
                if (_playerBullets.Count < 5)
                {
                    Sound.PlaySoundFromMemory(_assets.FireFx, 64);
                    var newBullet = new PlayerBullet(_assets.PlayerBullet)
                    {
                        Position = new Vector2f(_flipped ? Position.x - 16 : Position.x + 30, _supersize ? Position.y + 4 : (Position.y + 12)),
                        Velocity = new Vector2f(_flipped ? -300.0f : 300.0f, 0.0f),
                        Flipped = _flipped,
                    };

                    if (_supersize)
                    {
                        newBullet.Supersize();
                        _supersize = false;
                        _superSizeTimer = 0.0f;
                    }

                    _playerBullets.Add(newBullet);
                }
            }
            _bulletTime += dt;
            if (_bulletTime > 0.2f)
                _bulletTime = 0.0f;
        }
        else
        {
            _supersize = false;
            _superSizeTimer = 0.0f;
            _bulletTime = 0.0f;
        }

        if (Control.Left && Velocity.x > -100.0f) Velocity.x -= 15.0f;
        if (Control.Right && Velocity.x < 100.0f) Velocity.x += 15.0f;

        if (Position.y > 280)
        {
            Position.y = 280;
            _onGround = true;
            Velocity.y = 0.0f;
        }

        if (Control.Up)
        {
            if (_onGround)
            {
                Velocity.y = -200.0f;
                _onGround = false;
            }
        }

        foreach (var b in _playerBullets)
        {
            if (b.Position.x < -16.0 || b.Position.x > 640.0f) b.Active = false;
            else b.Update(dt);
        }
    }

    public bool Hit(Mob mob) => HitBox.AABB(mob.HitBox);

    public bool BulletHit(Mob m)
    {
        var rect1 = m.HitBox;
        foreach (var b in _playerBullets)
        {
            if (rect1.AABB(b.HitBox))
            {
                if (!b.SuperSized)
                    b.Active = false;

                return true;
            }
        }

        return false;
    }

    public override void Draw(IntPtr renderer, double alpha)
    {
        base.Draw(renderer, alpha);
        foreach (var b in _playerBullets)
            b.Draw(renderer, alpha);
    }
}


class PlayerBullet : Bullet
{
    private bool _active;
    public bool Active { get => _active; set => _active = value; }

    public bool SuperSized { get; set; }

    public PlayerBullet(IntPtr frame) : base(frame, 16, 16)
    {
        _active = true;
    }

    public void Supersize()
    {
        Size = new Vector2i(Size.x * 2, Size.y * 2);
        SuperSized = true;

        _hitbox = new SDL.SDL_Rect { x = 0, y = Size.y / 4, w = Size.x, h = Size.y / 2 };
    }

    public void Update(double dt)
    {
        Position.x += Velocity.x * dt;
        Position.y += Velocity.y * dt;
    }
}
