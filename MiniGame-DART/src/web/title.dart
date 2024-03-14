import 'dart:html';

import 'game.dart';
import 'hero.dart';
import 'lib/bitmaptext.dart';
import 'lib/engine.dart';
import 'mob.dart';
import 'powerups.dart';
import 'scene.dart';

const String FOREST_BASE_COLOR = '#0c1122';

class TitleScene implements BaseScene {
  late ImageSlice _title;
  late ImageSlice _forest;
  late BitmapText _text;

  late List<Mob> _mobs;
  late Bomb _bomb;
  late Medkit _medkit;
  late HeroB _hero;

  late ImageCache _backgroundCache;

  TitleScene(Game game) {
    _title = ImageSlice(
        this.game.getAsset<ImageElement>('titleBitmap'), 0, 0, 640, 480);
    _forest = ImageSlice(
        this.game.getAsset<ImageElement>('forest'), 0, 0, 640, 312);
    _text = BitmapText(this.game.getAsset<ImageElement>('bitmapFont'));

    _mobs = [
      MobBee(this.game, false, Vector2(80, 140), 0),
      MobBlue(this.game, false, Vector2(80, 180), 0),
      MobSniky(this.game, false, Vector2(80, 220), 0),
      MobFoxy(this.game, false, Vector2(80, 260), 0),
    ];

    _bomb = Bomb(game, Vector2(80, 300));
    _medkit = Medkit(game, Vector2(80, 340));
    _hero = HeroB(game, Vector2(40, 40));

    _backgroundCache = ImageCache(game.renderer.backbuffer);
  }

  @override
  void draw(CanvasRenderingContext2D ctx) {
    // generate static cache
    _backgroundCache.draw(ctx, () {
      // draw forest background
      _forest.draw(ctx, 0, 0);
      ctx.fillStyle = FOREST_BASE_COLOR;
      ctx.fillRect(0, 312, 640, 168);

      // draw 'rabbit unleashed'
      _title.draw(ctx, 0, 0);

      _text.draw(ctx, 120, 150, 'white',
          'BEE .......... ${Util.formatNumber(_mobs[0].points, 3)} POINTS');
      _text.draw(ctx, 120, 190, 'white',
          'BLUE ......... ${Util.formatNumber(_mobs[1].points, 3)} POINTS');
      _text.draw(ctx, 120, 230, 'white',
          'SNIKY ........ ${Util.formatNumber(_mobs[2].points, 3)} POINTS');
      _text.draw(ctx, 120, 270, 'white',
          'FOXY ......... ${Util.formatNumber(_mobs[3].points, 3)} POINTS');

      // powerups
      _text.draw(ctx, 120, 310, 'white',
          'BOMB ......... ${Util.formatNumber(_bomb.points, 3)} POINTS');
      _text.draw(ctx, 120, 350, 'white',
          'MEDKIT ....... ${Util.formatNumber(_medkit.points, 3)} POINTS');

      // information
      _text.draw(ctx, 140, 420, 'white', "PRESS \"FIRE\" TO START");
      _text.draw(ctx, 208, 480 - 18, 'gray',
          "PRESS \"F11\" FOR FULLSCREEN", DrawTextOptions(scale: 1.0));

      // powerups
      _bomb.draw(ctx);
      _medkit.draw(ctx);
    });

    // draw zoomed here at the corner
    _hero.draw(ctx);

    // mobs
    for (var m in _mobs) {
      m.draw(ctx);
    }
  }

  @override
  void update(double dt) {
    // update mobs
    for (var m in _mobs) {
      m.update(dt);
    }

    // update hero
    _hero.update(dt);

    // check for game start
    if (game.input.isPressed(InputKey.KEY_FIRE)) {
      game.changeScene(GameScene.GAME_SCENE_ACTION);
    }
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}
