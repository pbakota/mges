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

enum Scenes
{
    TITLE,
    GAMEPLAY,
}

class RabbitGame : Game
{
#pragma warning disable 8618
    private IScene _currentScene;
    private TitleScene _titleScene;
    private GamePlayScene _gameplayScene;
    private GameAssets _assets;
    public GameAssets Assets { get => _assets; }
    private readonly string _hiscoreFilePath;
    public string HiscoreFilePath { get => _hiscoreFilePath; }
    public RabbitGame() : base(640, 480, "Rabbit unleashed")
    {
        _hiscoreFilePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "rabbit-unleashed-hiscore.txt");
    }

    protected override void Init(IntPtr renderer)
    {
        _assets = new GameAssets(renderer);
        _titleScene = new TitleScene(this);
        _gameplayScene = new GamePlayScene(this);
        _currentScene = _titleScene;

        Sound.InitAudio();
        Sound.PlayMusicFromMemory(_assets.Music);
    }

    public void ChangeScene(Scenes scene)
    {
        IScene newScene = scene switch
        {
            Scenes.TITLE => _titleScene,
            Scenes.GAMEPLAY => _gameplayScene,
            _ => throw new ArgumentOutOfRangeException(nameof(scene), $"Not expected scene value: {scene}")
        };

        if (_currentScene == newScene) return;

        _currentScene.Leave();
        _currentScene = newScene;
        _currentScene.Enter();
    }

    protected override void Update(double dt)
        => _currentScene.Update(dt);

    protected override void Draw(IntPtr renderer, double alpha)
        => _currentScene.Draw(renderer, alpha);

    public static void Main(string[] args)
    {
        var g = new RabbitGame();
        g.Run();
    }
}
