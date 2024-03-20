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

namespace MiniGame;

class Dirt : Sprite
{
    private double _alphaTimer = 0.0f;
    private bool _active;
    public bool Active { get => _active; set => _active = value; }

    public Dirt(IntPtr frame) : base(frame, 32, 32)
    {
        _alpha = 255;
        _active = true;
    }

    public void Update(double dt)
    {
        _alphaTimer += dt;
        if(_alphaTimer>0.2f) {
            _alphaTimer = 0.0f;
            _alpha--;
            if(_alpha < 10) {
                _alpha = 0;
                _active = false;
            }
        }
    }
}