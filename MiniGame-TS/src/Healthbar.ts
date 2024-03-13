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

import { Drawable, Vector2 } from "lib/Engine";
import { Game } from "Game";

const MAX_ENERGY: number = 100;
const MAX_HEIGHT: number = 96;

export class Healthbar extends Drawable {

    private _health: number;
    private _image: HTMLImageElement;

    constructor(game: Game) {
        super(new Vector2(10, 30));
        this._image = game.getAsset<HTMLImageElement>('energybar');
        this._health = MAX_ENERGY;
    }

    public get health(): number { return this._health; }

    public reset(): void {
        this._health = MAX_ENERGY;
    }

    public decrease(amount: number = 1): void {
        this._health -= amount;
        if (this._health < 0)
            this._health = 0;
    }

    public increase(amount: number = 1): void {
        this._health += amount;
        if (this._health > MAX_ENERGY) {
            this._health = MAX_ENERGY;
        }
    }

    public update(dt: number): void {}

    public draw(ctx: CanvasRenderingContext2D): void {
        const p = Math.round(this._health / MAX_ENERGY * MAX_HEIGHT);
        ctx.drawImage(this._image, 0, 0, 8, p, this.position.x, this.position.y, 8, p);
    }
}