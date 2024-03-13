import 'lib/engine.dart';
import 'lib/sprite.dart';

abstract class Actor extends Movable {
  bool flipped;
  Actor([bool? flipped, Vector2? position, Vector2? velocity])
      : this.flipped = flipped ?? false,
        super(position, velocity);

  Rect get hitbox;
  bool hit(Actor opponent);
}
