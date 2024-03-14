
import 'dart:html';

import 'game.dart';

abstract class BaseScene {
  final Game _game;
  BaseScene(Game game): _game = game;

  Game get game => _game;
  set game(Game val);

  void enter() { }
  void exit() { }
  void update(double dt);
  void draw(CanvasRenderingContext2D ctx);
}
