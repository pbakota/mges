// Copyright 2023 Peter Bakota
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// ignore_for_file: unnecessary_this, constant_identifier_names

import 'dart:html';

import 'game.dart';
import 'lib/bitmaptext.dart';
import 'lib/engine.dart';
import 'lib/sound.dart';

class GetReady {
  num _getReadyTimer = 0;
  bool _ready = false;
  num _alpha = 1.0;
  late ImageSlice _frame;

  GetReady(Game game) {
    this._frame =
        ImageSlice(game.getAsset<ImageElement>('elements'), 0, 16, 160, 16);
  }

  bool get isReady => this._ready;

  void update(double dt) {
    if (this._ready) return;

    this._getReadyTimer += dt;
    if (this._getReadyTimer > 2.0) {
      this._alpha -= 0.1;
      if (this._alpha < 0) {
        this._alpha = 0;
      }
    }

    if (this._getReadyTimer > 5.0) {
      this._ready = true;
    }
  }

  void draw(CanvasRenderingContext2D ctx) {
    if (this._ready) return;
    this._frame.draw(ctx, 160, 150,
        options: ImageSliceDrawOptions(scale: 2, alpha: this._alpha));
  }
}

enum Scores {
  ADD_KILLS,
  ADD_MISSES,
  ADD_MEDIKITS,
  ADD_BOMBS,
  PRESS_FIRE,
}

enum Bonus {
  Kills(2),
  Missed(0),
  Bombs(50),
  Medkits(100);

  final int value;
  const Bonus(int val) : this.value = val;
}

class GameOver {
  final Game _game;
  num _gameOverTime = 0;
  num _countTime = 0;
  int _killed = 0;
  int _missed = 0;
  int _medkitCollected = 0;
  int _bombCollected = 0;
  int _score = 0;
  Scores _currentScoreCount = Scores.ADD_KILLS;
  num _pressFiretime = 0x7fffffff;
  late ImageSlice _frame;
  late Sound _tickFx;
  late BitmapText _text;

  GameOver(this._game) {
    this._frame = ImageSlice(
        this._game.getAsset<ImageElement>('elements'), 0, 0, 160, 16);
    this._text = BitmapText(this._game.getAsset<ImageElement>('bitmapFont'));
    this._tickFx = _game.getAsset<Sound>('tick-fx');
    this._tickFx.volume = 0.1;
  }

  int get score => this._score;

  void set(int mobKilled, int mobMissed, int medkitCollected, int bombCollected,
      int score) {
    this._killed = mobKilled;
    this._missed = mobMissed;
    this._medkitCollected = medkitCollected;
    this._bombCollected = bombCollected;
    this._score = score;
  }

  void update(double dt) {
    this._gameOverTime += dt;
    if (this._gameOverTime > 3.0) {
      this._countTime += dt;
      if (this._countTime > 0.05) {
        this._countTime -= 0.05;
        switch (this._currentScoreCount) {
          case Scores.ADD_KILLS:
            if (this._killed > 10) {
              this._tickFx.play();
              this._score += Bonus.Kills.value * 10;
              this._killed -= 10;
            } else if (this._killed > 0) {
              this._tickFx.play();
              this._score += Bonus.Kills.value;
              this._killed--;
            }
            if (this._killed == 0) this._currentScoreCount = Scores.ADD_MISSES;
            break;
          case Scores.ADD_MISSES:
            if (this._missed > 10) {
              this._tickFx.play();
              this._score += Bonus.Missed.value * 10;
              this._missed -= 10;
            } else if (this._missed > 0) {
              this._tickFx.play();
              this._score += Bonus.Missed.value;
              this._missed--;
            }
            if (this._missed == 0) this._currentScoreCount = Scores.ADD_BOMBS;
            break;
          case Scores.ADD_BOMBS:
            if (this._bombCollected > 10) {
              this._tickFx.play();
              this._score += Bonus.Bombs.value * 10;
              this._bombCollected -= 10;
            } else if (this._bombCollected > 0) {
              this._tickFx.play();
              this._score += Bonus.Bombs.value;
              this._bombCollected--;
            }
            if (this._bombCollected == 0) {
              this._currentScoreCount = Scores.ADD_MEDIKITS;
            }
            break;
          case Scores.ADD_MEDIKITS:
            if (this._medkitCollected > 10) {
              this._tickFx.play();
              this._score += Bonus.Medkits.value * 10;
              this._medkitCollected -= 10;
            }
            if (this._medkitCollected > 0) {
              this._tickFx.play();
              this._score += Bonus.Medkits.value;
              this._medkitCollected--;
            }
            if (this._medkitCollected == 0) {
              this._currentScoreCount = Scores.PRESS_FIRE;
              this._pressFiretime = this._gameOverTime + 1;
            }
            break;
          case Scores.PRESS_FIRE:
            break;
        }
      }

      if (this._currentScoreCount == Scores.PRESS_FIRE) {
        if (this._gameOverTime > this._pressFiretime) {
          if (this._game.input.isPressed(InputKey.KEY_FIRE)) {
            this._game.changeScene(GameScene.GAME_SCENE_TITLE);
            return;
          }
        }
      }
    }
  }

  void draw(CanvasRenderingContext2D ctx) {
    this._frame.draw(ctx, 160, 50, options: ImageSliceDrawOptions(scale: 2));

    this._text.draw(ctx, 170, 100, 'white',
        'Killed: ${Util.formatNumber(this._killed, 5, '0')}');
    this._text.draw(ctx, 400, 104, 'white', 'x ${Bonus.Kills.value}',
        DrawTextOptions(scale: 1.0));
    this._text.draw(ctx, 170, 120, 'white',
        'Missed: ${Util.formatNumber(this._missed, 5, '0')}');
    this._text.draw(ctx, 400, 124, 'white', 'x ${Bonus.Missed.value}',
        DrawTextOptions(scale: 1.0));
    this._text.draw(ctx, 170, 140, 'white',
        'Bombs : ${Util.formatNumber(this._bombCollected, 4, '0')}');
    this._text.draw(ctx, 400, 144, 'white', 'x ${Bonus.Medkits.value}',
        DrawTextOptions(scale: 1.0));
    this._text.draw(ctx, 170, 160, 'white',
        'Medkit: ${Util.formatNumber(this._medkitCollected, 4, '0')}');
    this._text.draw(ctx, 400, 164, 'white', 'x ${Bonus.Bombs.value}',
        DrawTextOptions(scale: 1.0));
    this._text.draw(ctx, 140, 200, 'white',
        'FINAL SCORE: ${Util.formatNumber(this._score, 8, '0')}');

    if (this._gameOverTime > this._pressFiretime) {
      this._text.draw(ctx, 200, 250, 'white', "Press \"FIRE\"!");
    }
  }
}
