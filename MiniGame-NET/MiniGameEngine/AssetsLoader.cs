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
    public abstract class AssetsLoader
    {
        #pragma warning disable 8618
        internal static string _assetsFolder;
        internal static readonly string _cwd = Environment.CurrentDirectory;

        protected AssetsLoader(string assetsFolder)
        {
            _assetsFolder = assetsFolder;
        }

        protected static IntPtr LoadBitmap(IntPtr renderer, string path)
        {
            var fullpath = Path.Combine(_cwd, _assetsFolder, path);

            var surface = SDLUtil.CheckSDLErr(() => SDL_image.IMG_Load(fullpath));
            var texture = SDLUtil.CheckSDLErr(() => SDL.SDL_CreateTextureFromSurface(renderer, surface));

            return texture;
        }
        
        protected static Sound.Audio LoadSoundFx(string path)
        {
            var fullpath = Path.Combine(_cwd, _assetsFolder, path);

            var audio = SDL.SDL_LoadWAV(fullpath, out var specs, out var buffer, out var len);
            if(audio == IntPtr.Zero) {
                SDLUtil.LogErr($"Unable to read audio wav file {fullpath}, Error:{SDL.SDL_GetError()}");
                Environment.Exit(1);
            }

            return new Sound.Audio
            {
                buffer = buffer,
                length = len,
                audio = specs,
            };
        }

        public static string GetAssetPath(string fileName)
            => Path.Combine(_cwd, _assetsFolder, fileName);
    }
}