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

import 'game.dart';
import 'lib/engine.dart';
import 'lib/sprite.dart';

class Dirt extends Drawable {
  num _alpha = 1.0;
  bool _active = true;
  num _alphaTimer = 0;
  late ImageSlice _frame;

  Dirt(Game game, super.position) {
    this._frame =
        ImageSlice(game.getAsset<ImageElement>('blood-ground'), 0, 0, 16, 16);
  }

  bool get active => this._active;

  @override
  void update(double dt) {
    this._alphaTimer += dt;
    if (this._alphaTimer > 0.2) {
      this._alphaTimer = 0;
      this._alpha -= 0.01;
      if (this._alpha < 0.01) {
        this._alpha = 0;
        this._active = false;
      }
    }
  }

  @override
  void draw(CanvasRenderingContext2D ctx) {
    this._frame.draw(ctx, this.position.x, this.position.y,
        options: ImageSliceDrawOptions(scale: 2.0, alpha: this._alpha));
  }
}
