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
    public static class Sound
    {
        private const int AUDIO_FREQUENCY = 44100;
        private const ushort AUDIO_FORMAT = SDL.AUDIO_S16LSB;
        private const byte AUDIO_CHANNELS = 2;
        private const ushort AUDIO_SAMPLES = 4096;
        private const int AUDIO_MAX_SOUNDS = 25;

        private sealed record PrivateAudioDevice
        {
            public uint device;
            public SDL.SDL_AudioSpec want;
            public bool audioEnabled;
        }

        public record Audio
        {
            public uint length;
            public uint lengthTrue;
            public IntPtr bufferTrue;
            public IntPtr buffer;
            public bool loop;
            public bool fade;
            public bool free;
            public int volume;
            public SDL.SDL_AudioSpec audio;
            public bool Active { get; set; }
        };

        private static readonly List<Audio> _audios = new();
        private static readonly PrivateAudioDevice _device = new();
        private static uint _soundCount = 0;

        public static void PlaySound(string filename, int volume = SDL.SDL_MIX_MAXVOLUME)
            => PlayAudio(filename, null, false, volume);

        public static void PlayMusic(string filename, int volume = SDL.SDL_MIX_MAXVOLUME)
            => PlayAudio(filename, null, true, volume);

        public static void PlaySoundFromMemory(Audio audio, int volume = SDL.SDL_MIX_MAXVOLUME)
            => PlayAudio(null, audio, false, volume);

        public static void PlayMusicFromMemory(Audio audio, int volume = SDL.SDL_MIX_MAXVOLUME)
            => PlayAudio(null, audio, true, volume);

        public static void InitAudio()
        {
            if ((SDL.SDL_WasInit(SDL.SDL_INIT_AUDIO) & SDL.SDL_INIT_AUDIO) == 0)
            {
                SDLUtil.LogErr("Error: SDL_INIT_AUDIO not initialized");
                return;
            }

            _device.want.freq = AUDIO_FREQUENCY;
            _device.want.format = AUDIO_FORMAT;
            _device.want.channels = AUDIO_CHANNELS;
            _device.want.samples = AUDIO_SAMPLES;
            _device.want.callback = SoundCallback;
            _device.want.userdata = IntPtr.Zero;

            _device.device = SDL.SDL_OpenAudioDevice(IntPtr.Zero, 0, ref _device.want, out var obtained, (int)SDL.SDL_AUDIO_ALLOW_FORMAT_CHANGE);
            if (_device.device == 0)
            {
                SDLUtil.LogInfo($"Warning: failed to open audio device: {SDL.SDL_GetError()}");
            }
            else if (_device.want.format != obtained.format)
            {
                SDLUtil.LogInfo($"Warning: format missmatch wanted {_device.want.format} but got {obtained.format}");
            }
            else
            {
                /* Set audio device enabled global flag */
                _device.audioEnabled = true;

                /* Unpause active audio stream */
                UnpauseAudio();
            }
        }

        private static void SoundCallback(IntPtr userdata, IntPtr stream, int len)
        {
            /* Silence the main buffer (important!) */
            SDL.SDL_memset(stream, 0, (IntPtr)len);

            foreach (var audio in _audios)
            {
                // TODO: fade in/out support
                if (audio.length > 0)
                {
                    var tempLength = len > audio.length ? (int)audio.length : len;
                    SDL.SDL_MixAudioFormat(stream, audio.buffer, AUDIO_FORMAT, (uint)tempLength, audio.volume);
                    audio.buffer += tempLength;
                    audio.length -= (uint)tempLength;
                }
                else
                {
                    if (audio.loop)
                    {
                        audio.buffer = audio.bufferTrue;
                        audio.length = audio.lengthTrue;
                    }
                    else
                    {
                        audio.Active = false;
                        if (_soundCount > 0)
                            _soundCount--;
                    }
                }
            }
        }

        public static void EndAudio()
        {
            if (_device.audioEnabled)
            {
                PauseAudio();

                /* Close down audio */
                SDL.SDL_CloseAudioDevice(_device.device);
            }
        }

        public static void PauseAudio()
        {
            if (_device.audioEnabled)
                SDL.SDL_PauseAudioDevice(_device.device, 1);
        }

        public static void UnpauseAudio()
        {
            if (_device.audioEnabled)
                SDL.SDL_PauseAudioDevice(_device.device, 0);
        }


        public static void FreeAudio(Audio audio)
        {
            SDL.SDL_FreeWAV(audio.bufferTrue);
        }

        private static Audio? CreateAudio(string? filename, bool loop, int volume)
        {
            Audio new_ = new();

            if (string.IsNullOrEmpty(filename))
            {
                SDLUtil.LogInfo($"Warning: filename NULL: {filename}");
                return null;
            }

            new_.loop = loop;
            new_.fade = false;
            new_.free = true;
            new_.volume = volume;

            if (SDL.SDL_LoadWAV(filename, out new_.audio, out new_.bufferTrue, out new_.lengthTrue) == IntPtr.Zero)
            {
                SDLUtil.LogInfo($"Warning: failed to open wave file: {filename} error: {SDL.SDL_GetError()}");
                return null;
            }

            if (_device.want.format != new_.audio.format)
            {
                SDLUtil.LogInfo($"Warning: format missmatch wanted {_device.want.format} but got {new_.audio.format}");
            }

            new_.buffer = new_.bufferTrue;
            new_.length = new_.lengthTrue;
            new_.Active = true;

            return new_;
        }

        private static void PlayAudio(string? filename, Audio? audio, bool loop, int volume = SDL.SDL_MIX_MAXVOLUME)
        {
            Audio new_;

            /* Check if audio is enabled */
            if (!_device.audioEnabled)
                return;

            /* If sound, check if under max number of sounds allowed, else don't play */
            if (!loop && _soundCount >= AUDIO_MAX_SOUNDS)
                return;

            /* Load from filename or from Memory */
            if (!string.IsNullOrEmpty(filename))
            {
                /* Create new music sound with loop */
                var nnew_ = CreateAudio(filename, loop, volume);
                if (nnew_ == null) return;

                new_ = nnew_;
            }
            else if (audio != null)
            {
                new_ = new()
                {
                    loop = loop,
                    fade = false,
                    volume = volume,
                    buffer = audio.buffer,
                    length = audio.length,
                    bufferTrue = audio.buffer,
                    lengthTrue = audio.length,
                    Active = true,
                    free = false
                };
            }
            else
            {
                SDLUtil.LogInfo("Warning: filename and Audio parameters NULL");
                return;
            }

            /* Lock callback function */
            SDL.SDL_LockAudioDevice(_device.device);

            _audios.RemoveAll(s => !s.Active);
            _audios.Add(new_);

            SDL.SDL_UnlockAudioDevice(_device.device);

            if(!loop) {
                _soundCount++;
            }
        }
    }
}