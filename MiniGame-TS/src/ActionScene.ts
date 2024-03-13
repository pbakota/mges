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

import { BitmapText, ImageCache, ImageSlice, InputKey, Sound, Util, Vector2 } from "lib/Engine";
import { Game, GameScene } from "Game";
import { Healthbar } from "Healthbar";
import { Hero } from "Hero";
import { BaseScene } from "Scene";
import { Mob, MobBee, MobBlue, MobFoxy, MobSniky } from "Mobs";
import { Explosion } from "Explosion";
import { Dirt } from "Dirt";
import { GameOver, GetReady } from "GetReady";
import { Bomb, Medkit } from "Powerups";

export class ActionScene extends BaseScene {

    private _score: number;
    private _hiScore: number;
    private _hero: Hero;
    private _healthBar: Healthbar;
    private _forest: ImageSlice;
    private _text: BitmapText;
    private _ground: ImageSlice;
    private _backgroundCache: ImageCache;
    private _mobs: Mob[];
    private _explosions: Explosion[];
    private _dirts: Dirt[];
    private _isGameOver: boolean;
    private _ready: GetReady;
    private _medkit: Medkit;
    private _bomb: Bomb;
    private _medkitSpawnTimer: number;
    private _pickup_fx: Sound;
    private _medkitCollected: number;
    private _bombSpawnTimer: number;
    private _bombExploded: boolean;
    private _bombExplodeTimer: number;
    private _explosionLong_fx: Sound;
    private _bombCollected: number;
    private _mobKilled: number;
    private _explosion_fx: Sound;
    private _mobSpawnTimer: number;
    private _nextMob: number;
    private _mobMissed: number;
    private _hit_fx: Sound;
    private _gameOver: GameOver;

    constructor(game: Game) {
        super(game);

        this._hero = new Hero(this._game, new Vector2(300,200));
        this._healthBar = new Healthbar(this._game);

        this._forest = new ImageSlice(this._game.getAsset<HTMLImageElement>('forest'), 0, 0, 640, 312);
        this._text = new BitmapText(this._game.getAsset<HTMLImageElement>('bitmapFont'));
        this._ground = new ImageSlice(this._game.getAsset<HTMLImageElement>('ground'), 0, 0, 16, 16);
        this._ready = new GetReady(this._game);
        this._gameOver = new GameOver(this._game);
        this._medkit = new Medkit(this._game);
        this._bomb = new Bomb(this._game);

        this._pickup_fx = this._game.getAsset<Sound>('pickup-fx');
        this._explosionLong_fx = this._game.getAsset<Sound>('explosion_long-fx');
        this._explosion_fx = this._game.getAsset<Sound>('explosion-fx');
        this._hit_fx = this._game.getAsset<Sound>('hit-fx');

        this._score = 0;
        this._hiScore = 0;

        this._backgroundCache = new ImageCache(this._game.renderer.backbuffer);
        this._mobs = [];
        this._explosions = [];
        this._dirts = [];

        this._isGameOver = false;
        this._medkitSpawnTimer = 0;

        this._bombSpawnTimer = 0;
        this._bombExplodeTimer = 0;
        this._bombExploded = false;

        this._mobSpawnTimer = 0;
        this._nextMob = 0;

        this._mobKilled = 0;
        this._mobMissed = 0;
        this._medkitCollected = 0;
        this._bombCollected = 0;
    }

    public update(dt: number): void {
        if (this._game.input.isPressed(InputKey.KEY_ESCAPE)) {
            this._game.changeScene(GameScene.GAME_SCENE_TITLE);
            return;
        }

        // remove inactive entities
        this._mobs = this._mobs.filter(m => m.active);
        this._dirts = this._dirts.filter(m => m.active);
        this._explosions = this._explosions.filter(m => m.active);

        if (this._isGameOver) {
            this._gameOver.update(dt);
            this._score = this._gameOver.score;
            if (this._score > this._hiScore) {
                this._hiScore = this._score;
            }
        } else {
            this._hero.update(dt);

            if (!this._medkit.active) {
                this.medkitSpawn(dt);
            }

            if (!this._bomb.active) {
                this.bombSpawn(dt);
            }

            if (this._ready.isReady) {
                this.mobSpawn(dt);
            }
        }

        if (!this._ready.isReady) {
            this._ready.update(dt);
        }

        this.updateMedkit(dt);
        this.updateBomb(dt);
        this.updateMobs(dt);

        // update other entities
        this._explosions.filter(m => m.active).forEach(m => m.update(dt));
        this._dirts.filter(m => m.active).forEach(m => m.update(dt));

        if (this._score > this._hiScore) {
            this._hiScore = this._score;
        }
    }

    private bombSpawn(dt: number): void {
        this._bombSpawnTimer += dt;
        if (this._bombSpawnTimer > 30.0) {
            this._bombSpawnTimer -= 30.0;
            this._bomb.reset(32 + Math.random() * this._game.renderer.width - 32);
        }
    }

