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

import { ImageSlice, Rect, STANDARD_GRAVITY, Vector2 } from "lib/Engine";
import { Actor } from "Actor";
import { Game } from "Game";

abstract class Powerup extends Actor {

    private _image: ImageSlice;
    private _points: number;
    private _active: boolean;
    private _alpha: number = 100;
    private _waitTimer: number = 0;

    constructor(image: ImageSlice, points: number, position: Vector2 = new Vector2(0, 0), velocity: Vector2 = new Vector2(0, 0)) {
        super(false, position, velocity)
        this._image = image;
        this._points = points;
        this._active = false;
    }

    public get points(): number {
        return this._points;
    }

    public set active(value: boolean) {
        this._active = value;
    }

    public get active(): boolean {
        return this._active;
    }

    public update(dt: number): void {
        if (this.position.y < 280) {
            this.velocity.y += STANDARD_GRAVITY;
            this.position.y += dt * this.velocity.y;
        } else {
            this.position.y = 280;
            this._waitTimer += dt;
            if (this._waitTimer > 3.0) {
                if (this._alpha < 0.1) {
                    this._alpha = 0;
                    this._active = false;
                } else {
                    this._alpha -= 0.1;
                }
            }
        }
    }

    public get hitbox(): Rect { return new Rect(this.position.x, this.position.y, 32, 32); }

    public draw(ctx: CanvasRenderingContext2D): void {
        this._image.draw(ctx, this.position.x, this.position.y, { scale: 2.0, alpha: this._alpha });
    }

    public hit(opponent: Actor): boolean {
        if (!this._active) return false;
        if (Actor.aabb(this.hitbox, opponent.hitbox)) {
            this._active = false;
            return true;
        }
        return false;
    }

    public reset(x: number): void {
        this.position = new Vector2(x, 100);
        this.velocity.y = 50.0;
        this._waitTimer = 0;
        this._alpha = 1.0;
        this._active = true;
    }
}

export class Medkit extends Powerup {
    constructor(game: Game, position: Vector2 = new Vector2(0, 0)) {
        super(new ImageSlice(game.getAsset<HTMLImageElement>('medkit'), 0, 0, 16, 16), 500, position);
    }
}

export class Bomb extends Powerup {
    constructor(game: Game, position: Vector2 = new Vector2(0, 0)) {
        super(new ImageSlice(game.getAsset<HTMLImageElement>('bomb'), 0, 0, 16, 16), 500, position);
    }
}