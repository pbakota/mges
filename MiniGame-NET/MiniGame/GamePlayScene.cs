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

class GamePlayScene : Scene
{
    private readonly Healthbar _healthbar;
    private readonly Player _player;
    private readonly List<Mob> _mobs = new();
    private readonly List<Explosion> _explosions = new();
    private readonly List<Dirt> _dirts = new();
    private double _nextMob;
    private double _nextMobTimer;
    private int _score = 0;
    private int _hiscore = 10000;
    private readonly GetReady _ready;
    private bool _isGameOver;
    private readonly GameOver _gameOver;
    private readonly Random _rand = new();
    private readonly Bomb _bomb;
    private double _bombTimer = 0.0f;
    private readonly MedKit _medkit;
    private double _medkitTimer = 0.0f;
    private int _killed;
    private int _missed;
    private int _medkitCollected;
    private int _bombsCollected;
    private double _bombExplodeTimer;
    private bool _bombExploded;
    private int _bombExplodeAlpha = 255;

    public GamePlayScene(RabbitGame game) : base(game)
    {
        _player = new Player(_game.Assets);
        _healthbar = new Healthbar(_game.Assets);
        _ready = new GetReady(_game.Assets);
        _medkit = new MedKit(_game.Assets);
        _bomb = new Bomb(_game.Assets);
        _gameOver = new GameOver(_game);
    }

    public override void Enter()
    {
        if (File.Exists(_game.HiscoreFilePath))
            if (int.TryParse(File.ReadAllText(_game.HiscoreFilePath), out var hs))
                _hiscore = hs;

        Control.Reset();

        _score = 0;
        _isGameOver = false;
        _dirts.Clear();
        _explosions.Clear();
        _mobs.Clear();
        _healthbar.Reset();
        _nextMob = 0.0f;
        _nextMobTimer = 0.0f;
        _player.Reset();
        _ready.Reset();
        _bombExploded = false;
        _medkitTimer = 0.0;
        _bombTimer = 0.0;

        _killed = 0;
        _missed = 0;
        _medkitCollected = 0;
        _bombsCollected = 0;
        _gameOver.Reset();
    }

    public override void Leave()
    {
        if (_isGameOver)
            File.WriteAllText(_game.HiscoreFilePath, $"{_hiscore}");
    }

    public override void Update(double dt)
    {
        RemoveInactiveEntities();

        if (Control.Exit)
        {
            _game.ChangeScene(Scenes.TITLE);
            return;
        }

        if (_isGameOver)
        {
            _gameOver.Update(dt);
            _score = _gameOver.Score;
            if (_score > _hiscore)
                _hiscore = _score;
        }
        else
        {
            _player.Update(dt);
        }

        if (!_ready.IsReady)
        {
            _ready.Update(dt);
        }

        if (!_medkit.Active && !_isGameOver)
        {
            MedkitSpawn(dt);
        }
        else
        {
            UpdateMedkit(dt);
        }

        if (!_bomb.Active && !_isGameOver)
        {
            BombSpawn(dt);
        }

        UpdateBomb(dt);

        if (_ready.IsReady && !_isGameOver)
        {
            MobSpawn(dt);
        }

        UpdateMobs(dt);
        UpdateActiveEntities(dt);
    }

    private void MedkitSpawn(double dt)
    {
        _medkitTimer += dt;
        if (_medkitTimer > 20.0f)
        {
            _medkitTimer -= 20.0f;
            _medkit.Reset(_rand.NextDouble() * (_game.Width - 32));
        }
    }
    private void UpdateMedkit(double dt)
    {
        _medkit.Update(dt);
        if (!_isGameOver)
        {
            if (_medkit.Hit(_player))
            {
                Sound.PlaySoundFromMemory(_game.Assets.PickupFx, 255);
                _score += _medkit.Point;
                _healthbar.IncHealth(20);
                ++_medkitCollected;
            }
        }
    }
    private void BombSpawn(double dt)
    {
        _bombTimer += dt;
        if (_bombTimer > 30.0f)
        {
            _bombTimer -= 30.0f;
            _bomb.Reset(_rand.NextDouble() * (_game.Width - 32));
        }
    }
    private void UpdateBomb(double dt)
    {
        if (_bombExploded)
        {
            _bombExplodeTimer += dt;
            if (_bombExplodeTimer > 0.2f)
                _bombExploded = false;
        }

        if (_bomb.Active)
        {
            _bomb.Update(dt);
            if (!_isGameOver)
            {
                if (_bomb.Hit(_player))
                {
                    Sound.PlaySoundFromMemory(_game.Assets.ExplosionLongFx, 255);
                    _score += _bomb.Point;
                    _bombsCollected++;

                    foreach (var m in _mobs.Where(m => m.Active))
                    {
                        MobKilled(m);
                    }
                    _bombExplodeTimer = 0.0f;
                    _bombExploded = true;
                    _bombExplodeAlpha = 10;
                }
            }
        }
    }

    private void UpdateMobs(double dt)
    {
        foreach (var mob in _mobs)
        {
            mob.Update(dt);
            if (!_isGameOver)
            {
                if (!mob.Active) ++_missed;
                if (_player.BulletHit(mob))
                {
                    if (mob.GotHit(_player))
                    {
                        MobKilled(mob);
                    }
                    else
                    {
                        // Just hit
                        Sound.PlaySoundFromMemory(_game.Assets.MobHitFx);
                    }
                }

                if (_player.Hit(mob))
                {
                    _healthbar.DecHealth();
                    if (_healthbar.Health == 0)
                    {
                        GameOver();
                    }
                }
            }
        }
    }

