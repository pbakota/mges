
import 'dart:html';

import 'game.dart';

abstract class BaseScene {
  Game _game;
  BaseScene(Game game): this._game = game;

  Game get game => this._game;
  void set game(Game val);

  void enter() { }
  void exit() { }
  void update(double dt);
  void draw(CanvasRenderingContext2D ctx);
}
