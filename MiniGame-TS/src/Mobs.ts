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

import { ImageSlice, Rect, Vector2 } from "lib/Engine";
import { Actor } from "Actor";
import { Game } from "Game";

export abstract class Mob extends Actor {

    private _frames: ImageSlice[];
    private _hp: number;
    private _speed: number;
    private _points: number;
    private _animTimer: number = 0;
    private _animFrame: number = 0;
    private _active: boolean;

    constructor(position: Vector2, frames: ImageSlice[], flipped: boolean, hp: number, speed: number, points: number) {
        super(flipped, position, new Vector2(0, 0));

        this._frames = frames;
        this._hp = hp;
        this._speed = speed;
        this._points = points;
        this._active = true;

        this.velocity.x = this.flipped ? - this._speed : this._speed;
    }

    public get points(): number {
        return this._points;
    }

    public get active(): boolean {
        return this._active;
    }

    public set active(value: boolean) {
        this._active = value;
    }

    public update(dt: number): void {
        if (this.flipped) {
            if (this.velocity.x > 0) {
                this.velocity.x -= 1.0;
                if (this.velocity.x < 1.0) {
                    this.velocity.x = -this._speed;
                }
            }
        } else {
            if (this.velocity.x < 0) {
                this.velocity.x += 1.0;
                if (this.velocity.x >= 0.0) {
                    this.velocity.x = this._speed;
                }
            }
        }

        this.position.x += dt * this.velocity.x;
        this._animTimer += dt;
        if (this._animTimer > 0.25) {
            this._animTimer = 0.0;
            this._animFrame = 1 - this._animFrame;
        }

        if (this.position.x < -32.0 || this.position.x >= 640) {
            this._active = false;
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        this._frames[this._animFrame].draw(ctx, this.position.x, this.position.y, { scale: 2.0, hflip: this.flipped });
        // Actor.debug(ctx, this.hitbox);
    }

    public hit(opponent: Actor): boolean {
        if (Actor.aabb(this.hitbox, opponent.hitbox)) {
        }
        return false;
    }

    public gotHit(hero: Actor): boolean {
        if (this._hp-- <= 0) return true;
        this.velocity.x = hero.flipped ? - this._speed * 1.2 : this._speed * 1.2;
        return false;
    }
}

export class MobBee extends Mob {
    constructor(game: Game, flipped: boolean, position: Vector2, speed: number = 40) {
        super(position, [
            new ImageSlice(game.getAsset<HTMLImageElement>('bee1a'), 0, 0, 16, 16),
            new ImageSlice(game.getAsset<HTMLImageElement>('bee2a'), 0, 0, 16, 16),
        ], flipped, 2, speed, 20);
    }
    public get hitbox(): Rect { return new Rect(this.position.x+4, this.position.y+4, 24, 24) }
}

export class MobBlue extends Mob {
    constructor(game: Game, flipped: boolean, position: Vector2, speed: number = 60) {
        super(position, [
            new ImageSlice(game.getAsset<HTMLImageElement>('blue1a'), 0, 0, 16, 16),
            new ImageSlice(game.getAsset<HTMLImageElement>('blue2a'), 0, 0, 16, 16),
        ], flipped, 3, speed, 50);
    }
    public get hitbox(): Rect { return new Rect(this.position.x+4, this.position.y+4, 24, 24) }
}

export class MobFoxy extends Mob {
    constructor(game: Game, flipped: boolean, position: Vector2, speed: number = 50) {
        super(position, [
            new ImageSlice(game.getAsset<HTMLImageElement>('foxy1a'), 0, 0, 16, 16),
            new ImageSlice(game.getAsset<HTMLImageElement>('foxy2a'), 0, 0, 16, 16),
        ], flipped, 2, speed, 100);
    }
    public get hitbox(): Rect { return new Rect(this.position.x, this.position.y+12, 26, 20) }
}

export class MobSniky extends Mob {
    constructor(game: Game, flipped: boolean, position: Vector2, speed: number = 10) {
        super(position, [
            new ImageSlice(game.getAsset<HTMLImageElement>('sniky1a'), 0, 0, 16, 16),
            new ImageSlice(game.getAsset<HTMLImageElement>('sniky2a'), 0, 0, 16, 16),
        ], flipped, 5, speed, 200);
    }
    public get hitbox(): Rect { return new Rect(this.position.x, this.position.y+17, 32, 15) }
}