    private void MobKilled(Mob mob)
    {
        ++_killed;
        Sound.PlaySoundFromMemory(_game.Assets.ExplosionFx, 255);
        var newExplosion = new Explosion(new IntPtr[] { _game.Assets.Explosion })
        {
            Position = new Vector2f(mob.Position.x, mob.Position.y)
        };
        _explosions.Add(newExplosion);
        mob.Active = false;
        var newDirt = new Dirt(_game.Assets.BloodGround)
        {
            Position = new Vector2f(mob.Position.x, 280.0f + 32.0f)
        };
        _dirts.Add(newDirt);
        _score += mob.Point;

        if (_score > _hiscore)
            _hiscore = _score;
    }

    private void GameOver()
    {
        _isGameOver = true;
        _gameOver.Set(_killed, _missed, _medkitCollected, _bombsCollected, _score);
        //_gameOver.Set(998, 127, 9, 4, 0);
    }

    private void UpdateActiveEntities(double dt)
    {
        foreach (var e in _explosions.Where(x => x.Active))
        {
            e.Update(dt);
        }

        foreach (var d in _dirts.Where(x => x.Active))
        {
            d.Update(dt);
        }
    }

    private void RemoveInactiveEntities()
    {
        _mobs.RemoveAll(x => !x.Active);
        _dirts.RemoveAll(x => !x.Active);
        _explosions.RemoveAll(x => !x.Active);
    }

    private void MobSpawn(double dt)
    {
        _nextMobTimer += dt;
        if (_nextMobTimer > _nextMob)
        {
            _nextMobTimer = 0.0f;
            _nextMob = _rand.NextDouble() * 0.8f;

            var flipped = _rand.NextInt64(0, 2) == 0;
            var mobid = _rand.NextDouble() * 100;

            Mob newMob;
            if (mobid < 10)
                newMob = new MobSniky(_game.Assets, flipped);
            else if (mobid < 40 && mobid >= 10)
                newMob = new MobBlue(_game.Assets, flipped);
            else if (mobid < 70 && mobid >= 40)
                newMob = new MobBee(_game.Assets, flipped);
            else
                newMob = new MobFoxy(_game.Assets, flipped);
            _mobs.Add(newMob);
        }
    }

    public override void Draw(IntPtr renderer, double alpha)
    {
        DrawBakground(renderer, alpha);

        // Get ready
        if (!_ready.IsReady)
            _ready.Draw(renderer, alpha);

        if (_medkit.Active)
            _medkit.Draw(renderer, alpha);

        if (_bomb.Active)
            _bomb.Draw(renderer, alpha);

        if (_isGameOver)
            _gameOver.Draw(renderer, alpha);
        else
            _player.Draw(renderer, alpha);

        DrawEntities(renderer, alpha);
    }

    private void DrawBakground(IntPtr renderer, double alpha)
    {
        // static background
        var r = SDLUtil.Rect(0, 16, _game.Width, 312);
        SDLUtil.CheckSDLErr(() => SDL.SDL_RenderCopy(renderer, _game.Assets.Forest, IntPtr.Zero, ref r));

        // platform
        var dst = new SDL.SDL_Rect { x = 0, y = 280 + 32, w = 32, h = 32 };
        for (var i = 0; i < _game.Width / 32; ++i)
        {
            dst.x = i * 32;
            SDLUtil.CheckSDLErr(() => SDL.SDL_RenderCopy(renderer, _game.Assets.Ground, IntPtr.Zero, ref dst));
        }

        // Health bar
        _healthbar.Draw(renderer, alpha);

        // Score
        Text.DrawText(renderer, 0, 0, Colors.WhiteColor, Colors.DkGrayColor, $"Score: {_score:D8}");
        Text.DrawText(renderer, 356, 0, Colors.WhiteColor, Colors.DkGrayColor, $"HI-Score: {_hiscore:D8}");

        // Dirt
        foreach (var d in _dirts.Where(x => x.Active))
            d.Draw(renderer, alpha);

        if (_bombExploded)
        {
            SDLUtil.CheckSDLErr(() => SDL.SDL_SetRenderDrawColor(renderer, Colors.WhiteColor.r, Colors.WhiteColor.g, Colors.WhiteColor.b, (byte)_bombExplodeAlpha));
            SDLUtil.CheckSDLErr(() => SDL.SDL_SetRenderDrawBlendMode(renderer, SDL.SDL_BlendMode.SDL_BLENDMODE_BLEND));
            SDLUtil.CheckSDLErr(() => SDL.SDL_RenderFillRect(renderer, ref r));
            SDLUtil.CheckSDLErr(() => SDL.SDL_SetRenderDrawBlendMode(renderer, SDL.SDL_BlendMode.SDL_BLENDMODE_NONE));
        }
    }

    private void DrawEntities(IntPtr renderer, double alpha)
    {
        foreach (var m in _mobs.Where(x => x.Active))
        {
            m.Draw(renderer, alpha);
        }

        foreach (var e in _explosions.Where(x => x.Active))
        {
            e.Draw(renderer, alpha);
        }
    }
}