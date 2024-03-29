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

namespace MiniGame;

interface IScene {
    void Enter();
    void Leave();
    void Update(double dt);
    void Draw(IntPtr renderer, double alpha);
}

abstract class Scene: IScene
{
    protected RabbitGame _game;
    protected Scene(RabbitGame game)
    {
        _game = game;
    }
    public virtual void Enter() { }
    public virtual void Leave() { }
    public abstract void Update(double dt);
    public abstract void Draw(IntPtr renderer, double alpha);
}