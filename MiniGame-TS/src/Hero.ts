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

import { ImageSlice, InputKey, STANDARD_GRAVITY, Vector2, Sound, Sprite, Rect, Drawable } from "lib/Engine";
import { Actor } from "Actor";
import { Game } from "Game";
import { Bullet } from "Bullet";
import { Mob } from "Mobs";

export class Hero extends Actor {

    private _game: Game;
    private _frames: ImageSlice[];
    private _bullets: HeroBullet[];
    private _bulletTime: number = 0;
    private _animTimer: number = 0;
    private _animFrame: number = 0;
    private _ground: boolean;
    private _superSize: boolean = false;
    private _superSizeTimer: number = 0;
    private _fire_fx: Sound;

    constructor(game: Game, position: Vector2) {
        super(false, position, new Vector2(0, 0));
        this._game = game;
        this._frames = [
            new ImageSlice(this._game.getAsset<HTMLImageElement>('hero1a'), 0, 0, 16, 16),
            new ImageSlice(this._game.getAsset<HTMLImageElement>('hero2a'), 0, 0, 16, 16),
        ];
        this._bullets = new Array<HeroBullet>;
        this._ground = false;

        this._fire_fx = this._game.getAsset<Sound>('fire-fx');
        this._fire_fx.volume = 0.2;
    }

    public get hitbox(): Rect {
        return new Rect(this.position.x, this.position.y, 32, 32);
    }

    public hit(opponent: Actor): boolean {
        return Actor.aabb(this.hitbox, opponent.hitbox);
    }

    public update(dt: number): void {

        // remove inactive bullets
        this._bullets = this._bullets.filter(b => b.active);

        if (this.velocity.x != 0) {
            this._animTimer += dt;
            if (this._animTimer > 0.225) {
                this._animTimer = 0;
                this._animFrame = 1 - this._animFrame;
            }

            if (this.velocity.x > 0) this.velocity.x -= 3.0;
            else if (this.velocity.x < 0) this.velocity.x += 3.0;

            if (this.velocity.x > -1.0 && this.velocity.x < 1.0) {
                this.velocity.x = 0;
                this._animFrame = 0;
                this._animTimer = 0;
            }
        }

        if (!this._ground) {
            this.velocity.y += STANDARD_GRAVITY;
        }

        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;

        if (this.velocity.x > 0) this.flipped = false;
        if (this.velocity.x < 0) this.flipped = true;

        if (!this._ground) {
            this._animFrame = 1;
        } else if (this.velocity.x == 0) {
            this._animFrame = 0;
        }

        if (this._game.input.isDown(InputKey.KEY_FIRE)) {
            this._superSizeTimer += dt;
            if (this._superSizeTimer >= 3.0) {
                this._superSize = true;
            }
            if (this._bulletTime == 0.0) {
                if (this._bullets.length < 5) {

                    // play fire-fx
                    this._fire_fx.play();

                    const p = new Vector2(
                        (this.flipped ? this.position.x : this.position.x + 20),
                        (this._superSize ? this.position.y + 4 : this.position.y + 12)
                    );

                    const v = new Vector2(this.flipped ? -300 : 300, 0);
                    const newBullet = new HeroBullet(this._game, this.flipped, p, v);

                    if (this._superSize) {
                        newBullet.supersize();
                        this._superSize = false;
                        this._superSizeTimer = 0;
                    }

                    this._bullets.push(newBullet);
                }
            }

            this._bulletTime += dt;
            if (this._bulletTime > 0.2) {
                this._bulletTime = 0;
            }
        } else {
            this._superSize = false;
            this._superSizeTimer = 0;
            this._bulletTime = 0;
        }

        // move left or right
        if (this._game.input.isDown(InputKey.KEY_LEFT) && this.velocity.x > -100.0) this.velocity.x -= 15;
        if (this._game.input.isDown(InputKey.KEY_RIGHT) && this.velocity.x < 100.0) this.velocity.x += 15;

        // hit the ground?
        if (this.position.y > 280) {
            this.position.y = 280;
            this._ground = true;
            this.velocity.y = 0;
        }

        // jump
        if (this._game.input.isDown(InputKey.KEY_UP)) {
            if (this._ground) {
                this.velocity.y = -200.0;
                this._ground = false;
            }
        }

        this._bullets.forEach(b => b.update(dt));
    }

    public bulletHit(mob: Mob): boolean {
        const hb = mob.hitbox;
        for (let b of this._bullets.filter(m => m.active)) {
            if (Actor.aabb(hb, b.hitbox)) {
                if (!b.isSupersized) {
                    b.active = false;
                }
                return true;
            }
        }
        return false;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        this._bullets.filter(b => b.active).forEach(b => b.draw(ctx));
        this._frames[this._animFrame].draw(ctx, this.position.x, this.position.y, { hflip: this.flipped, scale: 2.0 });
    }
}

export class HeroBullet extends Bullet {

    private _flipped: boolean;
    private _superSize: boolean;

    constructor(game: Game, flipped: boolean, position: Vector2, velocity: Vector2) {
        super(new ImageSlice(game.getAsset<HTMLImageElement>('bullet'), 0, 0, 16, 16), position, velocity);
        this._flipped = flipped;
        this._superSize = false;
    }

    public supersize(): void {
        this._superSize = true;
    }

    public get isSupersized(): Boolean { return this._superSize; }

    public override update(dt: number): void {
        this.position.x += this.velocity.x * dt;
        if (this.position.x < -16 || this.position.x > 640)
            this.active = false;
    }

    public override draw(ctx: CanvasRenderingContext2D): void {
        this._image.draw(ctx, this.position.x, this.position.y, { hflip: this._flipped, scale: (this._superSize ? 2.0 : 1.0) });
        // Actor.debug(ctx, this.hitbox);
    }

    public get hitbox(): Rect {
        return this._superSize
            ? new Rect(this._flipped ? this.position.x + 4 : this.position.x, this.position.y + 12, 24, 12)
            : new Rect(this._flipped ? this.position.x + 16 : this.position.x, this.position.y + 6, 16, 6);
    }

    public hit(opponent: Actor): boolean {
        throw new Error("Method not implemented.");
    }
}

export class HeroB extends Drawable {

    private _frames: ImageSlice[];
    private _animTimer;
    private _animFrame;

    constructor(game: Game, position: Vector2) {
        super(position);
        this._frames = [
            new ImageSlice(game.getAsset<HTMLImageElement>('hero1b'), 0, 0, 64, 64),
            new ImageSlice(game.getAsset<HTMLImageElement>('hero2b'), 0, 0, 64, 64),
        ];
        this._animTimer = 0;
        this._animFrame = 0;
    }

    public update(dt: number): void {
        this._animTimer += dt;
        if (this._animTimer > 0.3) {
            this._animTimer = 0.0;
            this._animFrame = 1 - this._animFrame;
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        this._frames[this._animFrame].draw(ctx, this.position.x, this.position.y);
    }
}