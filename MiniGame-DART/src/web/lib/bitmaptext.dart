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

// ignore_for_file: constant_identifier_names

import 'dart:html';

import 'engine.dart';

const GLYPH_SCALE = 2.0;

final class DrawTextOptions {
  bool shadow;
  String shadowColor;
  num scale;
  DrawTextOptions({bool? shadow, String? shadowColor, num? scale})
      : shadow = shadow ?? false,
        shadowColor = shadowColor ?? '#00000000',
        scale = scale ?? GLYPH_SCALE;
}

class BitmapText {
  final Map<String, ImageSlice> _glyphs = {};
  late CanvasElement _buffer;
  late CanvasRenderingContext2D _bufferCtx;

  BitmapText(ImageElement image) {
    _buffer = document.createElement('canvas') as CanvasElement;
    _buffer.width = 640 + 2;
    _buffer.height = (GLYPH_SCALE * 8 + 2 * GLYPH_SCALE).toInt();
    _bufferCtx = _buffer.context2D;
    _bufferCtx.imageSmoothingEnabled = false;

    _glyphs[' '] = ImageSlice(image, 0 * 8, 0, 8, 8);
    _glyphs['!'] = ImageSlice(image, 1 * 8, 0, 8, 8);
    _glyphs['"'] = ImageSlice(image, 2 * 8, 0, 8, 8);
    _glyphs['#'] = ImageSlice(image, 3 * 8, 0, 8, 8);
    _glyphs['\$'] = ImageSlice(image, 4 * 8, 0, 8, 8);
    _glyphs['%'] = ImageSlice(image, 5 * 8, 0, 8, 8);
    _glyphs['&'] = ImageSlice(image, 6 * 8, 0, 8, 8);
    _glyphs["'"] = ImageSlice(image, 7 * 8, 0, 8, 8);
    _glyphs['('] = ImageSlice(image, 8 * 8, 0, 8, 8);
    _glyphs[')'] = ImageSlice(image, 9 * 8, 0, 8, 8);
    _glyphs['*'] = ImageSlice(image, 10 * 8, 0, 8, 8);
    _glyphs['+'] = ImageSlice(image, 11 * 8, 0, 8, 8);
    _glyphs[','] = ImageSlice(image, 12 * 8, 0, 8, 8);
    _glyphs['-'] = ImageSlice(image, 13 * 8, 0, 8, 8);
    _glyphs['.'] = ImageSlice(image, 14 * 8, 0, 8, 8);
    _glyphs['/'] = ImageSlice(image, 15 * 8, 0, 8, 8);
    _glyphs['0'] = ImageSlice(image, 16 * 8, 0, 8, 8);
    _glyphs['1'] = ImageSlice(image, 17 * 8, 0, 8, 8);
    _glyphs['2'] = ImageSlice(image, 18 * 8, 0, 8, 8);
    _glyphs['3'] = ImageSlice(image, 19 * 8, 0, 8, 8);
    _glyphs['4'] = ImageSlice(image, 20 * 8, 0, 8, 8);
    _glyphs['5'] = ImageSlice(image, 21 * 8, 0, 8, 8);
    _glyphs['6'] = ImageSlice(image, 22 * 8, 0, 8, 8);
    _glyphs['7'] = ImageSlice(image, 23 * 8, 0, 8, 8);
    _glyphs['8'] = ImageSlice(image, 24 * 8, 0, 8, 8);
    _glyphs['9'] = ImageSlice(image, 25 * 8, 0, 8, 8);
    _glyphs[':'] = ImageSlice(image, 26 * 8, 0, 8, 8);
    _glyphs[';'] = ImageSlice(image, 27 * 8, 0, 8, 8);
    _glyphs['<'] = ImageSlice(image, 28 * 8, 0, 8, 8);
    _glyphs['='] = ImageSlice(image, 29 * 8, 0, 8, 8);
    _glyphs['>'] = ImageSlice(image, 30 * 8, 0, 8, 8);
    _glyphs['?'] = ImageSlice(image, 31 * 8, 0, 8, 8);
    _glyphs['@'] = ImageSlice(image, 0 * 8, 8, 8, 8);
    _glyphs['A'] = ImageSlice(image, 1 * 8, 8, 8, 8);
    _glyphs['B'] = ImageSlice(image, 2 * 8, 8, 8, 8);
    _glyphs['C'] = ImageSlice(image, 3 * 8, 8, 8, 8);
    _glyphs['D'] = ImageSlice(image, 4 * 8, 8, 8, 8);
    _glyphs['E'] = ImageSlice(image, 5 * 8, 8, 8, 8);
    _glyphs['F'] = ImageSlice(image, 6 * 8, 8, 8, 8);
    _glyphs['G'] = ImageSlice(image, 7 * 8, 8, 8, 8);
    _glyphs['H'] = ImageSlice(image, 8 * 8, 8, 8, 8);
    _glyphs['I'] = ImageSlice(image, 9 * 8, 8, 8, 8);
    _glyphs['J'] = ImageSlice(image, 10 * 8, 8, 8, 8);
    _glyphs['K'] = ImageSlice(image, 11 * 8, 8, 8, 8);
    _glyphs['L'] = ImageSlice(image, 12 * 8, 8, 8, 8);
    _glyphs['M'] = ImageSlice(image, 13 * 8, 8, 8, 8);
    _glyphs['N'] = ImageSlice(image, 14 * 8, 8, 8, 8);
    _glyphs['O'] = ImageSlice(image, 15 * 8, 8, 8, 8);
    _glyphs['P'] = ImageSlice(image, 16 * 8, 8, 8, 8);
    _glyphs['Q'] = ImageSlice(image, 17 * 8, 8, 8, 8);
    _glyphs['R'] = ImageSlice(image, 18 * 8, 8, 8, 8);
    _glyphs['S'] = ImageSlice(image, 19 * 8, 8, 8, 8);
    _glyphs['T'] = ImageSlice(image, 20 * 8, 8, 8, 8);
    _glyphs['U'] = ImageSlice(image, 21 * 8, 8, 8, 8);
    _glyphs['V'] = ImageSlice(image, 22 * 8, 8, 8, 8);
    _glyphs['W'] = ImageSlice(image, 23 * 8, 8, 8, 8);
    _glyphs['X'] = ImageSlice(image, 24 * 8, 8, 8, 8);
    _glyphs['Y'] = ImageSlice(image, 25 * 8, 8, 8, 8);
    _glyphs['Z'] = ImageSlice(image, 26 * 8, 8, 8, 8);
    _glyphs['['] = ImageSlice(image, 27 * 8, 8, 8, 8);
    _glyphs['|'] = ImageSlice(image, 28 * 8, 8, 8, 8);
    _glyphs[']'] = ImageSlice(image, 29 * 8, 8, 8, 8);
    _glyphs['{'] = ImageSlice(image, 30 * 8, 8, 8, 8);
    _glyphs['}'] = ImageSlice(image, 31 * 8, 8, 8, 8);
    _glyphs['a'] = ImageSlice(image, 0 * 8, 16, 8, 8);
    _glyphs['b'] = ImageSlice(image, 1 * 8, 16, 8, 8);
    _glyphs['c'] = ImageSlice(image, 2 * 8, 16, 8, 8);
    _glyphs['d'] = ImageSlice(image, 3 * 8, 16, 8, 8);
    _glyphs['e'] = ImageSlice(image, 4 * 8, 16, 8, 8);
    _glyphs['f'] = ImageSlice(image, 5 * 8, 16, 8, 8);
    _glyphs['g'] = ImageSlice(image, 6 * 8, 16, 8, 8);
    _glyphs['h'] = ImageSlice(image, 7 * 8, 16, 8, 8);
    _glyphs['i'] = ImageSlice(image, 8 * 8, 16, 8, 8);
    _glyphs['j'] = ImageSlice(image, 9 * 8, 16, 8, 8);
    _glyphs['k'] = ImageSlice(image, 10 * 8, 16, 8, 8);
    _glyphs['l'] = ImageSlice(image, 11 * 8, 16, 8, 8);
    _glyphs['m'] = ImageSlice(image, 12 * 8, 16, 8, 8);
    _glyphs['n'] = ImageSlice(image, 13 * 8, 16, 8, 8);
    _glyphs['o'] = ImageSlice(image, 14 * 8, 16, 8, 8);
    _glyphs['p'] = ImageSlice(image, 15 * 8, 16, 8, 8);
    _glyphs['q'] = ImageSlice(image, 16 * 8, 16, 8, 8);
    _glyphs['r'] = ImageSlice(image, 17 * 8, 16, 8, 8);
    _glyphs['s'] = ImageSlice(image, 18 * 8, 16, 8, 8);
    _glyphs['t'] = ImageSlice(image, 19 * 8, 16, 8, 8);
    _glyphs['u'] = ImageSlice(image, 20 * 8, 16, 8, 8);
    _glyphs['v'] = ImageSlice(image, 21 * 8, 16, 8, 8);
    _glyphs['w'] = ImageSlice(image, 22 * 8, 16, 8, 8);
    _glyphs['x'] = ImageSlice(image, 23 * 8, 16, 8, 8);
    _glyphs['y'] = ImageSlice(image, 24 * 8, 16, 8, 8);
    _glyphs['z'] = ImageSlice(image, 25 * 8, 16, 8, 8);
  }

  void draw(
      CanvasRenderingContext2D ctx, int x, int y, String color, String text,
      [DrawTextOptions? options]) {
    final opts = options ?? DrawTextOptions();

    _bufferCtx.save();
    _bufferCtx.clearRect(0, 0, _buffer.width!, _buffer.height!);

    var xx = 0;
    var yy = 0;
    for (var c = 0; c < text.length; ++c) {
      _glyphs[text[c]]?.draw(_bufferCtx, xx, yy,
          options: ImageSliceDrawOptions(scale: opts.scale));
      xx += (8 * opts.scale).toInt();
    }

    // coloring
    _bufferCtx.fillStyle = color;
    _bufferCtx.globalCompositeOperation = "source-in";
    _bufferCtx.fillRect(0, 0, text.length * 8 * opts.scale, 8 * opts.scale);
    _bufferCtx.restore();

    if (opts.shadow) {
      // add shadow
      ctx.save();
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.shadowColor = opts.shadowColor;
      ctx.shadowBlur = 0;
      ctx.drawImage(_buffer, x, y);
      ctx.restore();
    } else {
      ctx.drawImage(_buffer, x, y);
    }
  }
}
