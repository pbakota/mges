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

import { ImageSlice } from "lib/Engine";

interface Glyph {
    [index: string]: ImageSlice;
}

export interface DrawTextOptions {
    shadow?: boolean;
    shadowColor?: string;
    scale?: number;
}

const glyph_scale = 2.0;

const defaultOptions: DrawTextOptions = {
    scale: glyph_scale,
    shadow: true,
    shadowColor: 'black'
};

export class BitmapText {
    private _glyphs: Glyph = {};
    private _buffer: HTMLCanvasElement;
    private _bufferCtx: CanvasRenderingContext2D;

    constructor(image: HTMLImageElement) {

        this._buffer = document.createElement('canvas');
        this._buffer.width = 640 + 2;
        this._buffer.height = glyph_scale * 8 + 2 * glyph_scale;
        this._bufferCtx = this._buffer.getContext('2d')!;
        this._bufferCtx.imageSmoothingEnabled = false;

        this._glyphs[' '] = new ImageSlice(image, 0 * 8, 0, 8, 8);
        this._glyphs['!'] = new ImageSlice(image, 1 * 8, 0, 8, 8);
        this._glyphs['"'] = new ImageSlice(image, 2 * 8, 0, 8, 8);
        this._glyphs['#'] = new ImageSlice(image, 3 * 8, 0, 8, 8);
        this._glyphs['$'] = new ImageSlice(image, 4 * 8, 0, 8, 8);
        this._glyphs['%'] = new ImageSlice(image, 5 * 8, 0, 8, 8);
        this._glyphs['&'] = new ImageSlice(image, 6 * 8, 0, 8, 8);
        this._glyphs["'"] = new ImageSlice(image, 7 * 8, 0, 8, 8);
        this._glyphs['('] = new ImageSlice(image, 8 * 8, 0, 8, 8);
        this._glyphs[')'] = new ImageSlice(image, 9 * 8, 0, 8, 8);
        this._glyphs['*'] = new ImageSlice(image, 10 * 8, 0, 8, 8);
        this._glyphs['+'] = new ImageSlice(image, 11 * 8, 0, 8, 8);
        this._glyphs[','] = new ImageSlice(image, 12 * 8, 0, 8, 8);
        this._glyphs['-'] = new ImageSlice(image, 13 * 8, 0, 8, 8);
        this._glyphs['.'] = new ImageSlice(image, 14 * 8, 0, 8, 8);
        this._glyphs['/'] = new ImageSlice(image, 15 * 8, 0, 8, 8);
        this._glyphs['0'] = new ImageSlice(image, 16 * 8, 0, 8, 8);
        this._glyphs['1'] = new ImageSlice(image, 17 * 8, 0, 8, 8);
        this._glyphs['2'] = new ImageSlice(image, 18 * 8, 0, 8, 8);
        this._glyphs['3'] = new ImageSlice(image, 19 * 8, 0, 8, 8);
        this._glyphs['4'] = new ImageSlice(image, 20 * 8, 0, 8, 8);
        this._glyphs['5'] = new ImageSlice(image, 21 * 8, 0, 8, 8);
        this._glyphs['6'] = new ImageSlice(image, 22 * 8, 0, 8, 8);
        this._glyphs['7'] = new ImageSlice(image, 23 * 8, 0, 8, 8);
        this._glyphs['8'] = new ImageSlice(image, 24 * 8, 0, 8, 8);
        this._glyphs['9'] = new ImageSlice(image, 25 * 8, 0, 8, 8);
        this._glyphs[':'] = new ImageSlice(image, 26 * 8, 0, 8, 8);
        this._glyphs[';'] = new ImageSlice(image, 27 * 8, 0, 8, 8);
        this._glyphs['<'] = new ImageSlice(image, 28 * 8, 0, 8, 8);
        this._glyphs['='] = new ImageSlice(image, 29 * 8, 0, 8, 8);
        this._glyphs['>'] = new ImageSlice(image, 30 * 8, 0, 8, 8);
        this._glyphs['?'] = new ImageSlice(image, 31 * 8, 0, 8, 8);
        this._glyphs['@'] = new ImageSlice(image, 0 * 8, 8, 8, 8);
        this._glyphs['A'] = new ImageSlice(image, 1 * 8, 8, 8, 8);
        this._glyphs['B'] = new ImageSlice(image, 2 * 8, 8, 8, 8);
        this._glyphs['C'] = new ImageSlice(image, 3 * 8, 8, 8, 8);
        this._glyphs['D'] = new ImageSlice(image, 4 * 8, 8, 8, 8);
        this._glyphs['E'] = new ImageSlice(image, 5 * 8, 8, 8, 8);
        this._glyphs['F'] = new ImageSlice(image, 6 * 8, 8, 8, 8);
        this._glyphs['G'] = new ImageSlice(image, 7 * 8, 8, 8, 8);
        this._glyphs['H'] = new ImageSlice(image, 8 * 8, 8, 8, 8);
        this._glyphs['I'] = new ImageSlice(image, 9 * 8, 8, 8, 8);
        this._glyphs['J'] = new ImageSlice(image, 10 * 8, 8, 8, 8);
        this._glyphs['K'] = new ImageSlice(image, 11 * 8, 8, 8, 8);
        this._glyphs['L'] = new ImageSlice(image, 12 * 8, 8, 8, 8);
        this._glyphs['M'] = new ImageSlice(image, 13 * 8, 8, 8, 8);
        this._glyphs['N'] = new ImageSlice(image, 14 * 8, 8, 8, 8);
        this._glyphs['O'] = new ImageSlice(image, 15 * 8, 8, 8, 8);
        this._glyphs['P'] = new ImageSlice(image, 16 * 8, 8, 8, 8);
        this._glyphs['Q'] = new ImageSlice(image, 17 * 8, 8, 8, 8);
        this._glyphs['R'] = new ImageSlice(image, 18 * 8, 8, 8, 8);
        this._glyphs['S'] = new ImageSlice(image, 19 * 8, 8, 8, 8);
        this._glyphs['T'] = new ImageSlice(image, 20 * 8, 8, 8, 8);
        this._glyphs['U'] = new ImageSlice(image, 21 * 8, 8, 8, 8);
        this._glyphs['V'] = new ImageSlice(image, 22 * 8, 8, 8, 8);
        this._glyphs['W'] = new ImageSlice(image, 23 * 8, 8, 8, 8);
        this._glyphs['X'] = new ImageSlice(image, 24 * 8, 8, 8, 8);
        this._glyphs['Y'] = new ImageSlice(image, 25 * 8, 8, 8, 8);
        this._glyphs['Z'] = new ImageSlice(image, 26 * 8, 8, 8, 8);
        this._glyphs['['] = new ImageSlice(image, 27 * 8, 8, 8, 8);
        this._glyphs['|'] = new ImageSlice(image, 28 * 8, 8, 8, 8);
        this._glyphs[']'] = new ImageSlice(image, 29 * 8, 8, 8, 8);
        this._glyphs['{'] = new ImageSlice(image, 30 * 8, 8, 8, 8);
        this._glyphs['}'] = new ImageSlice(image, 31 * 8, 8, 8, 8);
        this._glyphs['a'] = new ImageSlice(image, 0 * 8, 16, 8, 8);
        this._glyphs['b'] = new ImageSlice(image, 1 * 8, 16, 8, 8);
        this._glyphs['c'] = new ImageSlice(image, 2 * 8, 16, 8, 8);
        this._glyphs['d'] = new ImageSlice(image, 3 * 8, 16, 8, 8);
        this._glyphs['e'] = new ImageSlice(image, 4 * 8, 16, 8, 8);
        this._glyphs['f'] = new ImageSlice(image, 5 * 8, 16, 8, 8);
        this._glyphs['g'] = new ImageSlice(image, 6 * 8, 16, 8, 8);
        this._glyphs['h'] = new ImageSlice(image, 7 * 8, 16, 8, 8);
        this._glyphs['i'] = new ImageSlice(image, 8 * 8, 16, 8, 8);
        this._glyphs['j'] = new ImageSlice(image, 9 * 8, 16, 8, 8);
        this._glyphs['k'] = new ImageSlice(image, 10 * 8, 16, 8, 8);
        this._glyphs['l'] = new ImageSlice(image, 11 * 8, 16, 8, 8);
        this._glyphs['m'] = new ImageSlice(image, 12 * 8, 16, 8, 8);
        this._glyphs['n'] = new ImageSlice(image, 13 * 8, 16, 8, 8);
        this._glyphs['o'] = new ImageSlice(image, 14 * 8, 16, 8, 8);
        this._glyphs['p'] = new ImageSlice(image, 15 * 8, 16, 8, 8);
        this._glyphs['q'] = new ImageSlice(image, 16 * 8, 16, 8, 8);
        this._glyphs['r'] = new ImageSlice(image, 17 * 8, 16, 8, 8);
        this._glyphs['s'] = new ImageSlice(image, 18 * 8, 16, 8, 8);
        this._glyphs['t'] = new ImageSlice(image, 19 * 8, 16, 8, 8);
        this._glyphs['u'] = new ImageSlice(image, 20 * 8, 16, 8, 8);
        this._glyphs['v'] = new ImageSlice(image, 21 * 8, 16, 8, 8);
        this._glyphs['w'] = new ImageSlice(image, 22 * 8, 16, 8, 8);
        this._glyphs['x'] = new ImageSlice(image, 23 * 8, 16, 8, 8);
        this._glyphs['y'] = new ImageSlice(image, 24 * 8, 16, 8, 8);
        this._glyphs['z'] = new ImageSlice(image, 25 * 8, 16, 8, 8);
    }

    public draw(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, text: string, options: DrawTextOptions = {}): void {

        const opts = Object.assign({}, defaultOptions, options);

        this._bufferCtx.save();
        this._bufferCtx.clearRect(0, 0, this._buffer.width, this._buffer.height);

        let xx = 0; let yy = 0;
        for (let c = 0; c < text.length; ++c) {
            this._glyphs[text[c]].draw(this._bufferCtx, xx, yy, { scale: opts.scale });
            xx += 8 * opts.scale!;
        }

        // coloring
        this._bufferCtx.fillStyle = color;
        this._bufferCtx.globalCompositeOperation = "source-in";
        this._bufferCtx.fillRect(0, 0, text.length * 8 * opts.scale!, 8 * opts.scale!);
        this._bufferCtx.restore();

        if (opts.shadow) {
            // add shadow
            ctx.save();
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.shadowColor = opts.shadowColor!;
            ctx.shadowBlur = 0;
            ctx.drawImage(this._buffer, x, y);
            ctx.restore();
        } else {
            ctx.drawImage(this._buffer, x, y);
        }
    }
}
