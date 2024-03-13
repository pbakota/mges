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

import { Music, Sound } from "./Sound";
import { Sprite, Movable, Drawable } from "./Sprite";
import { BitmapText } from "./BitmapText";

// possible asset types
export type GameAsset = HTMLImageElement | Music | Sound;

/**
 * Asset loader
 */
export class Loader {

    private files: Map<string, GameAsset>;
    private loadCount: number;
    private fileCount: number;

    constructor() {
        this.fileCount = 0;
        this.loadCount = 0;
        this.files = new Map<string, GameAsset>();
    }

    public get<T extends GameAsset>(name: string): T {
        return this.files.get(name) as T;
    }

    public progress(): number {
        return this.fileCount == 0 ? 1 : this.loadCount / this.fileCount;
    }

    public load(name: string, src: string) {
        src = src || name;
        this.fileCount++;
        switch (src.split('.').pop()) {
            case 'png':
                const img = new Image();
                this.files.set(name, img);
                img.addEventListener('load', (e) => {
                    this.loadCount++;
                });
                img.src = src;
                break;
            case 'ogg':
                const aud = new Music(src);
                this.files.set(name, aud);
                aud.addEventListener('loadeddata', (e: Event) => {
                    this.loadCount++;
                });
                break;
            case 'wav':
                const sound = new Sound(src);
                this.files.set(name, sound);
                sound.load().then(() => this.loadCount++);
                break;
            default:
                throw "Unsupported media format!";
        }
    }
}

/**
 * The renderer
 */
export class Renderer {

    private _canvas: HTMLCanvasElement;
    private _bcanvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _bctx: CanvasRenderingContext2D;
    private _scale: number = 1.0;
    private _scaleWidth: number = 0;
    private _scaleHeight: number = 0;
    private _background: string | any = '#000000';

    constructor() {
        this._canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this._ctx = this._canvas.getContext('2d')!;
        this._bcanvas = document.createElement('canvas') as HTMLCanvasElement;
        this._bctx = this._bcanvas.getContext('2d')!;
    }

    public get width(): number { return this._bcanvas.width; }

    public get height(): number { return this._bcanvas.height; }

    public get scale(): number { return this._scale; }

    public get ctx(): CanvasRenderingContext2D { return this._bctx; }

    public get backbuffer(): HTMLCanvasElement { return this._bcanvas; }

    public get display(): HTMLCanvasElement { return this._canvas; }

    public flip(): void {
        this._ctx.drawImage(this._bcanvas, 0, 0, this._bcanvas.width, this._bcanvas.height, 0, 0, this._scaleWidth, this._scaleHeight);
    }

    public clear(): void {
        if (this.backbuffer instanceof Image) {
            this._bctx.drawImage(this._background, 0, 0, this._background.width, this._background.height, 0, 0, this._scaleWidth, this._scaleHeight);
        } else {
            this._bctx.fillStyle = this._background;
            this._bctx.fillRect(0, 0, this._bcanvas.width, this._bcanvas.height);
        }
    }

    public resize(newWidth: number, newHeight: number, scale: number): void {

        const aspect = this._canvas.width/this._canvas.height;

        const w = newHeight*aspect;
        const h = newHeight;

        this._scale = scale;
        this._scaleWidth = w;
        this._scaleHeight = h;
        this._canvas.width = this._scaleWidth;
        this._canvas.height = this._scaleHeight;
    }

    public options(width: number, height: number, scale: number): void {
        this._scale = scale;
        this._scaleWidth = this._scale * width;
        this._scaleHeight = this._scale * height;
        this._canvas.width = this._scaleWidth;
        this._canvas.height = this._scaleHeight;
        this._bcanvas.width = width;
        this._bcanvas.height = height;

        // Use pixalated rendering
        this._bctx.imageSmoothingEnabled = false;
        this._ctx.imageSmoothingEnabled = false;
    }

    public background(value: string): void {
        this._background = value;
    }
}

export interface EngineOptions {
    allowPause?: boolean;
}

const defaultOptions: EngineOptions = {
    allowPause: true,
}

/**
 * The engine
 */
export abstract class Engine {

    protected _loader: Loader;
    protected _renderer: Renderer;
    private _reqframe: number = -1;
    private _activated: boolean = false;
    private _paused: boolean = false;
    private _now: number = 0;
    private _then: number = 0;
    private _delta: number = 0;
    private _gameLoaded = false;
    private _options: EngineOptions;
    private _isFullScreen: boolean = false;
    private _wasFullScreen: boolean = false;

