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

// ignore_for_file: constant_identifier_names

import 'dart:html';

import 'game.dart';
import 'hero.dart';
import 'lib/bitmaptext.dart';
import 'lib/engine.dart';
import 'mob.dart';
import 'powerups.dart';
import 'scene.dart';

const String FOREST_BASE_COLOR = '#0c1122';

class TitleScene extends BaseScene {
  late ImageSlice _title;
  late ImageSlice _forest;
  late BitmapText _text;

  late List<Mob> _mobs;
  late Bomb _bomb;
  late Medkit _medkit;
  late HeroB _hero;

  late ImageCache _backgroundCache;

  TitleScene(Game game):super(game) {
    _title = ImageSlice(
        game.getAsset<ImageElement>('titleBitmap'), 0, 0, 640, 480);
    _forest = ImageSlice(
        game.getAsset<ImageElement>('forest'), 0, 0, 640, 312);
    _text = BitmapText(game.getAsset<ImageElement>('bitmapFont'));

    _mobs = [
      MobBee(game, false, Vector2(80, 140), 0),
      MobBlue(game, false, Vector2(80, 180), 0),
      MobSniky(game, false, Vector2(80, 220), 0),
      MobFoxy(game, false, Vector2(80, 260), 0),
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
}
