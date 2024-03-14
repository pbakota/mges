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

class Powerup extends Actor {
  final ImageSlice _image;
  final int _points;
  bool active = false;
  num _alpha = 100;
  num _waitTimer = 0;

  Powerup(ImageSlice image, int points, [Vector2? position, Vector2? velocity])
      : _image = image,
        _points = points,
        super(false, position, velocity);

  int get points => _points;

  @override
  void update(double dt) {
    if (position.y < 280) {
      velocity.y += STANDARD_GRAVITY;
      position.y += dt * velocity.y;
    } else {
      position.y = 280;
      _waitTimer += dt;
      if (_waitTimer > 3.0) {
        if (_alpha < 0.1) {
          _alpha = 0;
          active = false;
        } else {
          _alpha -= 0.1;
        }
      }
    }
  }

  @override
  Rect get hitbox => Rect(position.x, position.y, 32, 32);

  @override
  void draw(CanvasRenderingContext2D ctx) {
    _image.draw(ctx, position.x, position.y,
        options: ImageSliceDrawOptions(scale: 2.0, alpha: _alpha));
  }

  @override
  bool hit(Actor opponent) {
    if (!active) return false;
    if (Drawable.aabb(hitbox, opponent.hitbox)) {
      active = false;
      return true;
    }
    return false;
  }

  void reset(num x) {
    position = Vector2(x, 100);
    velocity.y = 50.0;
    _waitTimer = 0;
    _alpha = 1.0;
    active = true;
  }
}

class Medkit extends Powerup {
  Medkit(Game game, [Vector2? position])
      : super(
            ImageSlice(game.getAsset<ImageElement>('medkit'), 0, 0, 16, 16),
            500,
            position ?? Vector2(0, 0));
}

class Bomb extends Powerup {
  Bomb(Game game, [Vector2? position])
      : super(ImageSlice(game.getAsset<ImageElement>('bomb'), 0, 0, 16, 16),
            500, position ?? Vector2(0, 0));
}