    constructor(options: EngineOptions = {}, renderer: Renderer = new Renderer, loader: Loader = new Loader) {
        const opts = Object.assign({}, defaultOptions, options);
        this._loader = loader;
        this._renderer = renderer;
        this._options = opts;

        /* fullscreen detector see: https://stackoverflow.com/a/64316621 */
        window.setInterval(() => {
            this._isFullScreen = document.getElementById('detector')!.getBoundingClientRect().top > 0;
            if(this._isFullScreen) {
                if(!this._wasFullScreen) {
                    this._wasFullScreen = true;
                    this.enterFullscreen();
                }
            } else {
                if(this._wasFullScreen) {
                    this._wasFullScreen = false;
                    this.leaveFullscreen();
                }
            }
        }, 1000);
    }

    // To manage fullscreen
    protected enterFullscreen(): void {};
    protected leaveFullscreen(): void {};

    // Update method executed in every frame
    protected abstract update(dt: number): void;

    // Render screen method executed in every frame
    protected abstract draw(ctx: CanvasRenderingContext2D): void;

    // Executed when game started
    protected abstract init(): void;

    // Executed when the game is ready (all assets are loaded)
    protected abstract ready(): void;

    // Executed when the game needs to be suspended
    protected pause(): void { }

    // Executed when the game needs to be resumed
    protected resume(): void { }

    public updateDelta(timestamp: number): void {
        this._now = timestamp;
        this._delta = (this._now - this._then) / 1000;
        if (this._delta > 1.0) {
            this._delta = 1.0;
        }
        this._then = this._now;
    }

    public resetDelta(): void {
        this._now = window.performance.now();
        this._then = this._now;
    }

    private loop = (timestamp: number): void => {
        this._reqframe = window.requestAnimationFrame(this.loop);
        this.updateDelta(timestamp);

        if (!this._gameLoaded) {
            this._gameLoaded = this._loader.progress() == 1;
            if (this._gameLoaded) {
                this.ready();
            }
            return;
        }

        this.update(this._delta);

        this._renderer.clear();
        this.draw(this._renderer.ctx);
        this._renderer.flip();
    }

    public run(): void {
        if (this._activated) return;
        this._renderer.display.addEventListener('click', (e) => {
            e.preventDefault();
            this._activated = true;
            this.init();
            this.loop(0);
        }, { once: true });

        this._renderer.clear();
        this._renderer.ctx.fillStyle = "blue";
        this._renderer.ctx.font = "bold 16px Arial";
        this._renderer.ctx.textAlign = 'center';
        this._renderer.ctx.textBaseline = 'middle';
        this._renderer.ctx.fillText("Click to start the game!", (this._renderer.width / 2), (this._renderer.height / 2));
        this._renderer.flip();
    }

    public stop(): void {
        if (!this._options.allowPause) return;

        this._activated = false;
        this._paused = true;

        window.cancelAnimationFrame(this._reqframe);
        this.pause();
    }

    public restart(): void {
        if (!this._options.allowPause) return;

        if (!this._paused) return;
        this._paused = false;
        this._activated = true;
        this.resume();
        this.loop(0);
    }

    protected setWindowTitle(title: string): void {
        document.title = title;
    }
}

interface Key {
    [keyCode: string]: boolean;
}

/**
 * User input handler
 */
export class Input {
    private _keys: Key = {};
    private _lastk = InputKey.NO_KEY;

    constructor() {
        window.addEventListener("keydown", (e) => {
            this._keys['k' + e.code] = true;
            this._lastk = e.code;
        });

        window.addEventListener("keyup", (e) => {
            this._keys['k' + e.code] = false;
            this._lastk = InputKey.NO_KEY;
        });
    }

    isDown = (keyCode: string) => {
        this._lastk = keyCode;
        return this._keys['k' + keyCode] == true;
    };

    isUp = (keyCode: string) => {
        this._lastk = InputKey.NO_KEY;
        return this._keys['k' + keyCode] == false;
    };

    isPressed = (keyCode: string) => {
        var pressed = (this._keys['k' + keyCode] == true);
        this._keys['k' + keyCode] = false;
        return pressed;
    };

    clear = () => {
        this._keys = {};
        this._lastk = InputKey.NO_KEY;
    }

    rawKey = () => {
        if (this._lastk == InputKey.NO_KEY)
            return InputKey.NO_KEY;

        var pressed = (this._keys['k' + this._lastk]) == true;
        this._keys['k' + this._lastk] = false;
        if (pressed)
            return this._lastk;

        return InputKey.NO_KEY;
    }
}

/**
 * Key constants
 */
