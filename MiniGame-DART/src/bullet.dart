import 'actor.dart';
import 'lib/engine.dart';

abstract class Bullet extends Actor {
  late bool _active;

  late ImageSlice _image;

  Bullet(ImageSlice image, Vector2 position, Vector2 velocity)
      : this._image = image,
        super(false, position, velocity) {
    this._active = true;
  }

  bool get active => this._active;
  void set active(bool val) => this._active = val;

  ImageSlice get image => this._image;
}
