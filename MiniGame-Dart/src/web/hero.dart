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

import 'dart:html';

import 'actor.dart';
import 'bullet.dart';
import 'game.dart';
import 'lib/engine.dart';
import 'lib/sound.dart';
import 'lib/sprite.dart';
import 'mob.dart';

class Hero extends Actor {
  final List<ImageSlice> _frames;
  final List<HeroBullet> _bullets = [];
  num _bulletTime = 0;
  num _animTimer = 0;
  int _animFrame = 0;
  bool _ground = false;
  bool _superSize = false;
  num _superSizeTimer = 0;
  final Sound _fireFx;
  final Game _game;

  Hero(Game game, Vector2 position)
      : _game = game,
        _fireFx = game.getAsset<Sound>('fire-fx'),
        _frames = [
          ImageSlice(game.getAsset<ImageElement>('hero1a'), 0, 0, 16, 16),
          ImageSlice(game.getAsset<ImageElement>('hero2a'), 0, 0, 16, 16),
        ],
        super(false, position, Vector2(0, 0)) {
    _fireFx.volume = 0.2;
  }

  @override
  bool hit(Actor opponent) => Drawable.aabb(hitbox, opponent.hitbox);

  @override
  Rect get hitbox => Rect(position.x, position.y, 32, 32);

  @override
  void update(double dt) {
    // remove inactive bullets
    _bullets.removeWhere((b) => !b.active);

    if (velocity.x != 0) {
      _animTimer += dt;
      if (_animTimer > 0.225) {
        _animTimer = 0;
        _animFrame = 1 - _animFrame;
      }

      if (velocity.x > 0) {
        velocity.x -= 3.0;
      } else if (velocity.x < 0) {
        velocity.x += 3.0;
      }

      if (velocity.x > -1.0 && velocity.x < 1.0) {
        velocity.x = 0;
        _animFrame = 0;
        _animTimer = 0;
      }
    }

    if (!_ground) {
      velocity.y += STANDARD_GRAVITY;
    }

    position.x += velocity.x * dt;
    position.y += velocity.y * dt;

    if (velocity.x > 0) flipped = false;
    if (velocity.x < 0) flipped = true;

    if (!_ground) {
      _animFrame = 1;
    } else if (velocity.x == 0) {
      _animFrame = 0;
    }

    if (_game.input.isDown(InputKey.KEY_FIRE)) {
      _superSizeTimer += dt;
      if (_superSizeTimer >= 3.0) {
        _superSize = true;
      }
      if (_bulletTime == 0.0) {
        if (_bullets.length < 5) {
          // play fire-fx
          _fireFx.play();

          final p = Vector2((flipped ? position.x : position.x + 20),
              (_superSize ? position.y + 4 : position.y + 12));

          final v = Vector2(flipped ? -300 : 300, 0);
          final newBullet = HeroBullet(_game, flipped, p, v);

          if (_superSize) {
            newBullet.supersize();
            _superSize = false;
            _superSizeTimer = 0;
          }

          _bullets.add(newBullet);
        }
      }

      _bulletTime += dt;
      if (_bulletTime > 0.2) {
        _bulletTime = 0;
      }
    } else {
      _superSize = false;
      _superSizeTimer = 0;
      _bulletTime = 0;
    }

    // move left or right
    if (_game.input.isDown(InputKey.KEY_LEFT) && velocity.x > -100.0) {
      velocity.x -= 15;
    }
    if (_game.input.isDown(InputKey.KEY_RIGHT) && velocity.x < 100.0) {
      velocity.x += 15;
    }

    // hit the ground?
    if (position.y > 280) {
      position.y = 280;
      _ground = true;
      velocity.y = 0;
    }

    // jump
    if (_game.input.isDown(InputKey.KEY_UP)) {
      if (_ground) {
        velocity.y = -200.0;
        _ground = false;
      }
    }

    for (var b in _bullets) {
      b.update(dt);
    }
  }

  bool bulletHit(Mob mob) {
    final hb = mob.hitbox;
    for (var b in _bullets.where((m) => m.active)) {
      if (Drawable.aabb(hb, b.hitbox)) {
        if (!b.isSupersized) {
          b.active = false;
        }
        return true;
      }
    }
    return false;
  }

  @override
  void draw(CanvasRenderingContext2D ctx) {
    _bullets.where((b) => b.active).forEach((b) => b.draw(ctx));
    _frames[_animFrame].draw(ctx, position.x, position.y,
        options: ImageSliceDrawOptions(hflip: flipped, scale: 2.0));
  }
}

class HeroBullet extends Bullet {
  final bool _flipped;
  bool _superSize;

  HeroBullet(Game game, bool flipped, Vector2 position, Vector2 velocity)
      : _flipped = flipped,
        _superSize = false,
        super(ImageSlice(game.getAsset<ImageElement>('bullet'), 0, 0, 16, 16),
            position, velocity);

  void supersize() => _superSize = true;
  bool get isSupersized => _superSize;

  @override
  void update(double dt) {
    position.x += velocity.x * dt;
    if (position.x < -16 || position.x > 640) active = false;
  }

  @override
  void draw(CanvasRenderingContext2D ctx) {
    image.draw(ctx, position.x, position.y,
        options: ImageSliceDrawOptions(
            hflip: _flipped, scale: (_superSize ? 2.0 : 1.0)));
    // Actor.debug(ctx, this.hitbox);
  }

  @override
  Rect get hitbox {
    return _superSize
        ? Rect(_flipped ? position.x + 4 : position.x, position.y + 12, 24, 12)
        : Rect(_flipped ? position.x + 16 : position.x, position.y + 6, 16, 6);
  }

  @override
  bool hit(Actor opponent) {
    throw UnimplementedError();
  }
}

class HeroB extends Drawable {
  final List<ImageSlice> _frames;
  num _animTimer;
  int _animFrame;

  HeroB(Game game, Vector2 super.position)
      : _frames = [
          ImageSlice(game.getAsset<ImageElement>('hero1b'), 0, 0, 64, 64),
          ImageSlice(game.getAsset<ImageElement>('hero2b'), 0, 0, 64, 64),
        ],
        _animTimer = 0,
        _animFrame = 0;

  @override
  void update(double dt) {
    _animTimer += dt;
    if (_animTimer > 0.3) {
      _animTimer = 0.0;
      _animFrame = 1 - _animFrame;
    }
  }

  @override
  draw(CanvasRenderingContext2D ctx) {
    _frames[_animFrame].draw(ctx, position.x, position.y);
  }
}
