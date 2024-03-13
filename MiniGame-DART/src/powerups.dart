import 'dart:html';

import 'actor.dart';
import 'game.dart';
import 'lib/engine.dart';
import 'lib/sprite.dart';

class Powerup extends Actor {
  ImageSlice _image;
  int _points;
  bool _active = false;
  num _alpha = 100;
  num _waitTimer = 0;

  Powerup(ImageSlice image, int points, [Vector2? position, Vector2? velocity])
      : this._image = image,
        this._points = points,
        super(false, position, velocity);

  int get points => this._points;

  void set active(bool val) => this._active = val;
  bool get active => this._active;

  void update(double dt) {
    if (this.position.y < 280) {
      this.velocity.y += STANDARD_GRAVITY;
      this.position.y += dt * this.velocity.y;
    } else {
      this.position.y = 280;
      this._waitTimer += dt;
      if (this._waitTimer > 3.0) {
        if (this._alpha < 0.1) {
          this._alpha = 0;
          this._active = false;
        } else {
          this._alpha -= 0.1;
        }
      }
    }
  }

  Rect get hitbox => new Rect(this.position.x, this.position.y, 32, 32);

  void draw(CanvasRenderingContext2D ctx) {
    this._image.draw(ctx, this.position.x, this.position.y,
        options: new ImageSliceDrawOptions(scale: 2.0, alpha: this._alpha));
  }

  bool hit(Actor opponent) {
    if (!this._active) return false;
    if (Drawable.aabb(this.hitbox, opponent.hitbox)) {
      this._active = false;
      return true;
    }
    return false;
  }

  void reset(num x) {
    this.position = new Vector2(x, 100);
    this.velocity.y = 50.0;
    this._waitTimer = 0;
    this._alpha = 1.0;
    this._active = true;
  }
}

class Medkit extends Powerup {
  Medkit(Game game, [Vector2? position])
      : super(
            new ImageSlice(game.getAsset<ImageElement>('medkit'), 0, 0, 16, 16),
            500,
            position ?? new Vector2(0, 0));
}

class Bomb extends Powerup {
  Bomb(Game game, [Vector2? position])
      : super(new ImageSlice(game.getAsset<ImageElement>('bomb'), 0, 0, 16, 16),
            500, position ?? new Vector2(0, 0));
}
