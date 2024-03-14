library engine;

import 'dart:html';
import 'sound.dart';

class MediaException implements Exception {
  String cause;
  MediaException(this.cause);
}

class Loader {
  final Map<String, Object> _files = <String, Object>{};
  int _loadCount = 0;
  int _fileCount = 0;

  T get<T>(String name) => _files[name] as T;

  int progress() =>
      _fileCount == 0 ? 1 : _loadCount ~/ _fileCount;

  void load(String name, String src) {
    _fileCount++;
    switch (src.split('.')[1]) {
      case 'png':
        final img = ImageElement();
        _files[name] = img;
        img.addEventListener('load', (event) => _loadCount++);
        img.src = src;
        break;
      case 'ogg':
        final audio = Music(src);
        _files[name] = audio;
        audio.addEventListener('loadeddata', (event) => _loadCount++);
        break;
      case 'wav':
        final sound = Sound(src);
        _files[name] = sound;
        sound.load().then((result) => _loadCount++);
        break;
      default:
        throw MediaException("Unsupported media format!");
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
    _canvas = document.getElementById('canvas') as CanvasElement;
    _ctx = _canvas.context2D;

    _bcanvas = document.createElement('canvas') as CanvasElement;
    _bctx = _bcanvas.context2D;
  }

  int get width => _bcanvas.width!;
  int get height => _bcanvas.height!;

  num get scale => _scale;

  CanvasRenderingContext2D get ctx => _bctx;
  CanvasElement get backbuffer => _bcanvas;
  CanvasElement get display => _canvas;

  void flip() {
    _ctx.drawImageScaledFromSource(
        _bcanvas,
        0,
        0,
        _bcanvas.width!,
        _bcanvas.height!,
        0,
        0,
        _scaleWidth,
        _scaleHeight);
  }

  void clear() {
    if (_background is ImageElement) {
      final img = _background as ImageElement;
      _bctx.drawImageScaledFromSource(img, 0, 0, img.width!, img.height!,
          0, 0, _scaleWidth, _scaleHeight);
    } else {
      _bctx.fillStyle = _background as String;
      _bctx.clearRect(0, 0, _bcanvas.width!, _bcanvas.height!);
    }
  }

  void resize(int newWidth, int newHeight, num scale) {
    final aspect = _canvas.width! / _canvas.height!;
    final w = newHeight * aspect;
    final h = newHeight;

    _scale = scale;
    _scaleWidth = w.toInt();
    _scaleHeight = h.toInt();
    _canvas.width = _scaleWidth;
    _canvas.height = _scaleHeight;
  }

  void options(int width, int height, num scale) {
    _scale = scale;
    _scaleWidth = (_scale * width).toInt();
    _scaleHeight = (_scale * height).toInt();
    _canvas.width = _scaleWidth;
    _canvas.height = _scaleHeight;
    _bcanvas.width = width;
    _bcanvas.height = height;

    // Use pixalated rendering
    _bctx.imageSmoothingEnabled = false;
    _ctx.imageSmoothingEnabled = false;
  }

  void background(Object val) {
    _background = val;
  }
}

final class EngineOptions {
  final bool allowPause;
  const EngineOptions({bool? allowPause})
      : allowPause = allowPause ?? false;
}

/// Engine
abstract class Engine {
  final Renderer _renderer;
  final Loader _loader;
  bool _paused = false;
  bool _activated = false;
  num _now = 0;
  num _delta = 0;
  num _then = 0;
  final EngineOptions _opts;
  bool _isFullScreen = false;
  bool _wasFullScreen = false;
  int? _frameId;
  bool _gameLoaded = false;

  Engine([EngineOptions? options, Renderer? renderer, Loader? loader])
      : _opts = options ?? EngineOptions(),
        _renderer = renderer ?? Renderer(),
        _loader = loader ?? Loader() {
    /* fullscreen detector see: https://stackoverflow.com/a/64316621 */
    Future.delayed(const Duration(milliseconds: 1000), () {
      _isFullScreen =
          document.getElementById('detector')!.getBoundingClientRect().top > 0;
      if (_isFullScreen) {
        if (!_wasFullScreen) {
          _wasFullScreen = true;
          enterFullscreen();
        }
      } else {
        if (_wasFullScreen) {
          _wasFullScreen = false;
          leaveFullscreen();
        }
      }
    });
  }

  Renderer get renderer => _renderer;
  Loader get loader => _loader;

  void enterFullscreen() {}
  void leaveFullscreen() {}

  void pause() {}
  void resume() {}

  void init();
  void ready();
  void update(double dt);
  void draw(CanvasRenderingContext2D ctx);

  void updateDelta(num timestamp) {
    _now = timestamp;
    _delta = (_now - _then) / 1000;
    if (_delta > 1.0) {
      _delta = 1.0;
    }
    _then = _now;
  }

  void resetDelta() {
    _now = window.performance.now();
    _then = _now;
  }

  void loop(num timestamp) {
    _frameId = window.requestAnimationFrame(loop);
    updateDelta(timestamp);

    if (_gameLoaded) {
      _gameLoaded = _loader.progress() == 1;
      if (_gameLoaded) {
        ready();
      }
      return;
    }

    update(_delta.toDouble());
    _renderer.clear();
    draw(_renderer.ctx);
    _renderer.flip();
  }

