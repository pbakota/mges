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
    this._title = new ImageSlice(
        this.game.getAsset<ImageElement>('titleBitmap'), 0, 0, 640, 480);
    this._forest = new ImageSlice(
        this.game.getAsset<ImageElement>('forest'), 0, 0, 640, 312);
    this._text = new BitmapText(this.game.getAsset<ImageElement>('bitmapFont'));

    this._mobs = [
      new MobBee(this.game, false, new Vector2(80, 140), 0),
      new MobBlue(this.game, false, new Vector2(80, 180), 0),
      new MobSniky(this.game, false, new Vector2(80, 220), 0),
      new MobFoxy(this.game, false, new Vector2(80, 260), 0),
    ];

    this._bomb = new Bomb(game, new Vector2(80, 300));
    this._medkit = new Medkit(game, new Vector2(80, 340));
    this._hero = new HeroB(game, new Vector2(40, 40));

    this._backgroundCache = new ImageCache(game.renderer.backbuffer);
  }

  @override
  void draw(CanvasRenderingContext2D ctx) {
    // generate static cache
    this._backgroundCache.draw(ctx, () {
      // draw forest background
      this._forest.draw(ctx, 0, 0);
      ctx.fillStyle = FOREST_BASE_COLOR;
      ctx.fillRect(0, 312, 640, 168);

      // draw 'rabbit unleashed'
      this._title.draw(ctx, 0, 0);

      this._text.draw(ctx, 120, 150, 'white',
          'BEE .......... ${Util.formatNumber(this._mobs[0].points, 3)} POINTS');
      this._text.draw(ctx, 120, 190, 'white',
          'BLUE ......... ${Util.formatNumber(this._mobs[1].points, 3)} POINTS');
      this._text.draw(ctx, 120, 230, 'white',
          'SNIKY ........ ${Util.formatNumber(this._mobs[2].points, 3)} POINTS');
      this._text.draw(ctx, 120, 270, 'white',
          'FOXY ......... ${Util.formatNumber(this._mobs[3].points, 3)} POINTS');

      // powerups
      this._text.draw(ctx, 120, 310, 'white',
          'BOMB ......... ${Util.formatNumber(this._bomb.points, 3)} POINTS');
      this._text.draw(ctx, 120, 350, 'white',
          'MEDKIT ....... ${Util.formatNumber(this._medkit.points, 3)} POINTS');

      // information
      this._text.draw(ctx, 140, 420, 'white', "PRESS \"FIRE\" TO START");
      this._text.draw(ctx, 208, 480 - 18, 'gray',
          "PRESS \"F11\" FOR FULLSCREEN", new DrawTextOptions(scale: 1.0));

      // powerups
      this._bomb.draw(ctx);
      this._medkit.draw(ctx);
    });

    // draw zoomed here at the corner
    this._hero.draw(ctx);

    // mobs
    this._mobs.forEach((m) => m.draw(ctx));
  }

  @override
  void update(double dt) {
    // update mobs
    this._mobs.forEach((m) => m.update(dt));

    // update hero
    this._hero.update(dt);

    // check for game start
    if (this.game.input.isPressed(InputKey.KEY_FIRE)) {
      this.game.changeScene(GameScene.GAME_SCENE_ACTION);
    }
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}
