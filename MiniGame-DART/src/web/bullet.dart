import 'actor.dart';
import 'lib/engine.dart';

abstract class Bullet extends Actor {
  late bool _active;

  late final ImageSlice _image;

  Bullet(ImageSlice image, Vector2 position, Vector2 velocity)
      : _image = image,
        super(false, position, velocity) {
    _active = true;
  }

  bool get active => _active;
  set active(bool val) => _active = val;

  ImageSlice get image => _image;
}
