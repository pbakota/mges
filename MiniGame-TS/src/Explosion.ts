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

export class Explosion extends Drawable {

    private _frames: ImageSlice[];
    private _animTimer: number;
    private _animFrame: number;
    private _active: boolean;

    constructor(game: Game, position: Vector2 = new Vector2(0, 0)) {
        super(position);
        const image = game.getAsset<HTMLImageElement>('explosion');
        this._frames = [
            new ImageSlice(image, 0 * 16, 0, 16, 16),
            new ImageSlice(image, 1 * 16, 0, 16, 16),
            new ImageSlice(image, 2 * 16, 0, 16, 16),
            new ImageSlice(image, 3 * 16, 0, 16, 16),
            new ImageSlice(image, 4 * 16, 0, 16, 16),
            new ImageSlice(image, 5 * 16, 0, 16, 16),
            new ImageSlice(image, 6 * 16, 0, 16, 16),
            new ImageSlice(image, 7 * 16, 0, 16, 16),
            new ImageSlice(image, 8 * 16, 0, 16, 16),
            new ImageSlice(image, 9 * 16, 0, 16, 16),
            new ImageSlice(image, 10 * 16, 0, 16, 16),
            new ImageSlice(image, 11 * 16, 0, 16, 16),
        ];

        this._animTimer = 0;
        this._animFrame = 0;
        this._active = true;
    }

    public get active(): boolean {
        return this._active;
    }

    public update(dt: number): void {
        if (!this._active) return;

        this._animTimer += dt;
        if (this._animTimer > 0.05) {
            this._animTimer -= 0.05;
            if (++this._animFrame == 12) {
                this._active = false;
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        this._frames[this._animFrame].draw(ctx, this.position.x, this.position.y, { scale: 2.0 });
    }

}