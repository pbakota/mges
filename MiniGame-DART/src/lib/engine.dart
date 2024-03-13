library engine;

import 'dart:html';
import 'sound.dart';

class MediaException implements Exception {
  String cause;
  MediaException(this.cause);
}

class Loader {
  Map<String, Object> _files = new Map<String, Object>();
  int _loadCount = 0;
  int _fileCount = 0;

  T get<T>(String name) => this._files[name] as T;

  int progress() =>
      this._fileCount == 0 ? 1 : this._loadCount ~/ this._fileCount;

  void load(String name, String src) {
    this._fileCount++;
    switch (src.split('.')[0]) {
      case 'png':
        final img = new ImageElement();
        this._files[name] = img;
        img.addEventListener('load', (event) => this._loadCount++);
        img.src = src;
        break;
      case 'ogg':
        final audio = new Music(src);
        this._files[name] = audio;
        audio.addEventListener('loadeddata', (event) => this._loadCount++);
        break;
      case 'wav':
        final sound = new Sound(src);
        this._files[name] = sound;
        sound.load().then((result) => this._loadCount++);
        break;
      default:
        throw new MediaException("Unsupported media format!");
    }
  }
}

class Renderer {
  late CanvasElement _canvas;
  late CanvasElement _bcanvas;
  late CanvasRenderingContext2D _ctx;
  late CanvasRenderingContext2D _bctx;
  num _scale = 1.0;
  int _scaleWidth = 0;
  int _scaleHeight = 0;
  Object _background = '#00000000';

  Renderer() {
    this._canvas = document.getElementById('canvas') as CanvasElement;
    this._ctx = this._canvas.context2D;

    this._bcanvas = document.createElement('canvas') as CanvasElement;
    this._bctx = this._bcanvas.context2D;
  }

  int get width => this._bcanvas.width!;
  int get height => this._bcanvas.height!;

  num get scale => this._scale;

  CanvasRenderingContext2D get ctx => this._bctx;
  CanvasElement get backbuffer => this._bcanvas;
  CanvasElement get display => this._canvas;

  void flip() {
    this._ctx.drawImageScaledFromSource(
        this._bcanvas,
        0,
        0,
        this._bcanvas.width!,
        this._bcanvas.height!,
        0,
        0,
        this._scaleWidth,
        this._scaleHeight);
  }

  void clear() {
    if (this._background is ImageElement) {
      final img = this._background as ImageElement;
      this._bctx.drawImageScaledFromSource(img, 0, 0, img.width!, img.height!,
          0, 0, this._scaleWidth, this._scaleHeight);
    } else {
      this._bctx.fillStyle = this._background as String;
      this._bctx.clearRect(0, 0, this._bcanvas.width!, this._bcanvas.height!);
    }
  }

  void resize(int newWidth, int newHeight, num scale) {
    final aspect = this._canvas.width! / this._canvas.height!;
    final w = newHeight * aspect;
    final h = newHeight;

    this._scale = scale;
    this._scaleWidth = w.toInt();
    this._scaleHeight = h.toInt();
    this._canvas.width = this._scaleWidth;
    this._canvas.height = this._scaleHeight;
  }

  void options(int width, int height, num scale) {
    this._scale = scale;
    this._scaleWidth = (this._scale * width).toInt();
    this._scaleHeight = (this._scale * height).toInt();
    this._canvas.width = this._scaleWidth;
    this._canvas.height = this._scaleHeight;
    this._bcanvas.width = width;
    this._bcanvas.height = height;

    // Use pixalated rendering
    this._bctx.imageSmoothingEnabled = false;
    this._ctx.imageSmoothingEnabled = false;
  }

  void background(Object val) {
    this._background = val;
  }
}

final class EngineOptions {
  final bool allowPause;
  const EngineOptions({bool? allowPause})
      : this.allowPause = allowPause ?? false;
}

/**
 * Engine
 */
abstract class Engine {
  Renderer _renderer;
  Loader _loader;
  bool _paused = false;
  bool _activated = false;
  num _now = 0;
  num _delta = 0;
  num _then = 0;
  EngineOptions _opts;
  bool _isFullScreen = false;
  bool _wasFullScreen = false;
  int? _frameId;
  bool _gameLoaded = false;

