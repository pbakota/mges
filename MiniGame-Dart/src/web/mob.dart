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
import 'game.dart';
import 'lib/engine.dart';
import 'lib/sprite.dart';

abstract class Mob extends Actor {
  final List<ImageSlice> _frames;
  late bool active;
  late final num _speed;
  late final int _points;
  late num _hp;
  num _animTimer = 0;
  int _animFrame = 0;

  Mob(super.position, this._frames, super.flipped, this._hp, this._speed,
      this._points) {
    active = true;
    velocity = Vector2(flipped ? -_speed : _speed, 0);
  }

  int get points => _points;

  @override
  void update(double dt) {
    if (flipped) {
      if (velocity.x > 0) {
        velocity.x -= 1.0;
        if (velocity.x < 1.0) {
          velocity.x = -_speed;
        }
      }
    } else {
      if (velocity.x < 0) {
        velocity.x += 1.0;
        if (velocity.x >= 0.0) {
          velocity.x = _speed;
        }
      }
    }
    position.x += dt * velocity.x;
    _animTimer += dt;
    if (_animTimer > 0.25) {
      _animTimer = 0.0;
      _animFrame = 1 - _animFrame;
    }

    if (position.x < -32.0 || position.x >= 640) {
      active = false;
    }
  }

  @override
  void draw(CanvasRenderingContext2D ctx) {
    _frames[_animFrame].draw(ctx, position.x, position.y,
        options: ImageSliceDrawOptions(scale: 2.0, hflip: flipped));
    // Actor.debug(ctx, this.hitbox);
  }

  @override
  bool hit(Actor opponent) {
    if (Drawable.aabb(hitbox, opponent.hitbox)) {}
    return false;
  }

  bool gotHit(Actor hero) {
    if (_hp-- <= 0) return true;
    velocity.x = hero.flipped ? -_speed * 1.2 : _speed * 1.2;
    return false;
  }
}

class MobBee extends Mob {
  MobBee(Game game, bool flipped, Vector2 position, [num speed = 40])
      : super(
            flipped,
            [
              ImageSlice(game.getAsset<ImageElement>('bee1a'), 0, 0, 16, 16),
              ImageSlice(game.getAsset<ImageElement>('bee2a'), 0, 0, 16, 16),
            ],
            position,
            2,
            speed,
            20);

  @override
  Rect get hitbox => Rect(position.x + 4, position.y + 4, 24, 24);
}

class MobBlue extends Mob {
  MobBlue(Game game, bool flipped, Vector2 position, [num speed = 60])
      : super(
            flipped,
            [
              ImageSlice(game.getAsset<ImageElement>('blue1a'), 0, 0, 16, 16),
              ImageSlice(game.getAsset<ImageElement>('blue2a'), 0, 0, 16, 16),
            ],
            position,
            3,
            speed,
            50);

  @override
  Rect get hitbox => Rect(position.x + 4, position.y + 4, 24, 24);
}

class MobFoxy extends Mob {
  MobFoxy(Game game, bool flipped, Vector2 position, [num speed = 50])
      : super(
            flipped,
            [
              ImageSlice(game.getAsset<ImageElement>('foxy1a'), 0, 0, 16, 16),
              ImageSlice(game.getAsset<ImageElement>('foxy2a'), 0, 0, 16, 16),
            ],
            position,
            2,
            speed,
            100);

  @override
  Rect get hitbox => Rect(position.x, position.y + 12, 26, 20);
}

class MobSniky extends Mob {
  MobSniky(Game game, bool flipped, Vector2 position, [num speed = 10])
      : super(
            flipped,
            [
              ImageSlice(game.getAsset<ImageElement>('sniky1a'), 0, 0, 16, 16),
              ImageSlice(game.getAsset<ImageElement>('sniky2a'), 0, 0, 16, 16),
            ],
            position,
            2,
            speed,
            200);

  @override
  Rect get hitbox => Rect(position.x, position.y + 17, 32, 15);
}
