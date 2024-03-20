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

namespace MiniGame;

static class Colors
{
    public static readonly SDL.SDL_Color WhiteColor = new() { r = 255, g = 255, b = 255, a = 255 };
    public static readonly SDL.SDL_Color BlackColor = new() { r = 0, g = 0, b = 0, a = 255 };
    public static readonly SDL.SDL_Color DkGrayColor = new() { r = 64, g = 64, b = 64, a = 255 };


    // 0c1122
    public static readonly SDL.SDL_Color DkGray2Color = new() { r = 12, g = 17, b = 34, a = 255 };
}