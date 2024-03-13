import 'dart:html';

import 'actor.dart';
import 'game.dart';
import 'lib/engine.dart';
import 'lib/sprite.dart';

abstract class Mob extends Actor {
  List<ImageSlice> _frames;
  late bool _active;
  late num _speed;
  late int _points;
  late num _hp;
  num _animTimer = 0;
  int _animFrame = 0;

  Mob(super.position, this._frames, super.flipped, this._hp, this._speed,
      this._points) {
    this._active = true;
    this.velocity = new Vector2(this.flipped ? -this._speed : this._speed, 0);
  }

  int get points => this._points;

  bool get active => this._active;
  void set active(bool val) => this._active = val;

  @override
  void update(double dt) {
    if (this.flipped) {
      if (this.velocity.x > 0) {
        this.velocity.x -= 1.0;
        if (this.velocity.x < 1.0) {
          this.velocity.x = -this._speed;
        }
      }
    } else {
      if (this.velocity.x < 0) {
        this.velocity.x += 1.0;
        if (this.velocity.x >= 0.0) {
          this.velocity.x = this._speed;
        }
      }
    }
    this.position.x += dt * this.velocity.x;
    this._animTimer += dt;
    if (this._animTimer > 0.25) {
      this._animTimer = 0.0;
      this._animFrame = 1 - this._animFrame;
    }

    if (this.position.x < -32.0 || this.position.x >= 640) {
      this._active = false;
    }
  }

  @override
  void draw(CanvasRenderingContext2D ctx) {
    this._frames[this._animFrame].draw(ctx, this.position.x, this.position.y,
        options: new ImageSliceDrawOptions(scale: 2.0, hflip: this.flipped));
    // Actor.debug(ctx, this.hitbox);
  }

  @override
  bool hit(Actor opponent) {
    if (Drawable.aabb(this.hitbox, opponent.hitbox)) {}
    return false;
  }

  bool gotHit(Actor hero) {
    if (this._hp-- <= 0) return true;
    this.velocity.x = hero.flipped ? -this._speed * 1.2 : this._speed * 1.2;
    return false;
  }
}

class MobBee extends Mob {
  MobBee(Game game, bool flipped, Vector2 position, [num speed = 40])
      : super(
            flipped,
            [
              new ImageSlice(
                  game.getAsset<ImageElement>('bee1a'), 0, 0, 16, 16),
              new ImageSlice(
                  game.getAsset<ImageElement>('bee2a'), 0, 0, 16, 16),
            ],
            position,
            2,
            speed,
            20);

  Rect get hitbox => new Rect(this.position.x + 4, this.position.y + 4, 24, 24);
}

class MobBlue extends Mob {
  MobBlue(Game game, bool flipped, Vector2 position, [num speed = 60])
      : super(
            flipped,
            [
              new ImageSlice(
                  game.getAsset<ImageElement>('blue1a'), 0, 0, 16, 16),
              new ImageSlice(
                  game.getAsset<ImageElement>('blue2a'), 0, 0, 16, 16),
            ],
            position,
            3,
            speed,
            50);

  Rect get hitbox => new Rect(this.position.x + 4, this.position.y + 4, 24, 24);
}

class MobFoxy extends Mob {
  MobFoxy(Game game, bool flipped, Vector2 position, [num speed = 50])
      : super(
            flipped,
            [
              new ImageSlice(
                  game.getAsset<ImageElement>('foxy1a'), 0, 0, 16, 16),
              new ImageSlice(
                  game.getAsset<ImageElement>('foxy2a'), 0, 0, 16, 16),
            ],
            position,
            2,
            speed,
            100);
  
  Rect get hitbox => new Rect(this.position.x, this.position.y + 12, 26, 20);
}

class MobSniky extends Mob {
  MobSniky(Game game, bool flipped, Vector2 position, [num speed = 10])
      : super(
            flipped,
            [
              new ImageSlice(
                  game.getAsset<ImageElement>('sniky1a'), 0, 0, 16, 16),
              new ImageSlice(
                  game.getAsset<ImageElement>('sniky2a'), 0, 0, 16, 16),
            ],
            position,
            2,
            speed,
            200);
  
  Rect get hitbox => new Rect(this.position.x, this.position.y + 17, 32, 15);
}