export const InputKey = {
    NO_KEY: '',
    KEY_LEFT: 'ArrowLeft',
    KEY_DOWN: 'ArrowDown',
    KEY_RIGHT: 'ArrowRight',
    KEY_UP: 'ArrowUp',
    KEY_RETURN: 'Enter',
    KEY_ESCAPE: 'Escape',
    KEY_BS: 'Backspace',
    KEY_SPACE: 'Space',
    KEY_PGDOWN: 'PageDown',
    KEY_PGUP: 'PageUp',
    KEY_FIRE: 'KeyZ',
    KEY_A: 'KeyA',
    KEY_B: 'KeyB',
    KEY_C: 'KeyC',
    KEY_D: 'KeyD',
    KEY_E: 'KeyE',
    KEY_F: 'KeyF',
    KEY_G: 'KeyG',
    KEY_H: 'KeyH',
    KEY_I: 'KeyI',
    KEY_J: 'KeyJ',
    KEY_K: 'KeyK',
    KEY_L: 'KeyL',
    KEY_M: 'KeyM',
    KEY_N: 'KeyN',
    KEY_O: 'KeyO',
    KEY_P: 'KeyP',
    KEY_Q: 'KeyQ',
    KEY_R: 'KeyR',
    KEY_S: 'KeyS',
    KEY_T: 'KeyT',
    KEY_U: 'KeyU',
    KEY_V: 'KeyV',
    KEY_W: 'KeyW',
    KEY_X: 'KeyX',
    KEY_Y: 'KeyY',
    KEY_Z: 'KeyZ',
    KEY_F11: 'keyF11',
}

/**
 * Rectangle
 */
export class Rect {
    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    x: number;
    y: number;
    w: number;
    h: number;
}

/**
 * Image (slice)
 */

interface ImageSliceDrawOptions {
    scale?: number;
    vflip?: boolean;
    hflip?: boolean;
    alpha?: number;
}

const defaultImageSliceDrawOptions: ImageSliceDrawOptions = {
    scale: 1.0,
    vflip: false,
    hflip: false,
    alpha: 1.0,
}

export class ImageSlice {
    private _x: number;
    private _y: number;
    private _w: number;
    private _h: number;
    private _img: HTMLImageElement;

    constructor(img: HTMLImageElement, x: number, y: number, w: number, h: number) {
        this._x = x;
        this._y = y;
        this._w = w;
        this._h = h;
        this._img = img;
    }

    public get x() { return this._x; }
    public get y() { return this._y; }
    public get width() { return this._w; }
    public get height() { return this._h; }

    public draw(ctx: CanvasRenderingContext2D, x: number, y: number, options: ImageSliceDrawOptions = {}) {
        const opts = Object.assign({}, defaultImageSliceDrawOptions, options);
        const scale = opts.scale!;
        ctx.save();
        let xx = x;
        let yy = y;
        if (options.hflip || options.vflip) {
            ctx.translate(options.hflip ? x + 2*this._w : 0, opts.vflip ? y + 2*this._h : 0);
            ctx.scale(-1, 1);
            if(opts.hflip) xx = 0;
            if(opts.vflip) yy = 0;
        }
        ctx.globalAlpha = opts.alpha!;
        ctx.drawImage(this._img, this._x, this._y, this._w, this._h, xx, yy, this._w * scale, this._h * scale);
        ctx.restore();
    };
}

export class Vector2 {
    x: number = 0;
    y: number = 0;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
}

export const STANDARD_GRAVITY = 9.80665;

export class Util {
    static formatNumber(num: number, places: number, fill: string = ' '): string {
        return (fill.repeat(places) + num).slice(-places);
    }
}

/**
 * Generate and cache image mostly for background
 */
type RenderCB = (ctx: CanvasRenderingContext2D) => void;

export class ImageCache {
    private _backbuffer: HTMLCanvasElement;
    private _backgroundCache: HTMLCanvasElement;
    private _cached: boolean;

    constructor(canvas: HTMLCanvasElement) {
        this._backbuffer = canvas;
        this._backgroundCache = canvas.cloneNode(true) as HTMLCanvasElement;
        this._cached = false;
    }

    public draw(ctx: CanvasRenderingContext2D, render: RenderCB) {
        if (this._cached) {
            // draw cached image
            ctx.drawImage(this._backgroundCache, 0, 0);
        } else {

            // render image
            render(ctx);

            // cache it!
            this._backgroundCache.getContext("2d", { alpha: false })!.drawImage(this._backbuffer, 0, 0);
            this._cached = true;
        }
    }

    public clear() {
        this._cached = false;
    }
}

export { Sound, Music, Sprite, Movable, Drawable, BitmapText };