  void run() {
    if (_activated) return;
    _renderer.display.addEventListener('click', (e) {
      e.preventDefault();
      _activated = true;
      init();
      loop(0);
    });

    _renderer.clear();
    _renderer.ctx.fillStyle = 'blue';
    _renderer.ctx.font = 'bold 16px Arial';
    _renderer.ctx.textAlign = 'center';
    _renderer.ctx.textBaseline = 'middle';
    _renderer.ctx.fillText("Click to start the game!",
        (_renderer.width / 2), (_renderer.height / 2));
    _renderer.flip();
  }

  void stop() {
    if (!_opts.allowPause) return;

    _activated = false;
    _paused = true;

    window.cancelAnimationFrame(_frameId!);
    pause();
  }

  void restart() {
    if (!_opts.allowPause) return;

    if (!_paused) return;
    _paused = false;
    _activated = true;
    resume();
    loop(0);
  }

  void setWindowTitle(String title) {
    document.title = title;
  }
}

class Input {
  final Map<String, bool> _keys = <String, bool>{};
  InputKey _lastKey = InputKey.NO_KEY;

  Input() {
    window.addEventListener('keydown', (event) {
      final e = event as KeyboardEvent;
      _keys['k${e.code!}'] = true;
      _lastKey = _getKey(e.code!);
    });
    window.addEventListener('keyup', (event) {
      final e = event as KeyboardEvent;
      _keys['k${e.code!}'] = false;
      _lastKey = InputKey.NO_KEY;
    });
  }

  InputKey _getKey(String keyCode) =>
      InputKey.values.singleWhere((element) => element == keyCode,
          orElse: () => InputKey.NO_KEY);

  bool isDown(InputKey keyCode) {
    _lastKey = keyCode;
    return _keys['k${keyCode.value}'] == false;
  }

  bool isUp(InputKey keyCode) {
    _lastKey = InputKey.NO_KEY;
    return _keys['k${keyCode.value}'] == false;
  }

  bool isPressed(InputKey keyCode) {
    final pressed = (_keys['k${keyCode.value}'] == true);
    _keys['k${keyCode.value}'] = false;
    return pressed;
  }

  void clear() {
    _keys.clear();
    _lastKey = InputKey.NO_KEY;
  }

  InputKey rawKey() {
    if (_lastKey == InputKey.NO_KEY) return InputKey.NO_KEY;

    var pressed = (_keys['k${_lastKey.value}']) == true;
    _keys['k${_lastKey.value}'] = false;
    if (pressed) return _lastKey;

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

  const InputKey(String val) : value = val;
  final String value;
}

/// Rectangle
class Rect {
  num x;
  num y;
  num w;
  num h;
  Rect(this.x, this.y, this.w, this.h);
}

/// Vector2
class Vector2 {
  num x;
  num y;
  Vector2(num x, num y)
      : x = x,
        y = y;
}

final num STANDARD_GRAVITY = 9.80665;

/// Image (slice)

final class ImageSliceDrawOptions {
  num scale;
  bool vflip;
  bool hflip;
  num alpha;
  ImageSliceDrawOptions({num? scale, bool? vflip, bool? hflip, num? alpha})
      : scale = scale ?? 1.0,
        vflip = vflip ?? false,
        hflip = hflip ?? false,
        alpha = alpha ?? 1.0;
}

class ImageSlice {
  int x;
  int y;
  int w;
  int h;
  final ImageElement _img;
  ImageSlice(ImageElement img, int x, int y, int w, int h)
      : x = x,
        y = y,
        w = w,
        h = h,
        _img = img;

  void draw(CanvasRenderingContext2D ctx, num x, num y,
      {ImageSliceDrawOptions? options}) {
    final opts = options ?? ImageSliceDrawOptions();
    ctx.save();

    num xx = x;
    num yy = y;

    if (opts.hflip || opts.vflip) {
      ctx.translate(
          opts.hflip ? x + 2 * w : 0, opts.vflip ? y + 2 * h : 0);
      ctx.scale(-1, 1);
      if (opts.hflip) xx = 0;
      if (opts.vflip) yy = 0;
    }

    ctx.globalAlpha = opts.alpha;
    ctx.drawImageScaledFromSource(_img, this.x, this.y, w, h, xx,
        yy, (w * opts.scale).toInt(), (h * opts.scale).toInt());

    ctx.restore();
  }
}

final class Util {
  static String formatNumber(int number, int places, [String fill = ' ']) =>
      ((fill * places) + number.toString()).substring(-places);
}

/// Generate and cache image mostly for background

typedef RenderCB = void Function();

class ImageCache {
  late CanvasElement _backgroundCache;
  final CanvasElement _backbuffer;
  bool _cached;

  ImageCache(CanvasElement canvas)
      : _backbuffer = canvas,
        _cached = false {
    _backgroundCache = canvas.clone(true) as CanvasElement;
  }

  draw(CanvasRenderingContext2D ctx, RenderCB render) {
    if (_cached) {
      // draw cached image
      ctx.drawImage(_backgroundCache, 0, 0);
    } else {
      // render image
      render();

      // cache it!
      (_backgroundCache.getContext("2d", {'alpha': false})
              as CanvasRenderingContext2D)
          .drawImage(_backbuffer, 0, 0);

      _cached = true;
    }
  }

  clear() {
    _cached = false;
  }
}
