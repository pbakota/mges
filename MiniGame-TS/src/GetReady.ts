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

import { BitmapText, ImageSlice, InputKey, Sound, Util } from "lib/Engine";
import { Game, GameScene } from "Game";

export class GetReady {
    private _getReadyTimer: number;
    private _ready: boolean;
    private _alpha: number;
    private _frame: ImageSlice;

    constructor(game: Game) {
        this._getReadyTimer = 0;
        this._ready = false;
        this._alpha = 1.0;
        this._frame = new ImageSlice(game.getAsset<HTMLImageElement>('elements'), 0, 16, 160, 16);
    }

    public get isReady(): boolean { return this._ready; }

    public update(dt: number): void {
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

    public draw(ctx: CanvasRenderingContext2D) {
        if (this._ready) return;
        this._frame.draw(ctx, 160, 150, { scale: 2, alpha: this._alpha });
    }
}

const enum Scores {
    ADD_KILLS,
    ADD_MISSES,
    ADD_MEDIKITS,
    ADD_BOMBS,
    PRESS_FIRE,
}

const enum Bonus {
    Kills = 2,
    Missed = 0,
    Bombs = 50,
    Medkits = 100,
}

export class GameOver {
    private _game: Game;
    private _gameOverTime: number;
    private _countTime: number;
    private _frame: ImageSlice;
    private _killed: number;
    private _missed: number;
    private _medkitCollected: number;
    private _bombCollected: number;
    private _score: number;
    private _currentScoreCount: Scores;
    private _pressFiretime: number;
    private _tick_fx: Sound;
    private _text: BitmapText;

    constructor(game: Game) {
        this._game = game;
        this._frame = new ImageSlice(game.getAsset<HTMLImageElement>('elements'), 0, 0, 160, 16);
        this._text = new BitmapText(this._game.getAsset<HTMLImageElement>('bitmapFont'));

        this._gameOverTime = 0.0;
        this._countTime = 0.0;
        this._killed = 0;
        this._missed = 0;
        this._medkitCollected = 0;
        this._bombCollected = 0;
        this._score = 0;
        this._currentScoreCount = Scores.ADD_KILLS;
        this._pressFiretime = Number.MAX_VALUE;

        this._tick_fx = game.getAsset<Sound>('tick-fx');
        this._tick_fx.volume = 0.1;
    }

    public get score(): number { return this._score; }

    public set(mobKilled: number, mobMissed: number, medkitCollected: number, bombCollected: number, score: number): void {
        this._killed = mobKilled;
        this._missed = mobMissed;
        this._medkitCollected = medkitCollected;
        this._bombCollected = bombCollected;
        this._score = score;
    }

    public update(dt: number): void {
        this._gameOverTime += dt;
        if (this._gameOverTime > 3.0) {
            this._countTime += dt;
            if (this._countTime > 0.05) {
                this._countTime -= 0.05;
                switch (this._currentScoreCount) {
                    case Scores.ADD_KILLS:
                        if (this._killed > 10) {
                            this._tick_fx.play();
                            this._score += Bonus.Kills * 10;
                            this._killed -= 10;
                        }
                        else if (this._killed > 0) {
                            this._tick_fx.play();
                            this._score += Bonus.Kills;
                            this._killed--;
                        }
                        if (this._killed == 0)
                            this._currentScoreCount = Scores.ADD_MISSES;
                        break;
                    case Scores.ADD_MISSES:
                        if (this._missed > 10) {
                            this._tick_fx.play();
                            this._score += Bonus.Missed * 10;
                            this._missed -= 10;
                        }
                        else if (this._missed > 0) {
                            this._tick_fx.play();
                            this._score += Bonus.Missed;
                            this._missed--;
                        }
                        if (this._missed == 0)
                            this._currentScoreCount = Scores.ADD_BOMBS;
                        break;
                    case Scores.ADD_BOMBS:
                        if (this._bombCollected > 10) {
                            this._tick_fx.play();
                            this._score += Bonus.Bombs * 10;
                            this._bombCollected -= 10;
                        }
                        else if (this._bombCollected > 0) {
                            this._tick_fx.play();
                            this._score += Bonus.Bombs;
                            this._bombCollected--;
                        }
                        if (this._bombCollected == 0)
                            this._currentScoreCount = Scores.ADD_MEDIKITS;
                        break;
                    case Scores.ADD_MEDIKITS:
                        if (this._medkitCollected > 10) {
                            this._tick_fx.play();
                            this._score += Bonus.Medkits * 10;
                            this._medkitCollected -= 10;
                        }
                        if (this._medkitCollected > 0) {
                            this._tick_fx.play();
                            this._score += Bonus.Medkits;
                            this._medkitCollected--;
                        }
                        if (this._medkitCollected == 0) {
                            this._currentScoreCount = Scores.PRESS_FIRE;
                            this._pressFiretime = this._gameOverTime + 1;
                        }
                        break;
                }
            }

            if (this._currentScoreCount == Scores.PRESS_FIRE) {
                if (this._gameOverTime > this._pressFiretime)
                    if (this._game.input.isPressed(InputKey.KEY_FIRE)) {
                        this._game.changeScene(GameScene.GAME_SCENE_TITLE);
                        return;
                    }
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        this._frame.draw(ctx, 160, 50, { scale: 2 });

        this._text.draw(ctx, 170, 100, 'white', `Killed: ${Util.formatNumber(this._killed, 5, '0')}`);
        this._text.draw(ctx, 400, 104, 'white', `x ${Bonus.Kills}`, { scale: 1.0 });
        this._text.draw(ctx, 170, 120, 'white', `Missed: ${Util.formatNumber(this._missed, 5, '0')}`);
        this._text.draw(ctx, 400, 124, 'white', `x ${Bonus.Missed}`, { scale: 1.0 });
        this._text.draw(ctx, 170, 140, 'white', `Bombs : ${Util.formatNumber(this._bombCollected, 4, '0')}`);
        this._text.draw(ctx, 400, 144, 'white', `x ${Bonus.Medkits}`, { scale: 1.0 });
        this._text.draw(ctx, 170, 160, 'white', `Medkit: ${Util.formatNumber(this._medkitCollected, 4, '0')}`);
        this._text.draw(ctx, 400, 164, 'white', `x ${Bonus.Bombs}`, { scale: 1.0 });
        this._text.draw(ctx, 140, 200, 'white', `FINAL SCORE: ${Util.formatNumber(this._score, 8, '0')}`);

        if (this._gameOverTime > this._pressFiretime) {
            this._text.draw(ctx, 200, 250, 'white', "Press \"FIRE\"!");
        }
    }
}