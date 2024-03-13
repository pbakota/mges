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

import { BitmapText, ImageCache, ImageSlice, InputKey, Util, Vector2 } from "lib/Engine";
import { Mob, MobBee, MobBlue, MobFoxy, MobSniky } from "Mobs";
import { Game, GameScene } from "Game";
import { BaseScene } from "Scene";
import { Bomb, Medkit } from "Powerups";
import { HeroB } from "Hero";

const FOREST_BASE_COLOR = '#0c1122';
export class TitleScene extends BaseScene {

    private _title: ImageSlice;
    private _forest: ImageSlice;
    private _text: BitmapText;
    private _mobs: Mob[];
    private _bomb: Bomb;
    private _medkit: Medkit;
    private _hero: HeroB;
    private _backgroundCache: ImageCache;

    constructor(game: Game) {
        super(game);

        this._title = new ImageSlice(this._game.getAsset<HTMLImageElement>('titleBitmap'), 0, 0, 640, 480);
        this._forest = new ImageSlice(this._game.getAsset<HTMLImageElement>('forest'), 0, 0, 640, 312);
        this._text = new BitmapText(this._game.getAsset<HTMLImageElement>('bitmapFont'));

        this._mobs = [
            new MobBee(this._game, false, new Vector2(80, 140), 0),
            new MobBlue(this._game, false, new Vector2(80, 180), 0),
            new MobSniky(this._game, false, new Vector2(80, 220), 0),
            new MobFoxy(this._game, false, new Vector2(80, 260), 0),
        ];
        this._bomb = new Bomb(this._game, new Vector2(80, 300));
        this._medkit = new Medkit(this._game, new Vector2(80, 340));
        this._hero = new HeroB(this._game, new Vector2(40, 40));

        this._backgroundCache = new ImageCache(this._game.renderer.backbuffer);
    }

    public override update(dt: number): void {

        // update mobs
        this._mobs.forEach(m => m.update(dt));

        // update hero
        this._hero.update(dt);

        // check for game start
        if (this._game.input.isPressed(InputKey.KEY_FIRE)) {
            this._game.changeScene(GameScene.GAME_SCENE_ACTION);
        }
    }

    public override draw(ctx: CanvasRenderingContext2D): void {
        // generate static cache
        this._backgroundCache.draw(ctx, () => {
            // draw forest background
            this._forest.draw(ctx, 0, 0);
            ctx.fillStyle = FOREST_BASE_COLOR;
            ctx.fillRect(0, 312, 640, 168);

            // draw 'rabbit unleashed'
            this._title.draw(ctx, 0, 0);

            this._text.draw(ctx, 120, 150, 'white', `BEE .......... ${Util.formatNumber(this._mobs[0].points, 3)} POINTS`);
            this._text.draw(ctx, 120, 190, 'white', `BLUE ......... ${Util.formatNumber(this._mobs[1].points, 3)} POINTS`);
            this._text.draw(ctx, 120, 230, 'white', `SNIKY ........ ${Util.formatNumber(this._mobs[2].points, 3)} POINTS`);
            this._text.draw(ctx, 120, 270, 'white', `FOXY ......... ${Util.formatNumber(this._mobs[3].points, 3)} POINTS`);

            // powerups
            this._text.draw(ctx, 120, 310, 'white', `BOMB ......... ${Util.formatNumber(this._bomb.points, 3)} POINTS`);
            this._text.draw(ctx, 120, 350, 'white', `MEDKIT ....... ${Util.formatNumber(this._medkit.points, 3)} POINTS`);

            // information
            this._text.draw(ctx, 140, 420, 'white', "PRESS \"FIRE\" TO START");
            this._text.draw(ctx, 208, 480 - 18, 'gray', "PRESS \"F11\" FOR FULLSCREEN", { scale: 1.0 });

            // powerups
            this._bomb.draw(ctx);
            this._medkit.draw(ctx);
        });

        // draw zoomed here at the corner
        this._hero.draw(ctx);

        // mobs
        this._mobs.forEach(m => m.draw(ctx));
    }
}