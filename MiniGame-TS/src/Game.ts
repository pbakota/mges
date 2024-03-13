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

import { GameAsset, Engine, Input, Music, Vector2 } from "lib/Engine";
import { Scene } from "Scene";
import { TitleScene } from "TitleScene";
import { ActionScene } from "ActionScene";

export const enum GameScene {
    GAME_SCENE_TITLE,
    GAME_SCENE_ACTION,
}

// the initial zoom
const displayZoom: number = 1.8;
// Initial size of the playfield
const displaySize: Vector2 = { x: 640, y: 480 };

export class Game extends Engine {
    private _input: Input;
    private _music?: Music;
    private _fps: number;
    private _currentScene: number = 0;
    private _activeScene?: Scene;

    constructor() {
        super({ allowPause: false });
        this._input = new Input();
        this._renderer.options(displaySize.x, displaySize.y, displayZoom);
        this._fps = 0;
    }


    protected enterFullscreen(): void {
        console.log('Entering fullscreen');
        this._renderer.resize(window.innerWidth, window.innerHeight, displayZoom);
    }

    protected leaveFullscreen(): void {
        console.log('Leaving fullscreen');
        this._renderer.options(displaySize.x, displaySize.y, displayZoom);
    }

    public get input() {
        return this._input;
    }

    public get renderer() {
        return this._renderer;
    }

    public override init(): void {
        // Loading game assets

        console.log('loading game assets ...');

        this._loader.load('forest', 'assets/Bitmaps/background.png');
        this._loader.load('titleBitmap', 'assets/Bitmaps/title.png');
        this._loader.load('elements', 'assets/Bitmaps/elements.png');
        this._loader.load('bitmapFont', 'assets/Fonts/font.png');

        this._loader.load('bee1a', 'assets/Sprites/bee1a.png');
        this._loader.load('bee2a', 'assets/Sprites/bee2a.png');

        this._loader.load('blue1a', 'assets/Sprites/blue1a.png');
        this._loader.load('blue2a', 'assets/Sprites/blue2a.png');

        this._loader.load('sniky1a', 'assets/Sprites/sniky1.png');
        this._loader.load('sniky2a', 'assets/Sprites/sniky2.png');

        this._loader.load('foxy1a', 'assets/Sprites/roka1.png');
        this._loader.load('foxy2a', 'assets/Sprites/roka2.png');

        this._loader.load('hero1a', 'assets/Sprites/hero1.png');
        this._loader.load('hero2a', 'assets/Sprites/hero2.png');

        // hero - big for title
        this._loader.load('hero1b', 'assets/Sprites/hero1b.png');
        this._loader.load('hero2b', 'assets/Sprites/hero2b.png');

        this._loader.load('bomb', 'assets/Sprites/bombball.png');
        this._loader.load('medkit', 'assets/Sprites/medkit.png');
        this._loader.load('explosion', 'assets/Sprites/explosion-4.png');
        this._loader.load('bullet', 'assets/Sprites/bullet.png');

        // blood ground
        this._loader.load('blood-ground', 'assets/Sprites/blood_tile.png');

        // blood particle
        this._loader.load('blood-particle', 'assets/Sprites/blood.png');

        // music
        this._loader.load('world-1', 'assets/Sounds/world_1.ogg');

        // healthbar
        this._loader.load('energybar', 'assets/Sprites/healthbar.png');

        // ground
        this._loader.load('ground', 'assets/Sprites/tile_0004.png');

        // explosion
        this._loader.load('explosion', 'assets/Sprites/explosion-4.png');

        // sound fx
        this._loader.load('explosion_long-fx', 'assets/Sounds/explosion_long.wav');
        this._loader.load('explosion-fx', 'assets/Sounds/explosion.wav');
        this._loader.load('fire-fx', 'assets/Sounds/fire.wav');
        this._loader.load('hit-fx', 'assets/Sounds/hit.wav');
        this._loader.load('pickup-fx', 'assets/Sounds/pickup.wav');
        this._loader.load('tick-fx', 'assets/Sounds/tick.wav');
    }

    /**
     * Get loaded asset from loader
     * @param name The asset name
     * @returns Asset
     */
    public getAsset<T extends GameAsset>(name: string): T {
        return this._loader.get<T>(name);
    }

    protected ready(): void {
        console.log('game ready ...');

        this._music = this.getAsset<Music>('world-1');
        this._music.play();
        this._music.loop = true;

        this._currentScene = GameScene.GAME_SCENE_TITLE;
        this._activeScene = new TitleScene(this);
        this._activeScene.enter();
    }

    public changeScene(newScene: number): void {
        if (this._currentScene == newScene) return;
        this._activeScene?.exit();

        switch (newScene) {
            case GameScene.GAME_SCENE_TITLE:
                this._activeScene = new TitleScene(this);
                break;
            case GameScene.GAME_SCENE_ACTION:
                this._activeScene = new ActionScene(this);
                break;
        }

        this._currentScene = newScene;
        this._activeScene?.enter();
    }

    protected update(dt: number): void {
        this._fps = 1.0 / dt;
        this.setWindowTitle(`fps: ${Math.round(this._fps)}`);

        this._activeScene?.update(dt);
    }

    protected draw(ctx: CanvasRenderingContext2D): void {
        this._activeScene?.draw(ctx);
    }

    protected override pause(): void {
        console.log('paused ...');
    }

    public override resume(): void {
        console.log('resume ...');
    }
}
