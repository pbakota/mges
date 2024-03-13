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

import { Game } from "Game";
import { Drawable, ImageSlice, Vector2 } from "lib/Engine";

export class Dirt extends Drawable {
    private _frame: ImageSlice;
    private _alpha: number;
    private _active: boolean;
    private _alphaTimer: number;

    constructor(game: Game, position: Vector2) {
        super(position);
        this._frame = new ImageSlice(game.getAsset<HTMLImageElement>('blood-ground'), 0, 0, 16, 16);
        this._alpha = 1.0;
        this._active = true;
        this._alphaTimer = 0;
    }

    public get active(): boolean {
        return this._active;
    }

    public update(dt: number): void {
        this._alphaTimer += dt;
        if (this._alphaTimer > 0.2) {
            this._alphaTimer = 0;
            this._alpha -= 0.01;
            if (this._alpha < 0.01) {
                this._alpha = 0;
                this._active = false;
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        this._frame.draw(ctx, this.position.x, this.position.y, { scale: 2.0, alpha: this._alpha });
    }
}