  Engine([EngineOptions? options, Renderer? renderer, Loader? loader])
      : this._opts = options ?? new EngineOptions(),
        this._renderer = renderer ?? new Renderer(),
        this._loader = loader ?? new Loader() {
    /* fullscreen detector see: https://stackoverflow.com/a/64316621 */
    new Future.delayed(const Duration(milliseconds: 1000), () {
      this._isFullScreen =
          document.getElementById('detector')!.getBoundingClientRect().top > 0;
      if (this._isFullScreen) {
        if (!this._wasFullScreen) {
          this._wasFullScreen = true;
          this.enterFullscreen();
        }
      } else {
        if (this._wasFullScreen) {
          this._wasFullScreen = false;
          this.leaveFullscreen();
        }
      }
    });
  }

  Renderer get renderer => this._renderer;
  Loader get loader => this._loader;

  void enterFullscreen() {}
  void leaveFullscreen() {}

  void pause() {}
  void resume() {}

  void init();
  void ready();
  void update(double dt);
  void draw(CanvasRenderingContext2D ctx);

  void updateDelta(num timestamp) {
    this._now = timestamp;
    this._delta = (this._now - this._then) / 1000;
    if (this._delta > 1.0) {
      this._delta = 1.0;
    }
    this._then = this._now;
  }

  void resetDelta() {
    this._now = window.performance.now();
    this._then = this._now;
  }

  void loop(num timestamp) {
    this._frameId = window.requestAnimationFrame(this.loop);
    this.updateDelta(timestamp);

    if (this._gameLoaded) {
      this._gameLoaded = this._loader.progress() == 1;
      if (this._gameLoaded) {
        this.ready();
      }
      return;
    }

    this.update(this._delta.toDouble());
    this._renderer.clear();
    this.draw(this._renderer.ctx);
    this._renderer.flip();
  }

  void run() {
    if (this._activated) return;
    this._renderer.display.addEventListener('click', (e) {
      e.preventDefault();
      this._activated = true;
      this.init();
      this.loop(0);
    });

    this._renderer.clear();
    this._renderer.ctx.fillStyle = 'blue';
    this._renderer.ctx.font = 'bold 16px Arial';
    this._renderer.ctx.textAlign = 'center';
    this._renderer.ctx.textBaseline = 'middle';
    this._renderer.ctx.fillText("Click to start the game!",
        (this._renderer.width / 2), (this._renderer.height / 2));
    this._renderer.flip();
  }

  void stop() {
    if (!this._opts.allowPause) return;

    this._activated = false;
    this._paused = true;

    window.cancelAnimationFrame(this._frameId!);
    this.pause();
  }

  void restart() {
    if (!this._opts.allowPause) return;

    if (!this._paused) return;
    this._paused = false;
    this._activated = true;
    this.resume();
    this.loop(0);
  }

  void setWindowTitle(String title) {
    document.title = title;
  }
}

class Input {
  Map<String, bool> _keys = new Map<String, bool>();
  InputKey _lastKey = InputKey.NO_KEY;

  Input() {
    window.addEventListener('keydown', (event) {
      final e = event as KeyboardEvent;
      this._keys['k' + e.code!] = true;
      this._lastKey = this._getKey(e.code!);
    });
    window.addEventListener('keyup', (event) {
      final e = event as KeyboardEvent;
      this._keys['k' + e.code!] = false;
      this._lastKey = InputKey.NO_KEY;
    });
  }

  InputKey _getKey(String keyCode) =>
      InputKey.values.singleWhere((element) => element == keyCode,
          orElse: () => InputKey.NO_KEY);

  bool isDown(InputKey keyCode) {
    this._lastKey = keyCode;
    return this._keys['k' + keyCode.value] == false;
  }

  bool isUp(InputKey keyCode) {
    this._lastKey = InputKey.NO_KEY;
    return this._keys['k' + keyCode.value] == false;
  }

  bool isPressed(InputKey keyCode) {
    final pressed = (this._keys['k' + keyCode.value] == true);
    this._keys['k' + keyCode.value] = false;
    return pressed;
  }

  void clear() {
    this._keys.clear();
    this._lastKey = InputKey.NO_KEY;
  }

  InputKey rawKey() {
    if (this._lastKey == InputKey.NO_KEY) return InputKey.NO_KEY;

    var pressed = (this._keys['k' + this._lastKey.value]) == true;
    this._keys['k' + this._lastKey.value] = false;
    if (pressed) return this._lastKey;

    return InputKey.NO_KEY;
  }
}

