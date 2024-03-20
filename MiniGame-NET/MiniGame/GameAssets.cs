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
using SDL2;

namespace MiniGame;

class GameAssets: AssetsLoader
{
    public IntPtr[] PlayerFrames;
    public IntPtr[] BeeFrames;
    public IntPtr[] BlueFrames;
    public IntPtr[] SnikyFrames;
    public IntPtr[] FoxyFrames;
    public IntPtr[] HeroBFrames;
    public IntPtr PlayerBullet;
    public IntPtr Ground;
    public IntPtr BloodGround;
    public IntPtr BloodParticle;
    public IntPtr Explosion;
    public IntPtr Healthbar;
    public IntPtr Elements;
    public IntPtr Title;
    public IntPtr MedKit;
    public IntPtr Forest;
    public IntPtr Bomb;
    public Sound.Audio Music;
    public Sound.Audio TickFx;
    public Sound.Audio ExplosionFx;
    public Sound.Audio PickupFx;
    public Sound.Audio MobHitFx;
    public Sound.Audio FireFx;
    public Sound.Audio ExplosionLongFx;

    public GameAssets(IntPtr renderer):base("assets")
    {
        PlayerFrames = new IntPtr[] {
            LoadFrame(renderer, "hero1.png"),
            LoadFrame(renderer, "hero2.png"),
        };

        BeeFrames = new IntPtr[] {
            LoadFrame(renderer, "bee1a.png"),
            LoadFrame(renderer, "bee2a.png"),
        };

        BlueFrames = new IntPtr[] {
            LoadFrame(renderer, "blue1a.png"),
            LoadFrame(renderer, "blue2a.png"),
        };

        SnikyFrames = new IntPtr[] {
            LoadFrame(renderer, "sniky1.png"),
            LoadFrame(renderer, "sniky2.png"),
        };

        FoxyFrames = new IntPtr[] {
            LoadFrame(renderer, "roka1.png"),
            LoadFrame(renderer, "roka2.png"),
        };

        HeroBFrames = new IntPtr[] {
            LoadFrame(renderer, "hero1b.png"),
            LoadFrame(renderer, "hero2b.png"),
        };

        Music = LoadSound("world_1.wav");

        PlayerBullet = LoadFrame(renderer, "bullet.png");
        Ground = LoadFrame(renderer, "tile_0004.png");

        BloodGround = LoadFrame(renderer, "blood_tile.png");
        BloodParticle = LoadFrame(renderer, "blood.png");

        Explosion = LoadFrame(renderer, "explosion-4.png");
        Healthbar = LoadFrame(renderer, "healthbar.png");

        Elements = LoadBitmap(renderer, "Bitmaps/elements.png");
        Title = LoadBitmap(renderer, "Bitmaps/title.png");
        MedKit = LoadFrame(renderer, "medkit.png");
        Forest = LoadBitmap(renderer, "Bitmaps/background.png");

        Bomb = LoadFrame(renderer, "bombball.png");
        TickFx = LoadSound("tick.wav");
        ExplosionFx = LoadSound("explosion.wav");
        PickupFx = LoadSound("pickup.wav");
        MobHitFx = LoadSound("hit.wav");
        FireFx = LoadSound("fire.wav");
        ExplosionLongFx = LoadSound("explosion_long.wav");
    }

    public void FreeAll()
    {
        Sound.FreeAudio(Music);
        Sound.FreeAudio(TickFx);
        Sound.FreeAudio(ExplosionFx);
        Sound.FreeAudio(PickupFx);
        Sound.FreeAudio(MobHitFx);
        Sound.FreeAudio(FireFx);
        Sound.FreeAudio(ExplosionLongFx);

        SDL.SDL_DestroyTexture(PlayerFrames[0]);
        SDL.SDL_DestroyTexture(PlayerFrames[1]);
        SDL.SDL_DestroyTexture(BeeFrames[0]);
        SDL.SDL_DestroyTexture(BeeFrames[1]);
        SDL.SDL_DestroyTexture(BlueFrames[0]);
        SDL.SDL_DestroyTexture(BlueFrames[1]);
        SDL.SDL_DestroyTexture(SnikyFrames[0]);
        SDL.SDL_DestroyTexture(SnikyFrames[1]);
        SDL.SDL_DestroyTexture(FoxyFrames[0]);
        SDL.SDL_DestroyTexture(FoxyFrames[1]);

        SDL.SDL_DestroyTexture(PlayerBullet);

        SDL.SDL_DestroyTexture(Ground);
        SDL.SDL_DestroyTexture(BloodGround);
        SDL.SDL_DestroyTexture(BloodParticle);
        SDL.SDL_DestroyTexture(Explosion);
        SDL.SDL_DestroyTexture(Healthbar);
        SDL.SDL_DestroyTexture(Title);
        SDL.SDL_DestroyTexture(Elements);
    }

    private static IntPtr LoadFrame(IntPtr renderer, string fileName)
        => LoadBitmap(renderer, Path.Combine("Tiles", fileName));

    private static Sound.Audio LoadSound(string fileName)
        => LoadSoundFx(Path.Combine("Sounds", fileName));
}