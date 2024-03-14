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
import 'lib/engine.dart';
import 'lib/sprite.dart';

const int MAX_ENERGY = 100;
const int MAX_HEIGHT = 96;

class Healthbar extends Drawable {
  int _health;
  final ImageElement _image;

  Healthbar(Game game)
      : _image = game.getAsset<ImageElement>('energybar'),
        _health = MAX_ENERGY,
        super(Vector2(10, 30));

  int get health => _health;
  void reset() {
    _health = MAX_ENERGY;
  }

  void decrease([int amount = 1]) {
    _health -= amount;
    if (_health < 0) _health = 0;
  }

  void increase([int amount = 1]) {
    _health += amount;
    if (_health > MAX_ENERGY) {
      _health = MAX_ENERGY;
    }
  }

  @override
  void draw(CanvasRenderingContext2D ctx) {
    final p = (_health / MAX_ENERGY * MAX_HEIGHT).round();
    ctx.drawImageScaledFromSource(_image, 0, 0, 8, p, position.x, position.y, 8, p);
  }
}
