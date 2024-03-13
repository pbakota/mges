import 'dart:html';
import 'lib/engine.dart';
import 'lib/sound.dart';
import 'scene.dart';
import 'title.dart';

enum GameScene { GAME_SCENE_TITLE, GAME_SCENE_ACTION }

final double displayScale = 1.8;
final Vector2 displaySize = new Vector2(640, 480);

class Game extends Engine {
  Input _input;
  num _fps;
  late Music _music;
  GameScene _currentScene = GameScene.GAME_SCENE_TITLE;
  BaseScene? _activeScene = null;

  Game()
      : this._fps = 0,
        this._input = new Input(),
        super(new EngineOptions(allowPause: false)) {
    this
        .renderer
        .options(displaySize.x.toInt(), displaySize.y.toInt(), displayScale);
  }

  @override
  void enterFullscreen() {
    print('Entering fullscreen');
    this.renderer.resize(window.innerWidth!, window.innerHeight!, displayScale);
  }

  @override
  void leaveFullscreen() {
    print('Leaving fullscreen');
    this
        .renderer
        .options(displaySize.x.toInt(), displaySize.y.toInt(), displayScale);
  }

  Input get input => this._input;

  @override
  void init() {
    print('loading game assets ...');

    this.loader.load('forest', 'assets/Bitmaps/background.png');
    this.loader.load('titleBitmap', 'assets/Bitmaps/title.png');
    this.loader.load('elements', 'assets/Bitmaps/elements.png');
    this.loader.load('bitmapFont', 'assets/Fonts/font.png');

    this.loader.load('bee1a', 'assets/Sprites/bee1a.png');
    this.loader.load('bee2a', 'assets/Sprites/bee2a.png');

    this.loader.load('blue1a', 'assets/Sprites/blue1a.png');
    this.loader.load('blue2a', 'assets/Sprites/blue2a.png');

    this.loader.load('sniky1a', 'assets/Sprites/sniky1.png');
    this.loader.load('sniky2a', 'assets/Sprites/sniky2.png');

    this.loader.load('foxy1a', 'assets/Sprites/roka1.png');
    this.loader.load('foxy2a', 'assets/Sprites/roka2.png');

    this.loader.load('hero1a', 'assets/Sprites/hero1.png');
    this.loader.load('hero2a', 'assets/Sprites/hero2.png');

    // hero - big for title
    this.loader.load('hero1b', 'assets/Sprites/hero1b.png');
    this.loader.load('hero2b', 'assets/Sprites/hero2b.png');

    this.loader.load('bomb', 'assets/Sprites/bombball.png');
    this.loader.load('medkit', 'assets/Sprites/medkit.png');
    this.loader.load('explosion', 'assets/Sprites/explosion-4.png');
    this.loader.load('bullet', 'assets/Sprites/bullet.png');

    // blood ground
    this.loader.load('blood-ground', 'assets/Sprites/blood_tile.png');

    // blood particle
    this.loader.load('blood-particle', 'assets/Sprites/blood.png');

    // music
    this.loader.load('world-1', 'assets/Sounds/world_1.ogg');

    // healthbar
    this.loader.load('energybar', 'assets/Sprites/healthbar.png');

    // ground
    this.loader.load('ground', 'assets/Sprites/tile_0004.png');

    // explosion
    this.loader.load('explosion', 'assets/Sprites/explosion-4.png');

    // sound fx
    this.loader.load('explosion_long-fx', 'assets/Sounds/explosion_long.wav');
    this.loader.load('explosion-fx', 'assets/Sounds/explosion.wav');
    this.loader.load('fire-fx', 'assets/Sounds/fire.wav');
    this.loader.load('hit-fx', 'assets/Sounds/hit.wav');
    this.loader.load('pickup-fx', 'assets/Sounds/pickup.wav');
    this.loader.load('tick-fx', 'assets/Sounds/tick.wav');
  }

  T getAsset<T>(String name) => this.loader.get<T>(name);

  @override
  void ready() {
    print('game ready ...');
    this._music = this.getAsset<Music>('world-1');
    this._music.play();
    this._music.loop = true;

    this._currentScene = GameScene.GAME_SCENE_TITLE;
    this._activeScene = new TitleScene(this);
    this._activeScene?.enter();
  }

  @override
  void draw(CanvasRenderingContext2D ctx) {
    this._activeScene?.draw(ctx);
  }

  @override
  void update(double dt) {
    this._fps = 1.0 / dt;
    this.setWindowTitle('fps: ${this._fps.round()}');

    this._activeScene?.update(dt);
  }

  void changeScene(GameScene newScene) {
    if (this._currentScene == newScene) return;
    this._activeScene?.exit();

    switch (newScene) {
      case GameScene.GAME_SCENE_TITLE:
        this._activeScene = new TitleScene(this);
        break;
      case GameScene.GAME_SCENE_ACTION:
        // this._activeScene = new ActionScene(this);
        break;
    }

    this._currentScene = newScene;
    this._activeScene?.enter();
  }
}