    private updateBomb(dt: number): void {
        if (this._bombExploded) {
            this._bombExplodeTimer += dt;
            if (this._bombExplodeTimer > 0.2) {
                this._bombExploded = true;
            }
        }

        if (this._bomb.active) {
            this._bomb.update(dt);
            if (!this._isGameOver) {
                if (this._bomb.hit(this._hero)) {
                    this._explosionLong_fx.play();
                    this._score += this._bomb.points;
                    this._bombCollected++;

                    this._mobs.filter(m => m.active).forEach(m => {
                        this.mobKilled(m);
                    })
                }
            }
        }
    }

    private medkitSpawn(dt: number): void {
        this._medkitSpawnTimer += dt;
        if (this._medkitSpawnTimer > 20.0) {
            this._medkitSpawnTimer -= 20.0;
            this._medkit.reset(32 + Math.random() * this._game.renderer.width - 32);
        }
    }

    private updateMedkit(dt: number): void {
        this._medkit.update(dt);
        if (!this._isGameOver) {
            if (this._medkit.hit(this._hero)) {
                this._pickup_fx.play();
                this._score = this._medkit.points;
                this._healthBar.increase(20);
                this._medkitCollected++;
            }
        }
    }

    private mobSpawn(dt: number): void {
        // Limit the number of mobs
        if (this._mobs.length == 50) return;

        this._mobSpawnTimer += dt;
        if (this._mobSpawnTimer > this._nextMob) {
            this._mobSpawnTimer = 0;
            this._nextMob = Math.random() * 0.8;

            const flipped = Math.random() > 0.5;
            const mobid = Math.random() * 100;

            let newMob: Mob;
            if (mobid < 10) {
                const position = new Vector2(flipped ? 640 : -32, 280);
                newMob = new MobSniky(this._game, flipped, position);
            } else if (mobid < 40 && mobid >= 10) {
                const position = new Vector2(flipped ? 640 : -32, 280 - 32 + Math.random() * 32);
                newMob = new MobBlue(this._game, flipped, position);
            } else if (mobid < 70 && mobid >= 40) {
                const position = new Vector2(flipped ? 640 : -32, 280 - 32 + Math.random() * 32);
                newMob = new MobBee(this._game, flipped, position);
            } else {
                const position = new Vector2(flipped ? 640 : -32, 280);
                newMob = new MobFoxy(this._game, flipped, position);
            }

            this._mobs.push(newMob);
        }
    }

    private mobKilled(mob: Mob) {
        ++this._mobKilled;
        this._explosion_fx.play();

        const explosion = new Explosion(this._game, mob.position);
        this._explosions.push(explosion);

        const dirt = new Dirt(this._game, new Vector2(mob.position.x, 280 + 32));
        this._dirts.push(dirt);

        this._score += mob.points;
        mob.active = false;
    }

    private updateMobs(dt: number) {
        this._mobs.forEach(m => {
            m.update(dt);

            if (!this._isGameOver) {
                if (!m.active) {
                    ++this._mobMissed;
                } else if (this._hero.bulletHit(m)) {
                    if (m.gotHit(this._hero)) {
                        this.mobKilled(m);
                    } else {
                        this._hit_fx.play();
                    }
                } else if (this._hero.hit(m)) {
                    this._healthBar.decrease();
                    if (this._healthBar.health == 0) {
                        this.heroDied();
                    }
                }
            }
        });
    }

    private heroDied(): void {
        this._isGameOver = true;
        this._gameOver.set(this._mobKilled, this._mobMissed, this._medkitCollected, this._bombCollected, this._score);
        // this._gameOver.set(998, 127, 9, 4, 0);
    }

    public draw(ctx: CanvasRenderingContext2D): void {

        this._backgroundCache.draw(ctx, () => {
            // forest
            this._forest.draw(ctx, 0, 0);

            // platform
            for (let i = 0; i < this._game.renderer.width / 32; ++i) {
                this._ground.draw(ctx, i * 32, 280 + 32, { scale: 2.0 });
            }
        });

        // health
        this._healthBar.draw(ctx);

        // score
        this._text.draw(ctx, 2, 2, 'white', `SCORE:${Util.formatNumber(this._score, 8, '0')}`);
        this._text.draw(ctx, 368, 2, 'white', `HI-SCORE:${Util.formatNumber(this._hiScore, 8, '0')}`);

        if (!this._ready.isReady) {
            this._ready.draw(ctx);
        }

        if (!this._isGameOver) {
            this._hero.draw(ctx);
            // Actor.debug(ctx, this._hero.hitbox);
        }

        // draw other entities
        this._mobs.filter(m => m.active).forEach(m => m.draw(ctx));
        this._dirts.filter(m => m.active).forEach(m => m.draw(ctx));
        this._explosions.filter(m => m.active).forEach(m => m.draw(ctx));

        if (this._medkit.active) {
            this._medkit.draw(ctx);
        }

        if (this._bomb.active) {
            this._bomb.draw(ctx);
        }

        if (this._isGameOver) {
            this._gameOver.draw(ctx);
        }
    }
}