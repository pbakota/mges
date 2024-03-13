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

class GameOver
{
    private enum Scores
    {
        ADD_KILLS,
        ADD_MISSES,
        ADD_MEDIKITS,
        ADD_BOMS,
        PRESS_FIRE,
    }

    private const int KillsBonus = 2;
    private const int MissedBonus = 0;
    private const int BombsBonus = 50;
    private const int MedkitBonus = 100;
    private double _gameOverTime;
    private double _pressFiretime;
    private double _countTime;
    private readonly RabbitGame _game;
    private int _killed;
    private int _missed;
    private int _medkitCollected;
    private int _bombsCollected;
    private int _score;
    public int Score { get => _score; }
    private Scores _currentScoreCount;

    public GameOver(RabbitGame game)
    {
        _game = game;
        _gameOverTime = 0.0f;
        _countTime = 0.0f;
    }

    public void Reset()
    {
        _gameOverTime = 0.0f;
        _killed = 0;
        _missed = 0;
        _medkitCollected = 0;
        _bombsCollected = 0;
        _score = 0;
        _currentScoreCount = Scores.ADD_KILLS;
        _pressFiretime = double.MaxValue;
    }

    public void Set(int killed, int missed, int medkitCollected, int bombsCollected, int score)
    {
        _killed = killed;
        _missed = missed;
        _medkitCollected = medkitCollected;
        _bombsCollected = bombsCollected;
        _score = score;
    }

    public void Update(double dt)
    {
        _gameOverTime += dt;
        if (_gameOverTime > 3.0f)
        {
            _countTime += dt;
            if (_countTime > 0.02f)
            {
                _countTime -= 0.02f;
                switch (_currentScoreCount)
                {
                    case Scores.ADD_KILLS:
                        if (_killed > 10)
                        {
                            Sound.PlaySoundFromMemory(_game.Assets.TickFx, 64);
                            _score += KillsBonus * 10;
                            _killed -= 10;
                        }
                        else if (_killed > 0)
                        {
                            Sound.PlaySoundFromMemory(_game.Assets.TickFx, 64);
                            _score += KillsBonus;
                            _killed--;
                        }
                        if (_killed == 0)
                            _currentScoreCount = Scores.ADD_MISSES;
                        break;
                    case Scores.ADD_MISSES:
                        if (_missed > 10)
                        {
                            Sound.PlaySoundFromMemory(_game.Assets.TickFx, 64);
                            _score += MissedBonus * 10;
                            _missed -= 10;
                        }
                        else if (_missed > 0)
                        {
                            Sound.PlaySoundFromMemory(_game.Assets.TickFx, 64);
                            _score += MissedBonus;
                            _missed--;
                        }
                        if (_missed == 0)
                            _currentScoreCount = Scores.ADD_BOMS;
                        break;
                    case Scores.ADD_BOMS:
                        if (_bombsCollected > 10)
                        {
                            Sound.PlaySoundFromMemory(_game.Assets.TickFx, 64);
                            _score += BombsBonus * 10;
                            _bombsCollected -= 10;
                        }
                        else if (_bombsCollected > 0)
                        {
                            Sound.PlaySoundFromMemory(_game.Assets.TickFx, 64);
                            _score += BombsBonus;
                            _bombsCollected--;
                        }
                        if (_bombsCollected == 0)
                            _currentScoreCount = Scores.ADD_MEDIKITS;
                        break;
                    case Scores.ADD_MEDIKITS:
                        if (_medkitCollected > 10)
                        {
                            Sound.PlaySoundFromMemory(_game.Assets.TickFx, 64);
                            _score += MedkitBonus * 10;
                            _medkitCollected -= 10;
                        }
                        if (_medkitCollected > 0)
                        {
                            Sound.PlaySoundFromMemory(_game.Assets.TickFx, 64);
                            _score += MedkitBonus;
                            _medkitCollected--;
                        }
                        if (_medkitCollected == 0)
                        {
                            _currentScoreCount = Scores.PRESS_FIRE;
                            _pressFiretime = _gameOverTime + 1;
                        }
                        break;
                }
            }

            if (_currentScoreCount == Scores.PRESS_FIRE)
            {
                if (_gameOverTime > _pressFiretime)
                    if (Control.Fire)
                    {
                        _game.ChangeScene(Scenes.TITLE);
                        return;
                    }
            }
        }
    }

    public void Draw(IntPtr renderer, double alpha)
    {
        var srcrect = SDLUtil.Rect(0, 0, 160, 16);
        var dstrect = SDLUtil.Rect(160, 50, 160 * 2, 16 * 2);

        SDLUtil.CheckSDLErr(() => SDL.SDL_SetTextureAlphaMod(_game.Assets.Elements, 255));
        SDLUtil.CheckSDLErr(() => SDL.SDL_RenderCopy(renderer, _game.Assets.Elements, ref srcrect, ref dstrect));

        Text.DrawText(renderer, 170, 100, Colors.WhiteColor, Colors.DkGrayColor, $"Killed: {_killed:D5}");
        Text.DrawText(renderer, 400, 104, Colors.WhiteColor, Colors.DkGrayColor, $"x {KillsBonus}", 0.5);

        Text.DrawText(renderer, 170, 120, Colors.WhiteColor, Colors.DkGrayColor, $"Missed: {_missed:D5}");
        Text.DrawText(renderer, 400, 124, Colors.WhiteColor, Colors.DkGrayColor, $"x {MissedBonus}", 0.5);

        Text.DrawText(renderer, 170, 140, Colors.WhiteColor, Colors.DkGrayColor, $"Bombs : {_bombsCollected:D4}");
        Text.DrawText(renderer, 400, 144, Colors.WhiteColor, Colors.DkGrayColor, $"x {MedkitBonus}", 0.5);

        Text.DrawText(renderer, 170, 160, Colors.WhiteColor, Colors.DkGrayColor, $"Medkit: {_medkitCollected:D4}");
        Text.DrawText(renderer, 400, 164, Colors.WhiteColor, Colors.DkGrayColor, $"x {BombsBonus}", 0.5);

        Text.DrawText(renderer, 140, 200, Colors.WhiteColor, Colors.BlackColor, $"FINAL SCORE: {_score:D8}");

        if (_gameOverTime > _pressFiretime)
            Text.DrawText(renderer, 200, 250, Colors.WhiteColor, Colors.BlackColor, "Press \"FIRE\"!");
    }
}