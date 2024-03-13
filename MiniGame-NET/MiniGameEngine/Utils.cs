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

using SDL2;

namespace MiniGameEngine.Utils
{
    public class Vector2f
    {
        public double x;
        public double y;
        public Vector2f()
        {
            x = 0.0f;
            y = 0.0f;
        }
        public Vector2f(double x, double y)
        {
            this.x = x;
            this.y = y;
        }
    }
    public class Vector2i
    {
        public int x;
        public int y;
        public Vector2i()
        {
            x = 0;
            y = 0;
        }
        public Vector2i(int x, int y)
        {
            this.x = x;
            this.y = y;
        }
    }

    public static class SDL_RectExtensions
    {
        public static bool AABB(this SDL.SDL_Rect rect1, SDL.SDL_Rect rect2)
            => SDL.SDL_HasIntersection(ref rect1, ref rect2) == SDL.SDL_bool.SDL_TRUE;
    }

    public static class SDLUtil
    {
        public static void CheckSDLErr(Func<int> act)
        {
            if (act() != 0)
            {
                LogErr($"Error: {SDL.SDL_GetError()}");
                Environment.Exit(1);
            }
        }
        public static IntPtr CheckSDLErr(Func<IntPtr> act)
        {
            var ptr = act();
            if (ptr == IntPtr.Zero)
            {
                LogErr($"Error: {SDL.SDL_GetError()}");
                Environment.Exit(1);
            }

            return ptr;
        }

        public static uint ToRGBA(this SDL.SDL_Color color)
            => ((uint)color.r) << 24 | ((uint)color.g) << 16 | ((uint)color.b) << 8 | (uint)color.a;

        public static SDL.SDL_Rect Rect(int x, int y, int w, int h)
            => new() { x = x, y = y, w = w, h = h };
        public static SDL.SDL_Rect Rect(double x, double y, int w, int h)
            => new() { x = (int)x, y = (int)y, w = w, h = h };


        public static void LogErr(string text)
            => SDL.SDL_LogError((int)SDL.SDL_LogCategory.SDL_LOG_CATEGORY_APPLICATION, text);
        public static void LogInfo(string text)
            => SDL.SDL_LogInfo((int)SDL.SDL_LogCategory.SDL_LOG_CATEGORY_APPLICATION, text);
        public static void LogDebug(string text)
            => SDL.SDL_LogDebug((int)SDL.SDL_LogCategory.SDL_LOG_CATEGORY_APPLICATION, text);
    }

}