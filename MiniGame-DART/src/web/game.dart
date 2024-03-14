import 'dart:html';
import 'lib/engine.dart';
import 'lib/sound.dart';
import 'scene.dart';
import 'title.dart';

enum GameScene { GAME_SCENE_TITLE, GAME_SCENE_ACTION }

final double displayScale = 1.8;
final Vector2 displaySize = Vector2(640, 480);

class Game extends Engine {
  final Input _input;
  num _fps;
  late Music _music;
  GameScene _currentScene = GameScene.GAME_SCENE_TITLE;
  BaseScene? _activeScene;

  Game()
      : _fps = 0,
        _input = Input(),
        super(EngineOptions(allowPause: false)) {
    renderer
        .options(displaySize.x.toInt(), displaySize.y.toInt(), displayScale);
  }

  @override
  void enterFullscreen() {
    print('Entering fullscreen');
    renderer.resize(window.innerWidth!, window.innerHeight!, displayScale);
  }

  @override
  void leaveFullscreen() {
    print('Leaving fullscreen');
    renderer
        .options(displaySize.x.toInt(), displaySize.y.toInt(), displayScale);
  }

  Input get input => _input;

  @override
  void init() {
    print('loading game assets ...');

    loader.load('forest', 'assets/Bitmaps/background.png');
    loader.load('titleBitmap', 'assets/Bitmaps/title.png');
    loader.load('elements', 'assets/Bitmaps/elements.png');
    loader.load('bitmapFont', 'assets/Fonts/font.png');

    loader.load('bee1a', 'assets/Sprites/bee1a.png');
    loader.load('bee2a', 'assets/Sprites/bee2a.png');

    loader.load('blue1a', 'assets/Sprites/blue1a.png');
    loader.load('blue2a', 'assets/Sprites/blue2a.png');

    loader.load('sniky1a', 'assets/Sprites/sniky1.png');
    loader.load('sniky2a', 'assets/Sprites/sniky2.png');

    loader.load('foxy1a', 'assets/Sprites/roka1.png');
    loader.load('foxy2a', 'assets/Sprites/roka2.png');

    loader.load('hero1a', 'assets/Sprites/hero1.png');
    loader.load('hero2a', 'assets/Sprites/hero2.png');

    // hero - big for title
    loader.load('hero1b', 'assets/Sprites/hero1b.png');
    loader.load('hero2b', 'assets/Sprites/hero2b.png');

    loader.load('bomb', 'assets/Sprites/bombball.png');
    loader.load('medkit', 'assets/Sprites/medkit.png');
    loader.load('explosion', 'assets/Sprites/explosion-4.png');
    loader.load('bullet', 'assets/Sprites/bullet.png');

    // blood ground
    loader.load('blood-ground', 'assets/Sprites/blood_tile.png');

    // blood particle
    loader.load('blood-particle', 'assets/Sprites/blood.png');

    // music
    loader.load('world-1', 'assets/Sounds/world_1.ogg');

    // healthbar
    loader.load('energybar', 'assets/Sprites/healthbar.png');

    // ground
    loader.load('ground', 'assets/Sprites/tile_0004.png');

    // explosion
    loader.load('explosion', 'assets/Sprites/explosion-4.png');

    // sound fx
    loader.load('explosion_long-fx', 'assets/Sounds/explosion_long.wav');
    loader.load('explosion-fx', 'assets/Sounds/explosion.wav');
    loader.load('fire-fx', 'assets/Sounds/fire.wav');
    loader.load('hit-fx', 'assets/Sounds/hit.wav');
    loader.load('pickup-fx', 'assets/Sounds/pickup.wav');
    loader.load('tick-fx', 'assets/Sounds/tick.wav');
  }

  T getAsset<T>(String name) => loader.get<T>(name);

  @override
  void ready() {
    print('game ready ...');
    _music = getAsset<Music>('world-1');
    _music.play();
    _music.loop = true;

    _currentScene = GameScene.GAME_SCENE_TITLE;
    _activeScene = TitleScene(this);
    _activeScene?.enter();
  }

  @override
  void draw(CanvasRenderingContext2D ctx) {
    _activeScene?.draw(ctx);
  }

  @override
  void update(double dt) {
    _fps = 1.0 / dt;
    setWindowTitle('fps: ${_fps.round()}');

    _activeScene?.update(dt);
  }

  void changeScene(GameScene newScene) {
    if (_currentScene == newScene) return;
    _activeScene?.exit();

    switch (newScene) {
      case GameScene.GAME_SCENE_TITLE:
        _activeScene = TitleScene(this);
        break;
      case GameScene.GAME_SCENE_ACTION:
        // this._activeScene = new ActionScene(this);
        break;
    }

    _currentScene = newScene;
    _activeScene?.enter();
  }
}
