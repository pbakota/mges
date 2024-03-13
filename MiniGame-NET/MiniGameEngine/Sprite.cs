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
using SDL2;

namespace MiniGameEngine
{
    abstract public class Sprite
    {
        public Vector2f Position { get; set; }
        public Vector2f? OldPosition { get; set; } = null;
        public Vector2f Velocity { get; set; }
        public Vector2i Size { get; set; }
        protected IntPtr _frame;
        protected bool _flipped;
        protected byte _alpha = 255;
        public byte Alpha { set => _alpha = value; }
        protected SDL.SDL_Rect _hitbox;
        public SDL.SDL_Rect HitBox { get => new() { x = (int)(Position.x + _hitbox.x), y = (int)(Position.y + _hitbox.y), w = _hitbox.w, h = _hitbox.h }; }
        public bool Flipped { get => _flipped; set => _flipped = value; }
        public Sprite(IntPtr frame, int w, int h)
        {
            _frame = frame;
            _flipped = false;

            Position = new Vector2f();
            Velocity = new Vector2f();
            Size = new Vector2i(w, h);

            _hitbox = SDLUtil.Rect(0, 0, Size.x, Size.y);
        }
        public virtual void Draw(IntPtr renderer, double alpha)
        {
            int x;
            int y;
            if (OldPosition != null)
            {
                x = (int)Math.Round(OldPosition.x * alpha + Position.x * (1.0f - alpha));
                y = (int)Math.Round(OldPosition.y * alpha + Position.y * (1.0f - alpha));
            }
            else
            {
                OldPosition = Position;
                x = (int)Math.Round(Position.x);
                y = (int)Math.Round(Position.y);
            }

            var dst = SDLUtil.Rect(x, y, Size.x, Size.y);
            var flipped = _flipped ? SDL.SDL_RendererFlip.SDL_FLIP_HORIZONTAL : SDL.SDL_RendererFlip.SDL_FLIP_NONE;

            if (_alpha < 255)
                SDLUtil.CheckSDLErr(() => SDL.SDL_SetTextureAlphaMod(_frame, _alpha));

            SDLUtil.CheckSDLErr(() => SDL.SDL_RenderCopyEx(renderer, _frame, IntPtr.Zero, ref dst, 0.0f, IntPtr.Zero, flipped));

            if (_alpha < 255)
                SDLUtil.CheckSDLErr(() => SDL.SDL_SetTextureAlphaMod(_frame, 255));

#if false
        var hb = _hitbox;
        hb.x += dst.x;
        hb.y += dst.y;

        SDLUtil.CheckSDLErr(() => SDL.SDL_SetRenderDrawColor(renderer, 0, 255, 0, 255));
        SDLUtil.CheckSDLErr(() => SDL.SDL_RenderDrawRect(renderer, ref hb));
#endif
        }
    }
    abstract public class AnimatedSprite : Sprite
    {
        protected int _animFrame;
        protected double _animTimer;
        protected readonly IntPtr[] _frames;
        protected AnimatedSprite(IntPtr[] frames, int w, int h) : base(frames[0], w, h)
        {
            _frames = frames;
            _animFrame = 0;
            _animTimer = 0.0f;
        }
        public abstract void Update(double dt);
        public override void Draw(IntPtr renderer, double alpha)
        {
            _frame = _frames[_animFrame];
            base.Draw(renderer, alpha);
        }
    }
}