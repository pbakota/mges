import 'dart:html';
import 'game.dart';

void main() {
  var g = new Game();

  window.onBlur.listen((event) {
    g.stop();
  });

  window.onFocus.listen((event) {
    g.restart();
  });

  g.run();
}
