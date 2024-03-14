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

// ignore_for_file: unnecessary_this

import 'dart:html';
import 'dart:math';

import 'dirt.dart';
import 'explosion.dart';
import 'game.dart';
import 'get_ready.dart';
import 'healthbar.dart';
import 'hero.dart';
import 'lib/bitmaptext.dart';
import 'lib/engine.dart';
import 'lib/sound.dart';
import 'mob.dart';
import 'powerups.dart';
import 'scene.dart';

class ActionScene extends BaseScene {
  final rng = Random();
  final List<Mob> _mobs = [];
  final List<Explosion> _explosions = [];
  final List<Dirt> _dirts = [];
  int _score = 0;
  int _hiScore = 0;
  bool _isGameOver = false;
  num _medkitSpawnTimer = 0;
  num _bombSpawnTimer = 0;
  bool _bombExploded = false;
  num _bombExplodeTimer = 0;
  int _medkitCollected = 0;
  int _bombCollected = 0;
  int _mobKilled = 0;
  num _mobSpawnTimer = 0;
  num _nextMob = 0;
  int _mobMissed = 0;
  late Hero _hero;
  late Healthbar _healthBar;
  late ImageSlice _forest;
  late BitmapText _text;
  late ImageSlice _ground;
  late ImageCache _backgroundCache;
  late GetReady _ready;
  late Medkit _medkit;
  late Bomb _bomb;
  late Sound _pickupFx;
  late Sound _explosionLongFx;
  late Sound _explosionFx;
  late Sound _hitFx;
  late GameOver _gameOver;

  ActionScene(super.game) {
    _hero = Hero(game, Vector2(300, 200));
    _healthBar = Healthbar(game);

    _forest = ImageSlice(game.getAsset<ImageElement>('forest'), 0, 0, 640, 312);
    _text = BitmapText(game.getAsset<ImageElement>('bitmapFont'));
    _ground = ImageSlice(game.getAsset<ImageElement>('ground'), 0, 0, 16, 16);
    _ready = GetReady(game);
    _gameOver = GameOver(game);
    _medkit = Medkit(game);
    _bomb = Bomb(game);

    _pickupFx = game.getAsset<Sound>('pickup-fx');
    _explosionLongFx = game.getAsset<Sound>('explosion_long-fx');
    _explosionFx = game.getAsset<Sound>('explosion-fx');
    _hitFx = game.getAsset<Sound>('hit-fx');

    this._backgroundCache = ImageCache(game.renderer.backbuffer);
  }

  @override
  void update(double dt) {
    if (game.input.isPressed(InputKey.KEY_ESCAPE)) {
      game.changeScene(GameScene.GAME_SCENE_TITLE);
      return;
    }

    // remove inactive entities
    _mobs.removeWhere((m) => !m.active);
    _dirts.removeWhere((m) => !m.active);
    _explosions.removeWhere((m) => !m.active);

    if (_isGameOver) {
      _gameOver.update(dt);
      _score = _gameOver.score;
      if (_score > _hiScore) {
        _hiScore = _score;
      }
    } else {
      _hero.update(dt);

      if (!_medkit.active) {
        medkitSpawn(dt);
      }

      if (!_bomb.active) {
        bombSpawn(dt);
      }

      if (_ready.isReady) {
        mobSpawn(dt);
      }
    }

    if (!_ready.isReady) {
      _ready.update(dt);
    }

    this.updateMedkit(dt);
    this.updateBomb(dt);
    this.updateMobs(dt);

    // update other entities
    _explosions.where((m) => m.active).forEach((m) => m.update(dt));
    _dirts.where((m) => m.active).forEach((m) => m.update(dt));

    if (_score > _hiScore) {
      _hiScore = _score;
    }
  }

  void bombSpawn(double dt) {
    _bombSpawnTimer += dt;
    if (_bombSpawnTimer > 30.0) {
      _bombSpawnTimer -= 30.0;
      _bomb.reset(32 + rng.nextDouble() * game.renderer.width - 32);
    }
  }

  void updateBomb(double dt) {
    if (_bombExploded) {
      _bombExplodeTimer += dt;
      if (_bombExplodeTimer > 0.2) {
        _bombExploded = true;
      }
    }

    if (_bomb.active) {
      _bomb.update(dt);
      if (!_isGameOver) {
        if (_bomb.hit(_hero)) {
          _explosionLongFx.play();
          _score += _bomb.points;
          _bombCollected++;

          _mobs.where((m) => m.active).forEach((m) {
            this.mobKilled(m);
          });
        }
      }
    }
  }

