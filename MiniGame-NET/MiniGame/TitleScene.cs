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

class TitleScene : Scene
{
    private readonly MobBee _bee;
    private readonly MobBlue _blue;
    private readonly MobSniky _sniky;
    private readonly MobFoxy _foxy;
    private readonly MedKit _medkit;
    private readonly Bomb _bomb;
    private readonly HeroB _heroB;

    public TitleScene(RabbitGame game) : base(game)
    {
        _bee = new MobBee(_game.Assets, false)
        {
            Position = new Vector2f(80.0f, 140.0f),
            Velocity = new Vector2f(0.0f, 0.0f),
        };
        _blue = new MobBlue(_game.Assets, false)
        {
            Position = new Vector2f(80.0f, 180.0f),
            Velocity = new Vector2f(0.0f, 0.0f),
        };
        _sniky = new MobSniky(_game.Assets, false)
        {
            Position = new Vector2f(80.0f, 220.0f),
            Velocity = new Vector2f(0.0f, 0.0f),
        };
        _foxy = new MobFoxy(_game.Assets, false)
        {
            Position = new Vector2f(80.0f, 260.0f),
            Velocity = new Vector2f(0.0f, 0.0f),
        };
        _bomb = new Bomb(_game.Assets)
        {
            Position = new Vector2f(80.0f, 300.0f),
        };
        _medkit = new MedKit(_game.Assets)
        {
            Position = new Vector2f(80.0f, 340.0f),
        };
        _heroB = new HeroB(_game.Assets)
        {
            Position = new Vector2f(40.0f, 40.0f),
        };
    }

    public override void Draw(IntPtr renderer, double alpha)
    {
        SDLUtil.CheckSDLErr(() => SDL.SDL_SetRenderDrawColor(renderer, Colors.DkGray2Color.r, Colors.DkGray2Color.g, Colors.DkGray2Color.b, Colors.DkGray2Color.a));
        SDLUtil.CheckSDLErr(() => SDL.SDL_RenderFillRect(renderer, IntPtr.Zero));

        // static background
        var r = SDLUtil.Rect(0, 16, _game.Width, 312);
        SDLUtil.CheckSDLErr(() => SDL.SDL_RenderCopy(renderer, _game.Assets.Forest, IntPtr.Zero, ref r));

        // title
        SDLUtil.CheckSDLErr(() => SDL.SDL_RenderCopy(renderer, _game.Assets.Title, IntPtr.Zero, IntPtr.Zero));

        _heroB.Draw(renderer, alpha);

        // mobs
        _bee.Draw(renderer, alpha);   Text.DrawText(renderer, 120, 150, Colors.WhiteColor, Colors.BlackColor, $"BEE .......... {_bee.Point,3} points");
        _blue.Draw(renderer, alpha);  Text.DrawText(renderer, 120, 190, Colors.WhiteColor, Colors.BlackColor, $"BLUE ......... {_blue.Point,3} points");
        _sniky.Draw(renderer, alpha); Text.DrawText(renderer, 120, 230, Colors.WhiteColor, Colors.BlackColor, $"SNIKY ........ {_sniky.Point,3} points");
        _foxy.Draw(renderer, alpha);  Text.DrawText(renderer, 120, 270, Colors.WhiteColor, Colors.BlackColor, $"FOXY ......... {_foxy.Point,3} points");

        _bomb.Draw(renderer, alpha);  Text.DrawText(renderer, 120, 310, Colors.WhiteColor, Colors.BlackColor, $"BOMB ......... {_bomb.Point,3} points");
        _medkit.Draw(renderer, alpha);Text.DrawText(renderer, 120, 350, Colors.WhiteColor, Colors.BlackColor, $"MEDKIT........ {_medkit.Point,3} points");

        Text.DrawText(renderer, 140, 420, Colors.WhiteColor, Colors.DkGrayColor, "PRESS \"FIRE\" TO START");
        Text.DrawText(renderer, 135, 480-18, Colors.DkGrayColor, Colors.BlackColor, "PRESS \"F12\" TO QUIT OR \"F11\" FOR FULLSCREEN", 0.5f);
    }

    public override void Enter()
    {
        Control.Reset();
    }

    public override void Update(double dt)
    {
        if(Control.Fire) {
            _game.ChangeScene(Scenes.GAMEPLAY);
            return;
        }

        _bee.Update(dt);
        _blue.Update(dt);
        _sniky.Update(dt);
        _foxy.Update(dt);

        _heroB.Update(dt);
    }
}

class HeroB : AnimatedSprite
{
    public HeroB(GameAssets assets) : base(assets.PlayerFrames, 64, 64)
    {
    }

    public override void Update(double dt)
    {
        _animTimer += dt;
        if(_animTimer>0.3f) {
            _animTimer = 0.0f;
            _animFrame = 1 - _animFrame;
        }
    }
}
