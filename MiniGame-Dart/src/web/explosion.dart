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

// ignore_for_file: unnecessary_this, unnecessary_new

import 'dart:html';

import 'game.dart';
import 'lib/engine.dart';
import 'lib/sprite.dart';

class Explosion extends Drawable {
  late List<ImageSlice> _frames;
  num _animTimer = 0;
  int _animFrame = 0;
  bool _active = true;

  Explosion(Game game, Vector2 position) : super(position) {
    final image = game.getAsset<ImageElement>('explosion');
    this._frames = [
      new ImageSlice(image, 0 * 16, 0, 16, 16),
      new ImageSlice(image, 1 * 16, 0, 16, 16),
      new ImageSlice(image, 2 * 16, 0, 16, 16),
      new ImageSlice(image, 3 * 16, 0, 16, 16),
      new ImageSlice(image, 4 * 16, 0, 16, 16),
      new ImageSlice(image, 5 * 16, 0, 16, 16),
      new ImageSlice(image, 6 * 16, 0, 16, 16),
      new ImageSlice(image, 7 * 16, 0, 16, 16),
      new ImageSlice(image, 8 * 16, 0, 16, 16),
      new ImageSlice(image, 9 * 16, 0, 16, 16),
      new ImageSlice(image, 10 * 16, 0, 16, 16),
      new ImageSlice(image, 11 * 16, 0, 16, 16),
    ];
  }

  bool get active => this._active;

  @override
  void update(double dt) {
    if (!this._active) return;

    this._animTimer += dt;
    if (this._animTimer > 0.05) {
      this._animTimer -= 0.05;
      if (++this._animFrame == 12) {
        this._active = false;
      }
    }
  }

  @override
  void draw(CanvasRenderingContext2D ctx) {
    _frames[this._animFrame].draw(ctx, this.position.x, this.position.y,
        options: ImageSliceDrawOptions(scale: 2.0));
  }
}
