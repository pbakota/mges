import 'dart:html';

import 'actor.dart';
import 'bullet.dart';
import 'game.dart';
import 'lib/engine.dart';
import 'lib/sound.dart';
import 'lib/sprite.dart';
import 'mob.dart';

class Hero extends Actor {
  List<ImageSlice> _frames;
  List<HeroBullet> _bullets = [];
  num _bulletTime = 0;
  num _animTimer = 0;
  int _animFrame = 0;
  bool _ground = false;
  bool _superSize = false;
  num _superSizeTimer = 0;
  Sound _fireFx;
  Game _game;

  Hero(Game game, Vector2 position)
      : this._game = game,
        this._fireFx = game.getAsset<Sound>('fire-fx'),
        this._frames = [
          new ImageSlice(game.getAsset<ImageElement>('hero1a'), 0, 0, 16, 16),
          new ImageSlice(game.getAsset<ImageElement>('hero2a'), 0, 0, 16, 16),
        ],
        super(false, position, new Vector2(0, 0)) {
    this._fireFx.volume = 0.2;
  }

  @override
  bool hit(Actor opponent) => Drawable.aabb(this.hitbox, opponent.hitbox);

  @override
  Rect get hitbox => new Rect(this.position.x, this.position.y, 32, 32);

  void update(double dt) {
    // remove inactive bullets
    this._bullets.removeWhere((b) => !b.active);

    if (this.velocity.x != 0) {
      this._animTimer += dt;
      if (this._animTimer > 0.225) {
        this._animTimer = 0;
        this._animFrame = 1 - this._animFrame;
      }

      if (this.velocity.x > 0)
        this.velocity.x -= 3.0;
      else if (this.velocity.x < 0) this.velocity.x += 3.0;

      if (this.velocity.x > -1.0 && this.velocity.x < 1.0) {
        this.velocity.x = 0;
        this._animFrame = 0;
        this._animTimer = 0;
      }
    }

    if (!this._ground) {
      this.velocity.y += STANDARD_GRAVITY;
    }

    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;

    if (this.velocity.x > 0) this.flipped = false;
    if (this.velocity.x < 0) this.flipped = true;

    if (!this._ground) {
      this._animFrame = 1;
    } else if (this.velocity.x == 0) {
      this._animFrame = 0;
    }

    if (this._game.input.isDown(InputKey.KEY_FIRE)) {
      this._superSizeTimer += dt;
      if (this._superSizeTimer >= 3.0) {
        this._superSize = true;
      }
      if (this._bulletTime == 0.0) {
        if (this._bullets.length < 5) {
          // play fire-fx
          this._fireFx.play();

          final p = new Vector2(
              (this.flipped ? this.position.x : this.position.x + 20),
              (this._superSize ? this.position.y + 4 : this.position.y + 12));

          final v = new Vector2(this.flipped ? -300 : 300, 0);
          final newBullet = new HeroBullet(this._game, this.flipped, p, v);

          if (this._superSize) {
            newBullet.supersize();
            this._superSize = false;
            this._superSizeTimer = 0;
          }

          this._bullets.add(newBullet);
        }
      }

      this._bulletTime += dt;
      if (this._bulletTime > 0.2) {
        this._bulletTime = 0;
      }
    } else {
      this._superSize = false;
      this._superSizeTimer = 0;
      this._bulletTime = 0;
    }

    // move left or right
    if (this._game.input.isDown(InputKey.KEY_LEFT) && this.velocity.x > -100.0)
      this.velocity.x -= 15;
    if (this._game.input.isDown(InputKey.KEY_RIGHT) && this.velocity.x < 100.0)
      this.velocity.x += 15;

    // hit the ground?
    if (this.position.y > 280) {
      this.position.y = 280;
      this._ground = true;
      this.velocity.y = 0;
    }

    // jump
    if (this._game.input.isDown(InputKey.KEY_UP)) {
      if (this._ground) {
        this.velocity.y = -200.0;
        this._ground = false;
      }
    }

    this._bullets.forEach((b) => b.update(dt));
  }

  bool bulletHit(Mob mob) {
    final hb = mob.hitbox;
    for (var b in this._bullets.where((m) => m.active)) {
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
    this._bullets.where((b) => b.active).forEach((b) => b.draw(ctx));
    this._frames[this._animFrame].draw(ctx, this.position.x, this.position.y,
        options: new ImageSliceDrawOptions(hflip: this.flipped, scale: 2.0));
  }
}

class HeroBullet extends Bullet {
  bool _flipped;
  bool _superSize;

  HeroBullet(Game game, bool flipped, Vector2 position, Vector2 velocity)
      : this._flipped = flipped,
        this._superSize = false,
        super(
            new ImageSlice(game.getAsset<ImageElement>('bullet'), 0, 0, 16, 16),
            position,
            velocity);

  void supersize() => this._superSize = true;
  bool get isSupersized => this._superSize;

  void update(double dt) {
    this.position.x += this.velocity.x * dt;
    if (this.position.x < -16 || this.position.x > 640) this.active = false;
  }

  void draw(CanvasRenderingContext2D ctx) {
    this.image.draw(ctx, this.position.x, this.position.y,
        options: new ImageSliceDrawOptions(
            hflip: this._flipped, scale: (this._superSize ? 2.0 : 1.0)));
    // Actor.debug(ctx, this.hitbox);
  }

  Rect get hitbox {
    return this._superSize
        ? new Rect(this._flipped ? this.position.x + 4 : this.position.x,
            this.position.y + 12, 24, 12)
        : new Rect(this._flipped ? this.position.x + 16 : this.position.x,
            this.position.y + 6, 16, 6);
  }

  bool hit(Actor opponent) {
    throw UnimplementedError();
  }
}

class HeroB extends Drawable {
  List<ImageSlice> _frames;
  num _animTimer;
  int _animFrame;

  HeroB(Game game, Vector2 position)
      : this._frames = [
          new ImageSlice(game.getAsset<ImageElement>('hero1b'), 0, 0, 64, 64),
          new ImageSlice(game.getAsset<ImageElement>('hero2b'), 0, 0, 64, 64),
        ],
        this._animTimer = 0,
        this._animFrame = 0,
        super(position);

  void update(double dt) {
    this._animTimer += dt;
    if (this._animTimer > 0.3) {
      this._animTimer = 0.0;
      this._animFrame = 1 - this._animFrame;
    }
  }

  draw(CanvasRenderingContext2D ctx) {
    this._frames[this._animFrame].draw(ctx, this.position.x, this.position.y);
  }
}