  void medkitSpawn(double dt) {
    _medkitSpawnTimer += dt;
    if (_medkitSpawnTimer > 20.0) {
      _medkitSpawnTimer -= 20.0;
      _medkit.reset(32 + rng.nextDouble() * game.renderer.width - 32);
    }
  }

  void updateMedkit(double dt) {
    this._medkit.update(dt);
    if (!this._isGameOver) {
      if (this._medkit.hit(this._hero)) {
        this._pickupFx.play();
        this._score = this._medkit.points;
        this._healthBar.increase(20);
        this._medkitCollected++;
      }
    }
  }

  void mobSpawn(double dt) {
    // Limit the number of mobs
    if (_mobs.length == 50) return;

    _mobSpawnTimer += dt;
    if (_mobSpawnTimer > _nextMob) {
      _mobSpawnTimer = 0;
      _nextMob = rng.nextDouble() * 0.8;

      final flipped = rng.nextDouble() > 0.5;
      final mobid = rng.nextDouble() * 100;

      Mob newMob;
      if (mobid < 10) {
        final position = Vector2(flipped ? 640 : -32, 280);
        newMob = MobSniky(game, flipped, position);
      } else if (mobid < 40 && mobid >= 10) {
        final position =
            Vector2(flipped ? 640 : -32, 280 - 32 + rng.nextDouble() * 32);
        newMob = MobBlue(game, flipped, position);
      } else if (mobid < 70 && mobid >= 40) {
        final position =
            Vector2(flipped ? 640 : -32, 280 - 32 + rng.nextDouble() * 32);
        newMob = MobBee(game, flipped, position);
      } else {
        final position = Vector2(flipped ? 640 : -32, 280);
        newMob = MobFoxy(game, flipped, position);
      }

      _mobs.add(newMob);
    }
  }

  void mobKilled(Mob mob) {
    ++this._mobKilled;
    this._explosionFx.play();

    final explosion = Explosion(game, mob.position);
    this._explosions.add(explosion);

    final dirt = Dirt(this.game, Vector2(mob.position.x, 280 + 32));
    this._dirts.add(dirt);

    this._score += mob.points;
    mob.active = false;
  }

  void updateMobs(double dt) {
    for (var m in this._mobs) {
      m.update(dt);

      if (!this._isGameOver) {
        if (!m.active) {
          ++this._mobMissed;
        } else if (this._hero.bulletHit(m)) {
          if (m.gotHit(this._hero)) {
            this.mobKilled(m);
          } else {
            this._hitFx.play();
          }
        } else if (this._hero.hit(m)) {
          this._healthBar.decrease();
          if (this._healthBar.health == 0) {
            this.heroDied();
          }
        }
      }
    }
  }

  void heroDied() {
    this._isGameOver = true;
    this._gameOver.set(this._mobKilled, this._mobMissed, this._medkitCollected,
        this._bombCollected, this._score);
    // this._gameOver.set(998, 127, 9, 4, 0);
  }

  @override
  void draw(CanvasRenderingContext2D ctx) {
    this._backgroundCache.draw(ctx, () {
      // forest
      this._forest.draw(ctx, 0, 0);

      // platform
      for (var i = 0; i < game.renderer.width / 32; ++i) {
        this._ground.draw(ctx, i * 32, 280 + 32,
            options: ImageSliceDrawOptions(scale: 2.0));
      }
    });

    // health
    this._healthBar.draw(ctx);

    // score
    this._text.draw(
        ctx, 2, 2, 'white', 'SCORE:${Util.formatNumber(this._score, 8, '0')}');
    this._text.draw(ctx, 368, 2, 'white',
        'HI-SCORE:${Util.formatNumber(this._hiScore, 8, '0')}');

    if (!this._ready.isReady) {
      this._ready.draw(ctx);
    }

    if (!this._isGameOver) {
      this._hero.draw(ctx);
      // Drawable.debug(ctx, this._hero.hitbox);
    }

    // draw other entities
    this._mobs.where((m) => m.active).forEach((m) => m.draw(ctx));
    this._dirts.where((m) => m.active).forEach((m) => m.draw(ctx));
    this._explosions.where((m) => m.active).forEach((m) => m.draw(ctx));

    if (this._medkit.active) {
      this._medkit.draw(ctx);
    }

    if (this._bomb.active) {
      this._bomb.draw(ctx);
    }

    if (this._isGameOver) {
      this._gameOver.draw(ctx);
    }
  }
}
