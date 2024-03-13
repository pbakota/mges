import 'dart:html';

import 'engine.dart';

abstract class Sprite {
  late Vector2 position;
  void draw(CanvasRenderingContext2D ctx);
}

abstract class Drawable implements Sprite {
  Vector2 position;
  Drawable([Vector2? position]) : this.position = position ?? new Vector2(0, 0);

  void update(double dt) {}

  /**
   * AABB implementation
   * @param rect1
   * @param rect2
   * @returns boolean
   */
  static bool aabb(Rect rect1, Rect rect2) {
    return (rect1.x < rect2.x + rect2.w &&
        rect1.x + rect1.w > rect2.x &&
        rect1.y < rect2.y + rect2.h &&
        rect1.h + rect1.y > rect2.y);
  }

  /**
   * Draw box overlay over sprite
   * @param ctx
   * @param hb
   */
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
      : this.velocity = velocity ?? new Vector2(0, 0),
        super(position ?? new Vector2(0, 0));
}
