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

import 'engine.dart';

abstract class Sprite {
  late Vector2 position;
  void draw(CanvasRenderingContext2D ctx);
}

abstract class Drawable implements Sprite {
  @override
  Vector2 position;
  Drawable([Vector2? position]) : position = position ?? Vector2(0, 0);

  void update(double dt) {}

  /// AABB 
  /// @param rect1
  /// @param rect2
  /// @returns boolean
  static bool aabb(Rect rect1, Rect rect2) {
    return (rect1.x < rect2.x + rect2.w &&
        rect1.x + rect1.w > rect2.x &&
        rect1.y < rect2.y + rect2.h &&
        rect1.h + rect1.y > rect2.y);
  }

  /// Draw box overlay over sprite
  /// @param ctx
  /// @param hb
  static void debug(CanvasRenderingContext2D ctx, Rect hb) {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(hb.x, hb.y, hb.w, hb.h);
    ctx.stroke();
  }
}

abstract class Movable extends Drawable {
  Vector2 velocity;
  Movable([Vector2? position, Vector2? velocity])
      : velocity = velocity ?? Vector2(0, 0),
        super(position ?? Vector2(0, 0));
}
