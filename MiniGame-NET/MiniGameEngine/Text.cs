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

using System.Runtime.InteropServices;
using MiniGameEngine.Utils;
using SDL2;

namespace MiniGameEngine
{
    public static class Text
    {
        public static readonly int FONT_SIZE = 16;
        public static readonly int FONT_COUNT = 74;
        private const int COLOR_INDEX = 31;
        private const int SHADOW_INDEX = 25;
        private const int TRANSPARENT_INDEX = 0;
        private static readonly byte[] _fontData;

        static Text()
        {
            var font = SDLUtil.CheckSDLErr(() => SDL.SDL_LoadBMP(Path.Combine(AssetsLoader._cwd, AssetsLoader._assetsFolder, "Fonts", "font.bmp")));

            if (SDL.SDL_MUSTLOCK(font))
                SDLUtil.CheckSDLErr(() => SDL.SDL_LockSurface(font));

            var surface = Marshal.PtrToStructure<SDL.SDL_Surface>(font);

            _fontData = new byte[FONT_SIZE * FONT_SIZE * FONT_COUNT];
            var dptr = 0;

            for (var c = 0; c < FONT_COUNT; ++c)
            {
                var ptr = surface.pixels + FONT_SIZE * c;
                for (var y = 0; y < FONT_SIZE; ++y)
                {
                    for (var x = 0; x < FONT_SIZE; ++x)
                    {
                        _fontData[dptr++] = Marshal.ReadByte(ptr);
                        ptr += sizeof(byte);
                    }
                    ptr += surface.pitch - FONT_SIZE * sizeof(byte);
                }
            }

            if (SDL.SDL_MUSTLOCK(font))
                SDL.SDL_UnlockSurface(font);

            SDL.SDL_FreeSurface(font);
        }

        private static void DrawToCharBuffer(IntPtr buffer, int pitch, uint color, uint shadow, int chr)
        {
            var offset = FONT_SIZE * FONT_SIZE * (chr - 0x21);
            var ptr = buffer;

            for (var y = 0; y < FONT_SIZE; ++y)
            {
                for (var x = 0; x < FONT_SIZE; ++x)
                {
                    switch (_fontData[offset++])
                    {
                        case COLOR_INDEX:
                            Marshal.WriteIntPtr(ptr, (IntPtr)color);
                            break;
                        case SHADOW_INDEX:
                            Marshal.WriteIntPtr(ptr, (IntPtr)shadow);
                            break;
                        case TRANSPARENT_INDEX:
                            // Do nothing here!
                            break;
                    }
                    ptr += sizeof(uint);
                }
                ptr += pitch - FONT_SIZE * sizeof(uint);
            }
        }

        private static void DrawChar(SDL.SDL_Surface surface, int x, uint color, uint shadow, int chr)
            => DrawToCharBuffer(surface.pixels + x * FONT_SIZE * sizeof(uint), surface.pitch, color, shadow, chr);

        private static void DrawText(IntPtr surface, string text, uint color, uint shadow)
        {
            if (SDL.SDL_MUSTLOCK(surface))
                SDLUtil.CheckSDLErr(() => SDL.SDL_LockSurface(surface));

            var surface2 = Marshal.PtrToStructure<SDL.SDL_Surface>(surface);
            var x = 0;
            foreach (var c in text.ToUpper())
                if (c == 0x20) x++; else DrawChar(surface2, x++, color, shadow, c);

            if (SDL.SDL_MUSTLOCK(surface))
                SDL.SDL_UnlockSurface(surface);
        }

        public static void DrawText(IntPtr renderer,
            int x,
            int y,
            SDL.SDL_Color color,
            SDL.SDL_Color shadow,
            string text, double size = 1.0f, double angle = 0.0f, bool vertFlip = false, bool horizFlip = false)
        {
            var surface = SDL.SDL_CreateRGBSurface(0, text.Length * FONT_SIZE, FONT_SIZE, 32, 0xff000000, 0x00ff0000, 0x0000ff00, 0x000000ff);
            DrawText(surface, text, color.ToRGBA(), shadow.ToRGBA());

            var texture = SDL.SDL_CreateTextureFromSurface(renderer, surface);
            var dst = SDLUtil.Rect(x, y, (int)(text.Length * FONT_SIZE * size), (int)(FONT_SIZE * size));

            var flip = (horizFlip ? SDL.SDL_RendererFlip.SDL_FLIP_HORIZONTAL : SDL.SDL_RendererFlip.SDL_FLIP_NONE) |
                       (vertFlip ? SDL.SDL_RendererFlip.SDL_FLIP_VERTICAL : SDL.SDL_RendererFlip.SDL_FLIP_NONE);

            SDLUtil.CheckSDLErr(() => SDL.SDL_RenderCopyEx(renderer, texture, IntPtr.Zero, ref dst, angle, IntPtr.Zero, flip));

            SDL.SDL_DestroyTexture(texture);
            SDL.SDL_FreeSurface(surface);
        }
    }

}