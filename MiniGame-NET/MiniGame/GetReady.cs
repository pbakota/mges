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

namespace MiniGame;

class GetReady
{
    private double _getreadyTimer = 0.0f;
    private bool _ready = false;
    public bool IsReady { get => _ready; }
    private int _alpha = 255;
    private readonly GameAssets _assets;

    public GetReady(GameAssets assets)
    {
        _assets = assets;
    }

    public void Reset()
    {
        _ready = false;
        _alpha = 255;
        _getreadyTimer = 0.0f;
    }

    public void Update(double dt){
        if(_ready) return;

        _getreadyTimer += dt;
        if(_getreadyTimer > 2.0f) {
            _alpha -= 10;
            if(_alpha<0)
                _alpha = 0;

        }

        if(_getreadyTimer > 5.0f) {
            _ready = true;
        }
    }

    public void Draw(IntPtr renderer, double alpha) {
        if(_ready) return;

        var srcrect = SDLUtil.Rect(0, 16, 160, 16);
        var dstrect = SDLUtil.Rect(160, 150, 160*2, 16*2);
        SDLUtil.CheckSDLErr(() => SDL.SDL_SetTextureAlphaMod(_assets.Elements, (byte)_alpha));
        SDLUtil.CheckSDLErr(() => SDL.SDL_RenderCopy(renderer, _assets.Elements, ref srcrect, ref dstrect));
    }
}