enum InputKey {
  // Key constants
  NO_KEY(''),
  KEY_LEFT('ArrowLeft'),
  KEY_DOWN('ArrowDown'),
  KEY_RIGHT('ArrowRight'),
  KEY_UP('ArrowUp'),
  KEY_RETURN('Enter'),
  KEY_ESCAPE('Escape'),
  KEY_BS('Backspace'),
  KEY_SPACE('Space'),
  KEY_PGDOWN('PageDown'),
  KEY_PGUP('PageUp'),
  KEY_FIRE('KeyZ'),
  KEY_A('KeyA'),
  KEY_B('KeyB'),
  KEY_C('KeyC'),
  KEY_D('KeyD'),
  KEY_E('KeyE'),
  KEY_F('KeyF'),
  KEY_G('KeyG'),
  KEY_H('KeyH'),
  KEY_I('KeyI'),
  KEY_J('KeyJ'),
  KEY_K('KeyK'),
  KEY_L('KeyL'),
  KEY_M('KeyM'),
  KEY_N('KeyN'),
  KEY_O('KeyO'),
  KEY_P('KeyP'),
  KEY_Q('KeyQ'),
  KEY_R('KeyR'),
  KEY_S('KeyS'),
  KEY_T('KeyT'),
  KEY_U('KeyU'),
  KEY_V('KeyV'),
  KEY_W('KeyW'),
  KEY_X('KeyX'),
  KEY_Y('KeyY'),
  KEY_Z('KeyZ'),
  KEY_F11('keyF11');

  const InputKey(String val) : this.value = val;
  final String value;
}

/**
 * Rectangle
 */
class Rect {
  num x;
  num y;
  num w;
  num h;
  Rect(this.x, this.y, this.w, this.h);
}

/**
 * Vector2
 */
class Vector2 {
  num x;
  num y;
  Vector2(num x, num y)
      : this.x = x,
        this.y = y;
}

final num STANDARD_GRAVITY = 9.80665;

/**
 * Image (slice)
 */

final class ImageSliceDrawOptions {
  num scale;
  bool vflip;
  bool hflip;
  num alpha;
  ImageSliceDrawOptions({num? scale, bool? vflip, bool? hflip, num? alpha})
      : this.scale = scale ?? 1.0,
        this.vflip = vflip ?? false,
        this.hflip = hflip ?? false,
        this.alpha = alpha ?? 1.0;
}

class ImageSlice {
  int x;
  int y;
  int w;
  int h;
  ImageElement _img;
  ImageSlice(ImageElement img, int x, int y, int w, int h)
      : this.x = x,
        this.y = y,
        this.w = w,
        this.h = h,
        this._img = img;

  void draw(CanvasRenderingContext2D ctx, num x, num y,
      {ImageSliceDrawOptions? options}) {
    final opts = options ?? new ImageSliceDrawOptions();
    ctx.save();

    num xx = x;
    num yy = y;

    if (opts.hflip || opts.vflip) {
      ctx.translate(
          opts.hflip ? x + 2 * this.w : 0, opts.vflip ? y + 2 * this.h : 0);
      ctx.scale(-1, 1);
      if (opts.hflip) xx = 0;
      if (opts.vflip) yy = 0;
    }

    ctx.globalAlpha = opts.alpha;
    ctx.drawImageScaledFromSource(this._img, this.x, this.y, this.w, this.h, xx,
        yy, (this.w * opts.scale).toInt(), (this.h * opts.scale).toInt());

    ctx.restore();
  }
}

final class Util {
  static String formatNumber(int number, int places, [String fill = ' ']) =>
      ((fill * places) + number.toString()).substring(-places);
}

/**
 * Generate and cache image mostly for background
 */

typedef void RenderCB();

class ImageCache {
  late CanvasElement _backgroundCache;
  CanvasElement _backbuffer;
  bool _cached;

  ImageCache(CanvasElement canvas)
      : this._backbuffer = canvas,
        this._cached = false {
    this._backgroundCache = canvas.clone(true) as CanvasElement;
  }

  draw(CanvasRenderingContext2D ctx, RenderCB render) {
    if (this._cached) {
      // draw cached image
      ctx.drawImage(this._backgroundCache, 0, 0);
    } else {
      // render image
      render();

      // cache it!
      (this._backgroundCache.getContext("2d", {'alpha': false})
              as CanvasRenderingContext2D)
          .drawImage(this._backbuffer, 0, 0);

      this._cached = true;
    }
  }

  clear() {
    this._cached = false;
  }
}
