// src/lib/Sound.ts
var audioCtx = new AudioContext;

class Sound {
  _src;
  _buffer;
  _loop = false;
  _volume = 1;
  constructor(src) {
    this._src = src;
  }
  load() {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest;
      request.open("GET", this._src, true);
      request.responseType = "arraybuffer";
      request.onload = () => {
        audioCtx.decodeAudioData(request.response, (buffer) => {
          this._buffer = buffer;
          resolve();
        });
      };
      request.onerror = (e) => reject(e);
      request.send();
    });
  }
  set loop(value) {
    this._loop = value;
  }
  set volume(value) {
    this._volume = value;
  }
  play() {
    const source = audioCtx.createBufferSource();
    const gainNode = audioCtx.createGain();
    gainNode.connect(audioCtx.destination);
    gainNode.gain.value = this._volume;
    source.connect(gainNode).connect(audioCtx.destination);
    source.buffer = this._buffer;
    source.loop = this._loop;
    source.start();
  }
}

class Music {
  _sound;
  constructor(src) {
    this._sound = new Audio;
    this._sound.preload = "auto";
    this._sound.src = src;
    document.body.appendChild(this._sound);
  }
  get loop() {
    return this._sound.loop;
  }
  set loop(value) {
    this._sound.loop = value;
  }
  set volume(value) {
    this._sound.volume = value;
  }
  addEventListener(event, cb, opts) {
    this._sound?.addEventListener(event, cb, opts);
  }
  removeEventListener(event, cb, opts) {
    this._sound?.removeEventListener(event, cb, opts);
  }
  play() {
    return this._sound?.play();
  }
  stop() {
    this._sound?.pause();
    this._sound.currentTime = 0;
  }
}

// src/lib/Sprite.ts
class Drawable {
  position;
  constructor(position) {
    this.position = position;
  }
  update(dt) {
  }
  static aabb(rect1, rect2) {
    return rect1.x < rect2.x + rect2.w && rect1.x + rect1.w > rect2.x && rect1.y < rect2.y + rect2.h && rect1.h + rect1.y > rect2.y;
  }
  static debug = (ctx, hb) => {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(hb.x, hb.y, hb.w, hb.h);
    ctx.stroke();
  };
}

class Movable extends Drawable {
  velocity;
  constructor(position, velocity) {
    super(position);
    this.velocity = velocity;
  }
}

// src/lib/BitmapText.ts
var glyph_scale = 2;
var defaultOptions = {
  scale: glyph_scale,
  shadow: true,
  shadowColor: "black"
};

class BitmapText {
  _glyphs = {};
  _buffer;
  _bufferCtx;
  constructor(image) {
    this._buffer = document.createElement("canvas");
    this._buffer.width = 642;
    this._buffer.height = glyph_scale * 8 + 2 * glyph_scale;
    this._bufferCtx = this._buffer.getContext("2d");
    this._bufferCtx.imageSmoothingEnabled = false;
    this._glyphs[" "] = new ImageSlice(image, 0, 0, 8, 8);
    this._glyphs["!"] = new ImageSlice(image, 8, 0, 8, 8);
    this._glyphs['"'] = new ImageSlice(image, 16, 0, 8, 8);
    this._glyphs["#"] = new ImageSlice(image, 24, 0, 8, 8);
    this._glyphs["$"] = new ImageSlice(image, 32, 0, 8, 8);
    this._glyphs["%"] = new ImageSlice(image, 40, 0, 8, 8);
    this._glyphs["&"] = new ImageSlice(image, 48, 0, 8, 8);
    this._glyphs["'"] = new ImageSlice(image, 56, 0, 8, 8);
    this._glyphs["("] = new ImageSlice(image, 64, 0, 8, 8);
    this._glyphs[")"] = new ImageSlice(image, 72, 0, 8, 8);
    this._glyphs["*"] = new ImageSlice(image, 80, 0, 8, 8);
    this._glyphs["+"] = new ImageSlice(image, 88, 0, 8, 8);
    this._glyphs[","] = new ImageSlice(image, 96, 0, 8, 8);
    this._glyphs["-"] = new ImageSlice(image, 104, 0, 8, 8);
    this._glyphs["."] = new ImageSlice(image, 112, 0, 8, 8);
    this._glyphs["/"] = new ImageSlice(image, 120, 0, 8, 8);
    this._glyphs["0"] = new ImageSlice(image, 128, 0, 8, 8);
    this._glyphs["1"] = new ImageSlice(image, 136, 0, 8, 8);
    this._glyphs["2"] = new ImageSlice(image, 144, 0, 8, 8);
    this._glyphs["3"] = new ImageSlice(image, 152, 0, 8, 8);
    this._glyphs["4"] = new ImageSlice(image, 160, 0, 8, 8);
    this._glyphs["5"] = new ImageSlice(image, 168, 0, 8, 8);
    this._glyphs["6"] = new ImageSlice(image, 176, 0, 8, 8);
    this._glyphs["7"] = new ImageSlice(image, 184, 0, 8, 8);
    this._glyphs["8"] = new ImageSlice(image, 192, 0, 8, 8);
    this._glyphs["9"] = new ImageSlice(image, 200, 0, 8, 8);
    this._glyphs[":"] = new ImageSlice(image, 208, 0, 8, 8);
    this._glyphs[";"] = new ImageSlice(image, 216, 0, 8, 8);
    this._glyphs["<"] = new ImageSlice(image, 224, 0, 8, 8);
    this._glyphs["="] = new ImageSlice(image, 232, 0, 8, 8);
    this._glyphs[">"] = new ImageSlice(image, 240, 0, 8, 8);
    this._glyphs["?"] = new ImageSlice(image, 248, 0, 8, 8);
    this._glyphs["@"] = new ImageSlice(image, 0, 8, 8, 8);
    this._glyphs["A"] = new ImageSlice(image, 8, 8, 8, 8);
    this._glyphs["B"] = new ImageSlice(image, 16, 8, 8, 8);
    this._glyphs["C"] = new ImageSlice(image, 24, 8, 8, 8);
    this._glyphs["D"] = new ImageSlice(image, 32, 8, 8, 8);
    this._glyphs["E"] = new ImageSlice(image, 40, 8, 8, 8);
    this._glyphs["F"] = new ImageSlice(image, 48, 8, 8, 8);
    this._glyphs["G"] = new ImageSlice(image, 56, 8, 8, 8);
    this._glyphs["H"] = new ImageSlice(image, 64, 8, 8, 8);
    this._glyphs["I"] = new ImageSlice(image, 72, 8, 8, 8);
    this._glyphs["J"] = new ImageSlice(image, 80, 8, 8, 8);
    this._glyphs["K"] = new ImageSlice(image, 88, 8, 8, 8);
    this._glyphs["L"] = new ImageSlice(image, 96, 8, 8, 8);
    this._glyphs["M"] = new ImageSlice(image, 104, 8, 8, 8);
    this._glyphs["N"] = new ImageSlice(image, 112, 8, 8, 8);
    this._glyphs["O"] = new ImageSlice(image, 120, 8, 8, 8);
    this._glyphs["P"] = new ImageSlice(image, 128, 8, 8, 8);
    this._glyphs["Q"] = new ImageSlice(image, 136, 8, 8, 8);
    this._glyphs["R"] = new ImageSlice(image, 144, 8, 8, 8);
    this._glyphs["S"] = new ImageSlice(image, 152, 8, 8, 8);
    this._glyphs["T"] = new ImageSlice(image, 160, 8, 8, 8);
    this._glyphs["U"] = new ImageSlice(image, 168, 8, 8, 8);
    this._glyphs["V"] = new ImageSlice(image, 176, 8, 8, 8);
    this._glyphs["W"] = new ImageSlice(image, 184, 8, 8, 8);
    this._glyphs["X"] = new ImageSlice(image, 192, 8, 8, 8);
    this._glyphs["Y"] = new ImageSlice(image, 200, 8, 8, 8);
    this._glyphs["Z"] = new ImageSlice(image, 208, 8, 8, 8);
    this._glyphs["["] = new ImageSlice(image, 216, 8, 8, 8);
    this._glyphs["|"] = new ImageSlice(image, 224, 8, 8, 8);
    this._glyphs["]"] = new ImageSlice(image, 232, 8, 8, 8);
    this._glyphs["{"] = new ImageSlice(image, 240, 8, 8, 8);
    this._glyphs["}"] = new ImageSlice(image, 248, 8, 8, 8);
    this._glyphs["a"] = new ImageSlice(image, 0, 16, 8, 8);
    this._glyphs["b"] = new ImageSlice(image, 8, 16, 8, 8);
    this._glyphs["c"] = new ImageSlice(image, 16, 16, 8, 8);
    this._glyphs["d"] = new ImageSlice(image, 24, 16, 8, 8);
    this._glyphs["e"] = new ImageSlice(image, 32, 16, 8, 8);
    this._glyphs["f"] = new ImageSlice(image, 40, 16, 8, 8);
    this._glyphs["g"] = new ImageSlice(image, 48, 16, 8, 8);
    this._glyphs["h"] = new ImageSlice(image, 56, 16, 8, 8);
    this._glyphs["i"] = new ImageSlice(image, 64, 16, 8, 8);
    this._glyphs["j"] = new ImageSlice(image, 72, 16, 8, 8);
    this._glyphs["k"] = new ImageSlice(image, 80, 16, 8, 8);
    this._glyphs["l"] = new ImageSlice(image, 88, 16, 8, 8);
    this._glyphs["m"] = new ImageSlice(image, 96, 16, 8, 8);
    this._glyphs["n"] = new ImageSlice(image, 104, 16, 8, 8);
    this._glyphs["o"] = new ImageSlice(image, 112, 16, 8, 8);
    this._glyphs["p"] = new ImageSlice(image, 120, 16, 8, 8);
    this._glyphs["q"] = new ImageSlice(image, 128, 16, 8, 8);
    this._glyphs["r"] = new ImageSlice(image, 136, 16, 8, 8);
    this._glyphs["s"] = new ImageSlice(image, 144, 16, 8, 8);
    this._glyphs["t"] = new ImageSlice(image, 152, 16, 8, 8);
    this._glyphs["u"] = new ImageSlice(image, 160, 16, 8, 8);
    this._glyphs["v"] = new ImageSlice(image, 168, 16, 8, 8);
    this._glyphs["w"] = new ImageSlice(image, 176, 16, 8, 8);
    this._glyphs["x"] = new ImageSlice(image, 184, 16, 8, 8);
    this._glyphs["y"] = new ImageSlice(image, 192, 16, 8, 8);
    this._glyphs["z"] = new ImageSlice(image, 200, 16, 8, 8);
  }
  draw(ctx, x, y, color, text, options = {}) {
    const opts = Object.assign({}, defaultOptions, options);
    this._bufferCtx.save();
    this._bufferCtx.clearRect(0, 0, this._buffer.width, this._buffer.height);
    let xx = 0;
    let yy = 0;
    for (let c = 0;c < text.length; ++c) {
      this._glyphs[text[c]].draw(this._bufferCtx, xx, yy, { scale: opts.scale });
      xx += 8 * opts.scale;
    }
    this._bufferCtx.fillStyle = color;
    this._bufferCtx.globalCompositeOperation = "source-in";
    this._bufferCtx.fillRect(0, 0, text.length * 8 * opts.scale, 8 * opts.scale);
    this._bufferCtx.restore();
    if (opts.shadow) {
      ctx.save();
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.shadowColor = opts.shadowColor;
      ctx.shadowBlur = 0;
      ctx.drawImage(this._buffer, x, y);
      ctx.restore();
    } else {
      ctx.drawImage(this._buffer, x, y);
    }
  }
}

// src/lib/Engine.ts
class Loader {
  files;
  loadCount;
  fileCount;
  constructor() {
    this.fileCount = 0;
    this.loadCount = 0;
    this.files = new Map;
  }
  get(name) {
    return this.files.get(name);
  }
  progress() {
    return this.fileCount == 0 ? 1 : this.loadCount / this.fileCount;
  }
  load(name, src) {
    src = src || name;
    this.fileCount++;
    switch (src.split(".").pop()) {
      case "png":
        const img = new Image;
        this.files.set(name, img);
        img.addEventListener("load", (e) => {
          this.loadCount++;
        });
        img.src = src;
        break;
      case "ogg":
        const aud = new Music(src);
        this.files.set(name, aud);
        aud.addEventListener("loadeddata", (e) => {
          this.loadCount++;
        });
        break;
      case "wav":
        const sound = new Sound(src);
        this.files.set(name, sound);
        sound.load().then(() => this.loadCount++);
        break;
      default:
        throw "Unsupported media format!";
    }
  }
}

class Renderer {
  _canvas;
  _bcanvas;
  _ctx;
  _bctx;
  _scale = 1;
  _scaleWidth = 0;
  _scaleHeight = 0;
  _background = "#000000";
  constructor() {
    this._canvas = document.getElementById("canvas");
    this._ctx = this._canvas.getContext("2d");
    this._bcanvas = document.createElement("canvas");
    this._bctx = this._bcanvas.getContext("2d");
  }
  get width() {
    return this._bcanvas.width;
  }
  get height() {
    return this._bcanvas.height;
  }
  get scale() {
    return this._scale;
  }
  get ctx() {
    return this._bctx;
  }
  get backbuffer() {
    return this._bcanvas;
  }
  get display() {
    return this._canvas;
  }
  flip() {
    this._ctx.drawImage(this._bcanvas, 0, 0, this._bcanvas.width, this._bcanvas.height, 0, 0, this._scaleWidth, this._scaleHeight);
  }
  clear() {
    if (this.backbuffer instanceof Image) {
      this._bctx.drawImage(this._background, 0, 0, this._background.width, this._background.height, 0, 0, this._scaleWidth, this._scaleHeight);
    } else {
      this._bctx.fillStyle = this._background;
      this._bctx.fillRect(0, 0, this._bcanvas.width, this._bcanvas.height);
    }
  }
  resize(newWidth, newHeight, scale) {
    const aspect = this._canvas.width / this._canvas.height;
    const w = newHeight * aspect;
    const h = newHeight;
    this._scale = scale;
    this._scaleWidth = w;
    this._scaleHeight = h;
    this._canvas.width = this._scaleWidth;
    this._canvas.height = this._scaleHeight;
  }
  options(width, height, scale) {
    this._scale = scale;
    this._scaleWidth = this._scale * width;
    this._scaleHeight = this._scale * height;
    this._canvas.width = this._scaleWidth;
    this._canvas.height = this._scaleHeight;
    this._bcanvas.width = width;
    this._bcanvas.height = height;
    this._bctx.imageSmoothingEnabled = false;
    this._ctx.imageSmoothingEnabled = false;
  }
  background(value) {
    this._background = value;
  }
}
var defaultOptions2 = {
  allowPause: true
};

class Engine2 {
  _loader;
  _renderer;
  _reqframe = -1;
  _activated = false;
  _paused = false;
  _now = 0;
  _then = 0;
  _delta = 0;
  _gameLoaded = false;
  _options;
  _isFullScreen = false;
  _wasFullScreen = false;
  constructor(options = {}, renderer = new Renderer, loader = new Loader) {
    const opts = Object.assign({}, defaultOptions2, options);
    this._loader = loader;
    this._renderer = renderer;
    this._options = opts;
    window.setInterval(() => {
      this._isFullScreen = document.getElementById("detector").getBoundingClientRect().top > 0;
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
    }, 1000);
  }
  enterFullscreen() {
  }
  leaveFullscreen() {
  }
  pause() {
  }
  resume() {
  }
  updateDelta(timestamp) {
    this._now = timestamp;
    this._delta = (this._now - this._then) / 1000;
    if (this._delta > 1) {
      this._delta = 1;
    }
    this._then = this._now;
  }
  resetDelta() {
    this._now = window.performance.now();
    this._then = this._now;
  }
  loop = (timestamp) => {
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
  };
  run() {
    if (this._activated)
      return;
    this._renderer.display.addEventListener("click", (e) => {
      e.preventDefault();
      this._activated = true;
      this.init();
      this.loop(0);
    }, { once: true });
    this._renderer.clear();
    this._renderer.ctx.fillStyle = "blue";
    this._renderer.ctx.font = "bold 16px Arial";
    this._renderer.ctx.textAlign = "center";
    this._renderer.ctx.textBaseline = "middle";
    this._renderer.ctx.fillText("Click to start the game!", this._renderer.width / 2, this._renderer.height / 2);
    this._renderer.flip();
  }
  stop() {
    if (!this._options.allowPause)
      return;
    this._activated = false;
    this._paused = true;
    window.cancelAnimationFrame(this._reqframe);
    this.pause();
  }
  restart() {
    if (!this._options.allowPause)
      return;
    if (!this._paused)
      return;
    this._paused = false;
    this._activated = true;
    this.resume();
    this.loop(0);
  }
  setWindowTitle(title) {
    document.title = title;
  }
}

class Input {
  _keys = {};
  _lastk = InputKey.NO_KEY;
  constructor() {
    window.addEventListener("keydown", (e) => {
      this._keys["k" + e.code] = true;
      this._lastk = e.code;
    });
    window.addEventListener("keyup", (e) => {
      this._keys["k" + e.code] = false;
      this._lastk = InputKey.NO_KEY;
    });
  }
  isDown = (keyCode) => {
    this._lastk = keyCode;
    return this._keys["k" + keyCode] == true;
  };
  isUp = (keyCode) => {
    this._lastk = InputKey.NO_KEY;
    return this._keys["k" + keyCode] == false;
  };
  isPressed = (keyCode) => {
    var pressed = this._keys["k" + keyCode] == true;
    this._keys["k" + keyCode] = false;
    return pressed;
  };
  clear = () => {
    this._keys = {};
    this._lastk = InputKey.NO_KEY;
  };
  rawKey = () => {
    if (this._lastk == InputKey.NO_KEY)
      return InputKey.NO_KEY;
    var pressed = this._keys["k" + this._lastk] == true;
    this._keys["k" + this._lastk] = false;
    if (pressed)
      return this._lastk;
    return InputKey.NO_KEY;
  };
}
var InputKey = {
  NO_KEY: "",
  KEY_LEFT: "ArrowLeft",
  KEY_DOWN: "ArrowDown",
  KEY_RIGHT: "ArrowRight",
  KEY_UP: "ArrowUp",
  KEY_RETURN: "Enter",
  KEY_ESCAPE: "Escape",
  KEY_BS: "Backspace",
  KEY_SPACE: "Space",
  KEY_PGDOWN: "PageDown",
  KEY_PGUP: "PageUp",
  KEY_FIRE: "KeyZ",
  KEY_A: "KeyA",
  KEY_B: "KeyB",
  KEY_C: "KeyC",
  KEY_D: "KeyD",
  KEY_E: "KeyE",
  KEY_F: "KeyF",
  KEY_G: "KeyG",
  KEY_H: "KeyH",
  KEY_I: "KeyI",
  KEY_J: "KeyJ",
  KEY_K: "KeyK",
  KEY_L: "KeyL",
  KEY_M: "KeyM",
  KEY_N: "KeyN",
  KEY_O: "KeyO",
  KEY_P: "KeyP",
  KEY_Q: "KeyQ",
  KEY_R: "KeyR",
  KEY_S: "KeyS",
  KEY_T: "KeyT",
  KEY_U: "KeyU",
  KEY_V: "KeyV",
  KEY_W: "KeyW",
  KEY_X: "KeyX",
  KEY_Y: "KeyY",
  KEY_Z: "KeyZ",
  KEY_F11: "keyF11"
};

class Rect {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
  x;
  y;
  w;
  h;
}
var defaultImageSliceDrawOptions = {
  scale: 1,
  vflip: false,
  hflip: false,
  alpha: 1
};

class ImageSlice {
  _x;
  _y;
  _w;
  _h;
  _img;
  constructor(img, x, y, w, h) {
    this._x = x;
    this._y = y;
    this._w = w;
    this._h = h;
    this._img = img;
  }
  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }
  get width() {
    return this._w;
  }
  get height() {
    return this._h;
  }
  draw(ctx, x, y, options = {}) {
    const opts = Object.assign({}, defaultImageSliceDrawOptions, options);
    const scale = opts.scale;
    ctx.save();
    let xx = x;
    let yy = y;
    if (options.hflip || options.vflip) {
      ctx.translate(options.hflip ? x + 2 * this._w : 0, opts.vflip ? y + 2 * this._h : 0);
      ctx.scale(-1, 1);
      if (opts.hflip)
        xx = 0;
      if (opts.vflip)
        yy = 0;
    }
    ctx.globalAlpha = opts.alpha;
    ctx.drawImage(this._img, this._x, this._y, this._w, this._h, xx, yy, this._w * scale, this._h * scale);
    ctx.restore();
  }
}

class Vector2 {
  x = 0;
  y = 0;
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}
var STANDARD_GRAVITY = 9.80665;

class Util {
  static formatNumber(num, places, fill = " ") {
    return (fill.repeat(places) + num).slice(-places);
  }
}

class ImageCache {
  _backbuffer;
  _backgroundCache;
  _cached;
  constructor(canvas) {
    this._backbuffer = canvas;
    this._backgroundCache = canvas.cloneNode(true);
    this._cached = false;
  }
  draw(ctx, render) {
    if (this._cached) {
      ctx.drawImage(this._backgroundCache, 0, 0);
    } else {
      render(ctx);
      this._backgroundCache.getContext("2d", { alpha: false }).drawImage(this._backbuffer, 0, 0);
      this._cached = true;
    }
  }
  clear() {
    this._cached = false;
  }
}

// src/Actor.ts
class Actor extends Movable {
  flipped;
  constructor(flipped, position, velocity = new Vector2(0, 0)) {
    super(position, velocity);
    this.flipped = flipped;
  }
}

// src/Mobs.ts
class Mob extends Actor {
  _frames;
  _hp;
  _speed;
  _points;
  _animTimer = 0;
  _animFrame = 0;
  _active;
  constructor(position, frames, flipped, hp, speed, points) {
    super(flipped, position, new Vector2(0, 0));
    this._frames = frames;
    this._hp = hp;
    this._speed = speed;
    this._points = points;
    this._active = true;
    this.velocity.x = this.flipped ? -this._speed : this._speed;
  }
  get points() {
    return this._points;
  }
  get active() {
    return this._active;
  }
  set active(value) {
    this._active = value;
  }
  update(dt) {
    if (this.flipped) {
      if (this.velocity.x > 0) {
        this.velocity.x -= 1;
        if (this.velocity.x < 1) {
          this.velocity.x = -this._speed;
        }
      }
    } else {
      if (this.velocity.x < 0) {
        this.velocity.x += 1;
        if (this.velocity.x >= 0) {
          this.velocity.x = this._speed;
        }
      }
    }
    this.position.x += dt * this.velocity.x;
    this._animTimer += dt;
    if (this._animTimer > 0.25) {
      this._animTimer = 0;
      this._animFrame = 1 - this._animFrame;
    }
    if (this.position.x < -32 || this.position.x >= 640) {
      this._active = false;
    }
  }
  draw(ctx) {
    this._frames[this._animFrame].draw(ctx, this.position.x, this.position.y, { scale: 2, hflip: this.flipped });
  }
  hit(opponent) {
    if (Actor.aabb(this.hitbox, opponent.hitbox)) {
    }
    return false;
  }
  gotHit(hero) {
    if (this._hp-- <= 0)
      return true;
    this.velocity.x = hero.flipped ? -this._speed * 1.2 : this._speed * 1.2;
    return false;
  }
}

class MobBee extends Mob {
  constructor(game, flipped, position, speed = 40) {
    super(position, [
      new ImageSlice(game.getAsset("bee1a"), 0, 0, 16, 16),
      new ImageSlice(game.getAsset("bee2a"), 0, 0, 16, 16)
    ], flipped, 2, speed, 20);
  }
  get hitbox() {
    return new Rect(this.position.x + 4, this.position.y + 4, 24, 24);
  }
}

class MobBlue extends Mob {
  constructor(game, flipped, position, speed = 60) {
    super(position, [
      new ImageSlice(game.getAsset("blue1a"), 0, 0, 16, 16),
      new ImageSlice(game.getAsset("blue2a"), 0, 0, 16, 16)
    ], flipped, 3, speed, 50);
  }
  get hitbox() {
    return new Rect(this.position.x + 4, this.position.y + 4, 24, 24);
  }
}

class MobFoxy extends Mob {
  constructor(game, flipped, position, speed = 50) {
    super(position, [
      new ImageSlice(game.getAsset("foxy1a"), 0, 0, 16, 16),
      new ImageSlice(game.getAsset("foxy2a"), 0, 0, 16, 16)
    ], flipped, 2, speed, 100);
  }
  get hitbox() {
    return new Rect(this.position.x, this.position.y + 12, 26, 20);
  }
}

class MobSniky extends Mob {
  constructor(game, flipped, position, speed = 10) {
    super(position, [
      new ImageSlice(game.getAsset("sniky1a"), 0, 0, 16, 16),
      new ImageSlice(game.getAsset("sniky2a"), 0, 0, 16, 16)
    ], flipped, 5, speed, 200);
  }
  get hitbox() {
    return new Rect(this.position.x, this.position.y + 17, 32, 15);
  }
}

// src/Scene.ts
class BaseScene {
  _game;
  constructor(game) {
    this._game = game;
  }
  enter() {
  }
  exit() {
  }
}

// src/Powerups.ts
class Powerup extends Actor {
  _image;
  _points;
  _active;
  _alpha = 100;
  _waitTimer = 0;
  constructor(image, points, position = new Vector2(0, 0), velocity = new Vector2(0, 0)) {
    super(false, position, velocity);
    this._image = image;
    this._points = points;
    this._active = false;
  }
  get points() {
    return this._points;
  }
  set active(value) {
    this._active = value;
  }
  get active() {
    return this._active;
  }
  update(dt) {
    if (this.position.y < 280) {
      this.velocity.y += STANDARD_GRAVITY;
      this.position.y += dt * this.velocity.y;
    } else {
      this.position.y = 280;
      this._waitTimer += dt;
      if (this._waitTimer > 3) {
        if (this._alpha < 0.1) {
          this._alpha = 0;
          this._active = false;
        } else {
          this._alpha -= 0.1;
        }
      }
    }
  }
  get hitbox() {
    return new Rect(this.position.x, this.position.y, 32, 32);
  }
  draw(ctx) {
    this._image.draw(ctx, this.position.x, this.position.y, { scale: 2, alpha: this._alpha });
  }
  hit(opponent) {
    if (!this._active)
      return false;
    if (Actor.aabb(this.hitbox, opponent.hitbox)) {
      this._active = false;
      return true;
    }
    return false;
  }
  reset(x) {
    this.position = new Vector2(x, 100);
    this.velocity.y = 50;
    this._waitTimer = 0;
    this._alpha = 1;
    this._active = true;
  }
}

class Medkit extends Powerup {
  constructor(game, position = new Vector2(0, 0)) {
    super(new ImageSlice(game.getAsset("medkit"), 0, 0, 16, 16), 500, position);
  }
}

class Bomb extends Powerup {
  constructor(game, position = new Vector2(0, 0)) {
    super(new ImageSlice(game.getAsset("bomb"), 0, 0, 16, 16), 500, position);
  }
}

// src/Bullet.ts
class Bullet extends Actor {
  active;
  _image;
  constructor(image, position, velocity) {
    super(false, position, velocity);
    this._image = image;
    this.active = true;
  }
}

// src/Hero.ts
class Hero extends Actor {
  _game;
  _frames;
  _bullets;
  _bulletTime = 0;
  _animTimer = 0;
  _animFrame = 0;
  _ground;
  _superSize = false;
  _superSizeTimer = 0;
  _fire_fx;
  constructor(game, position) {
    super(false, position, new Vector2(0, 0));
    this._game = game;
    this._frames = [
      new ImageSlice(this._game.getAsset("hero1a"), 0, 0, 16, 16),
      new ImageSlice(this._game.getAsset("hero2a"), 0, 0, 16, 16)
    ];
    this._bullets = new Array;
    this._ground = false;
    this._fire_fx = this._game.getAsset("fire-fx");
    this._fire_fx.volume = 0.2;
  }
  get hitbox() {
    return new Rect(this.position.x, this.position.y, 32, 32);
  }
  hit(opponent) {
    return Actor.aabb(this.hitbox, opponent.hitbox);
  }
  update(dt) {
    this._bullets = this._bullets.filter((b) => b.active);
    if (this.velocity.x != 0) {
      this._animTimer += dt;
      if (this._animTimer > 0.225) {
        this._animTimer = 0;
        this._animFrame = 1 - this._animFrame;
      }
      if (this.velocity.x > 0)
        this.velocity.x -= 3;
      else if (this.velocity.x < 0)
        this.velocity.x += 3;
      if (this.velocity.x > -1 && this.velocity.x < 1) {
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
    if (this.velocity.x > 0)
      this.flipped = false;
    if (this.velocity.x < 0)
      this.flipped = true;
    if (!this._ground) {
      this._animFrame = 1;
    } else if (this.velocity.x == 0) {
      this._animFrame = 0;
    }
    if (this._game.input.isDown(InputKey.KEY_FIRE)) {
      this._superSizeTimer += dt;
      if (this._superSizeTimer >= 3) {
        this._superSize = true;
      }
      if (this._bulletTime == 0) {
        if (this._bullets.length < 5) {
          this._fire_fx.play();
          const p = new Vector2(this.flipped ? this.position.x : this.position.x + 20, this._superSize ? this.position.y + 4 : this.position.y + 12);
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
    if (this._game.input.isDown(InputKey.KEY_LEFT) && this.velocity.x > -100)
      this.velocity.x -= 15;
    if (this._game.input.isDown(InputKey.KEY_RIGHT) && this.velocity.x < 100)
      this.velocity.x += 15;
    if (this.position.y > 280) {
      this.position.y = 280;
      this._ground = true;
      this.velocity.y = 0;
    }
    if (this._game.input.isDown(InputKey.KEY_UP)) {
      if (this._ground) {
        this.velocity.y = -200;
        this._ground = false;
      }
    }
    this._bullets.forEach((b) => b.update(dt));
  }
  bulletHit(mob) {
    const hb = mob.hitbox;
    for (let b of this._bullets.filter((m) => m.active)) {
      if (Actor.aabb(hb, b.hitbox)) {
        if (!b.isSupersized) {
          b.active = false;
        }
        return true;
      }
    }
    return false;
  }
  draw(ctx) {
    this._bullets.filter((b) => b.active).forEach((b) => b.draw(ctx));
    this._frames[this._animFrame].draw(ctx, this.position.x, this.position.y, { hflip: this.flipped, scale: 2 });
  }
}

class HeroBullet extends Bullet {
  _flipped;
  _superSize;
  constructor(game, flipped, position, velocity) {
    super(new ImageSlice(game.getAsset("bullet"), 0, 0, 16, 16), position, velocity);
    this._flipped = flipped;
    this._superSize = false;
  }
  supersize() {
    this._superSize = true;
  }
  get isSupersized() {
    return this._superSize;
  }
  update(dt) {
    this.position.x += this.velocity.x * dt;
    if (this.position.x < -16 || this.position.x > 640)
      this.active = false;
  }
  draw(ctx) {
    this._image.draw(ctx, this.position.x, this.position.y, { hflip: this._flipped, scale: this._superSize ? 2 : 1 });
  }
  get hitbox() {
    return this._superSize ? new Rect(this._flipped ? this.position.x + 4 : this.position.x, this.position.y + 12, 24, 12) : new Rect(this._flipped ? this.position.x + 16 : this.position.x, this.position.y + 6, 16, 6);
  }
  hit(opponent) {
    throw new Error("Method not implemented.");
  }
}

class HeroB extends Drawable {
  _frames;
  _animTimer;
  _animFrame;
  constructor(game, position) {
    super(position);
    this._frames = [
      new ImageSlice(game.getAsset("hero1b"), 0, 0, 64, 64),
      new ImageSlice(game.getAsset("hero2b"), 0, 0, 64, 64)
    ];
    this._animTimer = 0;
    this._animFrame = 0;
  }
  update(dt) {
    this._animTimer += dt;
    if (this._animTimer > 0.3) {
      this._animTimer = 0;
      this._animFrame = 1 - this._animFrame;
    }
  }
  draw(ctx) {
    this._frames[this._animFrame].draw(ctx, this.position.x, this.position.y);
  }
}

// src/TitleScene.ts
var FOREST_BASE_COLOR = "#0c1122";

class TitleScene extends BaseScene {
  _title;
  _forest;
  _text;
  _mobs;
  _bomb;
  _medkit;
  _hero;
  _backgroundCache;
  constructor(game) {
    super(game);
    this._title = new ImageSlice(this._game.getAsset("titleBitmap"), 0, 0, 640, 480);
    this._forest = new ImageSlice(this._game.getAsset("forest"), 0, 0, 640, 312);
    this._text = new BitmapText(this._game.getAsset("bitmapFont"));
    this._mobs = [
      new MobBee(this._game, false, new Vector2(80, 140), 0),
      new MobBlue(this._game, false, new Vector2(80, 180), 0),
      new MobSniky(this._game, false, new Vector2(80, 220), 0),
      new MobFoxy(this._game, false, new Vector2(80, 260), 0)
    ];
    this._bomb = new Bomb(this._game, new Vector2(80, 300));
    this._medkit = new Medkit(this._game, new Vector2(80, 340));
    this._hero = new HeroB(this._game, new Vector2(40, 40));
    this._backgroundCache = new ImageCache(this._game.renderer.backbuffer);
  }
  update(dt) {
    this._mobs.forEach((m) => m.update(dt));
    this._hero.update(dt);
    if (this._game.input.isPressed(InputKey.KEY_FIRE)) {
      this._game.changeScene(GameScene.GAME_SCENE_ACTION);
    }
  }
  draw(ctx) {
    this._backgroundCache.draw(ctx, () => {
      this._forest.draw(ctx, 0, 0);
      ctx.fillStyle = FOREST_BASE_COLOR;
      ctx.fillRect(0, 312, 640, 168);
      this._title.draw(ctx, 0, 0);
      this._text.draw(ctx, 120, 150, "white", `BEE .......... ${Util.formatNumber(this._mobs[0].points, 3)} POINTS`);
      this._text.draw(ctx, 120, 190, "white", `BLUE ......... ${Util.formatNumber(this._mobs[1].points, 3)} POINTS`);
      this._text.draw(ctx, 120, 230, "white", `SNIKY ........ ${Util.formatNumber(this._mobs[2].points, 3)} POINTS`);
      this._text.draw(ctx, 120, 270, "white", `FOXY ......... ${Util.formatNumber(this._mobs[3].points, 3)} POINTS`);
      this._text.draw(ctx, 120, 310, "white", `BOMB ......... ${Util.formatNumber(this._bomb.points, 3)} POINTS`);
      this._text.draw(ctx, 120, 350, "white", `MEDKIT ....... ${Util.formatNumber(this._medkit.points, 3)} POINTS`);
      this._text.draw(ctx, 140, 420, "white", "PRESS \"FIRE\" TO START");
      this._text.draw(ctx, 208, 462, "gray", "PRESS \"F11\" FOR FULLSCREEN", { scale: 1 });
      this._bomb.draw(ctx);
      this._medkit.draw(ctx);
    });
    this._hero.draw(ctx);
    this._mobs.forEach((m) => m.draw(ctx));
  }
}

// src/Healthbar.ts
var MAX_ENERGY = 100;
var MAX_HEIGHT = 96;

class Healthbar extends Drawable {
  _health;
  _image;
  constructor(game) {
    super(new Vector2(10, 30));
    this._image = game.getAsset("energybar");
    this._health = MAX_ENERGY;
  }
  get health() {
    return this._health;
  }
  reset() {
    this._health = MAX_ENERGY;
  }
  decrease(amount = 1) {
    this._health -= amount;
    if (this._health < 0)
      this._health = 0;
  }
  increase(amount = 1) {
    this._health += amount;
    if (this._health > MAX_ENERGY) {
      this._health = MAX_ENERGY;
    }
  }
  update(dt) {
  }
  draw(ctx) {
    const p = Math.round(this._health / MAX_ENERGY * MAX_HEIGHT);
    ctx.drawImage(this._image, 0, 0, 8, p, this.position.x, this.position.y, 8, p);
  }
}

// src/Explosion.ts
class Explosion extends Drawable {
  _frames;
  _animTimer;
  _animFrame;
  _active;
  constructor(game, position = new Vector2(0, 0)) {
    super(position);
    const image = game.getAsset("explosion");
    this._frames = [
      new ImageSlice(image, 0, 0, 16, 16),
      new ImageSlice(image, 16, 0, 16, 16),
      new ImageSlice(image, 32, 0, 16, 16),
      new ImageSlice(image, 48, 0, 16, 16),
      new ImageSlice(image, 64, 0, 16, 16),
      new ImageSlice(image, 80, 0, 16, 16),
      new ImageSlice(image, 96, 0, 16, 16),
      new ImageSlice(image, 112, 0, 16, 16),
      new ImageSlice(image, 128, 0, 16, 16),
      new ImageSlice(image, 144, 0, 16, 16),
      new ImageSlice(image, 160, 0, 16, 16),
      new ImageSlice(image, 176, 0, 16, 16)
    ];
    this._animTimer = 0;
    this._animFrame = 0;
    this._active = true;
  }
  get active() {
    return this._active;
  }
  update(dt) {
    if (!this._active)
      return;
    this._animTimer += dt;
    if (this._animTimer > 0.05) {
      this._animTimer -= 0.05;
      if (++this._animFrame == 12) {
        this._active = false;
      }
    }
  }
  draw(ctx) {
    this._frames[this._animFrame].draw(ctx, this.position.x, this.position.y, { scale: 2 });
  }
}

// src/Dirt.ts
class Dirt extends Drawable {
  _frame;
  _alpha;
  _active;
  _alphaTimer;
  constructor(game, position) {
    super(position);
    this._frame = new ImageSlice(game.getAsset("blood-ground"), 0, 0, 16, 16);
    this._alpha = 1;
    this._active = true;
    this._alphaTimer = 0;
  }
  get active() {
    return this._active;
  }
  update(dt) {
    this._alphaTimer += dt;
    if (this._alphaTimer > 0.2) {
      this._alphaTimer = 0;
      this._alpha -= 0.01;
      if (this._alpha < 0.01) {
        this._alpha = 0;
        this._active = false;
      }
    }
  }
  draw(ctx) {
    this._frame.draw(ctx, this.position.x, this.position.y, { scale: 2, alpha: this._alpha });
  }
}

// src/GetReady.ts
class GetReady {
  _getReadyTimer;
  _ready;
  _alpha;
  _frame;
  constructor(game) {
    this._getReadyTimer = 0;
    this._ready = false;
    this._alpha = 1;
    this._frame = new ImageSlice(game.getAsset("elements"), 0, 16, 160, 16);
  }
  get isReady() {
    return this._ready;
  }
  update(dt) {
    if (this._ready)
      return;
    this._getReadyTimer += dt;
    if (this._getReadyTimer > 2) {
      this._alpha -= 0.1;
      if (this._alpha < 0) {
        this._alpha = 0;
      }
    }
    if (this._getReadyTimer > 5) {
      this._ready = true;
    }
  }
  draw(ctx) {
    if (this._ready)
      return;
    this._frame.draw(ctx, 160, 150, { scale: 2, alpha: this._alpha });
  }
}
var Scores;
(function(Scores2) {
  Scores2[Scores2["ADD_KILLS"] = 0] = "ADD_KILLS";
  Scores2[Scores2["ADD_MISSES"] = 1] = "ADD_MISSES";
  Scores2[Scores2["ADD_MEDIKITS"] = 2] = "ADD_MEDIKITS";
  Scores2[Scores2["ADD_BOMBS"] = 3] = "ADD_BOMBS";
  Scores2[Scores2["PRESS_FIRE"] = 4] = "PRESS_FIRE";
})(Scores || (Scores = {}));
var Bonus;
(function(Bonus2) {
  Bonus2[Bonus2["Kills"] = 2] = "Kills";
  Bonus2[Bonus2["Missed"] = 0] = "Missed";
  Bonus2[Bonus2["Bombs"] = 50] = "Bombs";
  Bonus2[Bonus2["Medkits"] = 100] = "Medkits";
})(Bonus || (Bonus = {}));

class GameOver {
  _game;
  _gameOverTime;
  _countTime;
  _frame;
  _killed;
  _missed;
  _medkitCollected;
  _bombCollected;
  _score;
  _currentScoreCount;
  _pressFiretime;
  _tick_fx;
  _text;
  constructor(game) {
    this._game = game;
    this._frame = new ImageSlice(game.getAsset("elements"), 0, 0, 160, 16);
    this._text = new BitmapText(this._game.getAsset("bitmapFont"));
    this._gameOverTime = 0;
    this._countTime = 0;
    this._killed = 0;
    this._missed = 0;
    this._medkitCollected = 0;
    this._bombCollected = 0;
    this._score = 0;
    this._currentScoreCount = Scores.ADD_KILLS;
    this._pressFiretime = Number.MAX_VALUE;
    this._tick_fx = game.getAsset("tick-fx");
    this._tick_fx.volume = 0.1;
  }
  get score() {
    return this._score;
  }
  set(mobKilled, mobMissed, medkitCollected, bombCollected, score) {
    this._killed = mobKilled;
    this._missed = mobMissed;
    this._medkitCollected = medkitCollected;
    this._bombCollected = bombCollected;
    this._score = score;
  }
  update(dt) {
    this._gameOverTime += dt;
    if (this._gameOverTime > 3) {
      this._countTime += dt;
      if (this._countTime > 0.05) {
        this._countTime -= 0.05;
        switch (this._currentScoreCount) {
          case Scores.ADD_KILLS:
            if (this._killed > 10) {
              this._tick_fx.play();
              this._score += Bonus.Kills * 10;
              this._killed -= 10;
            } else if (this._killed > 0) {
              this._tick_fx.play();
              this._score += Bonus.Kills;
              this._killed--;
            }
            if (this._killed == 0)
              this._currentScoreCount = Scores.ADD_MISSES;
            break;
          case Scores.ADD_MISSES:
            if (this._missed > 10) {
              this._tick_fx.play();
              this._score += Bonus.Missed * 10;
              this._missed -= 10;
            } else if (this._missed > 0) {
              this._tick_fx.play();
              this._score += Bonus.Missed;
              this._missed--;
            }
            if (this._missed == 0)
              this._currentScoreCount = Scores.ADD_BOMBS;
            break;
          case Scores.ADD_BOMBS:
            if (this._bombCollected > 10) {
              this._tick_fx.play();
              this._score += Bonus.Bombs * 10;
              this._bombCollected -= 10;
            } else if (this._bombCollected > 0) {
              this._tick_fx.play();
              this._score += Bonus.Bombs;
              this._bombCollected--;
            }
            if (this._bombCollected == 0)
              this._currentScoreCount = Scores.ADD_MEDIKITS;
            break;
          case Scores.ADD_MEDIKITS:
            if (this._medkitCollected > 10) {
              this._tick_fx.play();
              this._score += Bonus.Medkits * 10;
              this._medkitCollected -= 10;
            }
            if (this._medkitCollected > 0) {
              this._tick_fx.play();
              this._score += Bonus.Medkits;
              this._medkitCollected--;
            }
            if (this._medkitCollected == 0) {
              this._currentScoreCount = Scores.PRESS_FIRE;
              this._pressFiretime = this._gameOverTime + 1;
            }
            break;
        }
      }
      if (this._currentScoreCount == Scores.PRESS_FIRE) {
        if (this._gameOverTime > this._pressFiretime) {
          if (this._game.input.isPressed(InputKey.KEY_FIRE)) {
            this._game.changeScene(GameScene.GAME_SCENE_TITLE);
            return;
          }
        }
      }
    }
  }
  draw(ctx) {
    this._frame.draw(ctx, 160, 50, { scale: 2 });
    this._text.draw(ctx, 170, 100, "white", `Killed: ${Util.formatNumber(this._killed, 5, "0")}`);
    this._text.draw(ctx, 400, 104, "white", `x ${Bonus.Kills}`, { scale: 1 });
    this._text.draw(ctx, 170, 120, "white", `Missed: ${Util.formatNumber(this._missed, 5, "0")}`);
    this._text.draw(ctx, 400, 124, "white", `x ${Bonus.Missed}`, { scale: 1 });
    this._text.draw(ctx, 170, 140, "white", `Bombs : ${Util.formatNumber(this._bombCollected, 4, "0")}`);
    this._text.draw(ctx, 400, 144, "white", `x ${Bonus.Medkits}`, { scale: 1 });
    this._text.draw(ctx, 170, 160, "white", `Medkit: ${Util.formatNumber(this._medkitCollected, 4, "0")}`);
    this._text.draw(ctx, 400, 164, "white", `x ${Bonus.Bombs}`, { scale: 1 });
    this._text.draw(ctx, 140, 200, "white", `FINAL SCORE: ${Util.formatNumber(this._score, 8, "0")}`);
    if (this._gameOverTime > this._pressFiretime) {
      this._text.draw(ctx, 200, 250, "white", "Press \"FIRE\"!");
    }
  }
}

// src/ActionScene.ts
class ActionScene extends BaseScene {
  _score;
  _hiScore;
  _hero;
  _healthBar;
  _forest;
  _text;
  _ground;
  _backgroundCache;
  _mobs;
  _explosions;
  _dirts;
  _isGameOver;
  _ready;
  _medkit;
  _bomb;
  _medkitSpawnTimer;
  _pickup_fx;
  _medkitCollected;
  _bombSpawnTimer;
  _bombExploded;
  _bombExplodeTimer;
  _explosionLong_fx;
  _bombCollected;
  _mobKilled;
  _explosion_fx;
  _mobSpawnTimer;
  _nextMob;
  _mobMissed;
  _hit_fx;
  _gameOver;
  constructor(game) {
    super(game);
    this._hero = new Hero(this._game, new Vector2(300, 200));
    this._healthBar = new Healthbar(this._game);
    this._forest = new ImageSlice(this._game.getAsset("forest"), 0, 0, 640, 312);
    this._text = new BitmapText(this._game.getAsset("bitmapFont"));
    this._ground = new ImageSlice(this._game.getAsset("ground"), 0, 0, 16, 16);
    this._ready = new GetReady(this._game);
    this._gameOver = new GameOver(this._game);
    this._medkit = new Medkit(this._game);
    this._bomb = new Bomb(this._game);
    this._pickup_fx = this._game.getAsset("pickup-fx");
    this._explosionLong_fx = this._game.getAsset("explosion_long-fx");
    this._explosion_fx = this._game.getAsset("explosion-fx");
    this._hit_fx = this._game.getAsset("hit-fx");
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
  update(dt) {
    if (this._game.input.isPressed(InputKey.KEY_ESCAPE)) {
      this._game.changeScene(GameScene.GAME_SCENE_TITLE);
      return;
    }
    this._mobs = this._mobs.filter((m) => m.active);
    this._dirts = this._dirts.filter((m) => m.active);
    this._explosions = this._explosions.filter((m) => m.active);
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
    this._explosions.filter((m) => m.active).forEach((m) => m.update(dt));
    this._dirts.filter((m) => m.active).forEach((m) => m.update(dt));
    if (this._score > this._hiScore) {
      this._hiScore = this._score;
    }
  }
  bombSpawn(dt) {
    this._bombSpawnTimer += dt;
    if (this._bombSpawnTimer > 30) {
      this._bombSpawnTimer -= 30;
      this._bomb.reset(32 + Math.random() * this._game.renderer.width - 32);
    }
  }
  updateBomb(dt) {
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
          this._mobs.filter((m) => m.active).forEach((m) => {
            this.mobKilled(m);
          });
        }
      }
    }
  }
  medkitSpawn(dt) {
    this._medkitSpawnTimer += dt;
    if (this._medkitSpawnTimer > 20) {
      this._medkitSpawnTimer -= 20;
      this._medkit.reset(32 + Math.random() * this._game.renderer.width - 32);
    }
  }
  updateMedkit(dt) {
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
  mobSpawn(dt) {
    if (this._mobs.length == 50)
      return;
    this._mobSpawnTimer += dt;
    if (this._mobSpawnTimer > this._nextMob) {
      this._mobSpawnTimer = 0;
      this._nextMob = Math.random() * 0.8;
      const flipped = Math.random() > 0.5;
      const mobid = Math.random() * 100;
      let newMob;
      if (mobid < 10) {
        const position = new Vector2(flipped ? 640 : -32, 280);
        newMob = new MobSniky(this._game, flipped, position);
      } else if (mobid < 40 && mobid >= 10) {
        const position = new Vector2(flipped ? 640 : -32, 248 + Math.random() * 32);
        newMob = new MobBlue(this._game, flipped, position);
      } else if (mobid < 70 && mobid >= 40) {
        const position = new Vector2(flipped ? 640 : -32, 248 + Math.random() * 32);
        newMob = new MobBee(this._game, flipped, position);
      } else {
        const position = new Vector2(flipped ? 640 : -32, 280);
        newMob = new MobFoxy(this._game, flipped, position);
      }
      this._mobs.push(newMob);
    }
  }
  mobKilled(mob) {
    ++this._mobKilled;
    this._explosion_fx.play();
    const explosion = new Explosion(this._game, mob.position);
    this._explosions.push(explosion);
    const dirt = new Dirt(this._game, new Vector2(mob.position.x, 312));
    this._dirts.push(dirt);
    this._score += mob.points;
    mob.active = false;
  }
  updateMobs(dt) {
    this._mobs.forEach((m) => {
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
  heroDied() {
    this._isGameOver = true;
    this._gameOver.set(this._mobKilled, this._mobMissed, this._medkitCollected, this._bombCollected, this._score);
  }
  draw(ctx) {
    this._backgroundCache.draw(ctx, () => {
      this._forest.draw(ctx, 0, 0);
      for (let i = 0;i < this._game.renderer.width / 32; ++i) {
        this._ground.draw(ctx, i * 32, 312, { scale: 2 });
      }
    });
    this._healthBar.draw(ctx);
    this._text.draw(ctx, 2, 2, "white", `SCORE:${Util.formatNumber(this._score, 8, "0")}`);
    this._text.draw(ctx, 368, 2, "white", `HI-SCORE:${Util.formatNumber(this._hiScore, 8, "0")}`);
    if (!this._ready.isReady) {
      this._ready.draw(ctx);
    }
    if (!this._isGameOver) {
      this._hero.draw(ctx);
    }
    this._mobs.filter((m) => m.active).forEach((m) => m.draw(ctx));
    this._dirts.filter((m) => m.active).forEach((m) => m.draw(ctx));
    this._explosions.filter((m) => m.active).forEach((m) => m.draw(ctx));
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

// src/Game.ts
var GameScene;
(function(GameScene2) {
  GameScene2[GameScene2["GAME_SCENE_TITLE"] = 0] = "GAME_SCENE_TITLE";
  GameScene2[GameScene2["GAME_SCENE_ACTION"] = 1] = "GAME_SCENE_ACTION";
})(GameScene || (GameScene = {}));
var displayZoom = 1.8;
var displaySize = { x: 640, y: 480 };

class Game4 extends Engine2 {
  _input;
  _music;
  _fps;
  _currentScene = 0;
  _activeScene;
  constructor() {
    super({ allowPause: false });
    this._input = new Input;
    this._renderer.options(displaySize.x, displaySize.y, displayZoom);
    this._fps = 0;
  }
  enterFullscreen() {
    console.log("Entering fullscreen");
    this._renderer.resize(window.innerWidth, window.innerHeight, displayZoom);
  }
  leaveFullscreen() {
    console.log("Leaving fullscreen");
    this._renderer.options(displaySize.x, displaySize.y, displayZoom);
  }
  get input() {
    return this._input;
  }
  get renderer() {
    return this._renderer;
  }
  init() {
    console.log("loading game assets ...");
    this._loader.load("forest", "assets/Bitmaps/background.png");
    this._loader.load("titleBitmap", "assets/Bitmaps/title.png");
    this._loader.load("elements", "assets/Bitmaps/elements.png");
    this._loader.load("bitmapFont", "assets/Fonts/font.png");
    this._loader.load("bee1a", "assets/Sprites/bee1a.png");
    this._loader.load("bee2a", "assets/Sprites/bee2a.png");
    this._loader.load("blue1a", "assets/Sprites/blue1a.png");
    this._loader.load("blue2a", "assets/Sprites/blue2a.png");
    this._loader.load("sniky1a", "assets/Sprites/sniky1.png");
    this._loader.load("sniky2a", "assets/Sprites/sniky2.png");
    this._loader.load("foxy1a", "assets/Sprites/roka1.png");
    this._loader.load("foxy2a", "assets/Sprites/roka2.png");
    this._loader.load("hero1a", "assets/Sprites/hero1.png");
    this._loader.load("hero2a", "assets/Sprites/hero2.png");
    this._loader.load("hero1b", "assets/Sprites/hero1b.png");
    this._loader.load("hero2b", "assets/Sprites/hero2b.png");
    this._loader.load("bomb", "assets/Sprites/bombball.png");
    this._loader.load("medkit", "assets/Sprites/medkit.png");
    this._loader.load("explosion", "assets/Sprites/explosion-4.png");
    this._loader.load("bullet", "assets/Sprites/bullet.png");
    this._loader.load("blood-ground", "assets/Sprites/blood_tile.png");
    this._loader.load("blood-particle", "assets/Sprites/blood.png");
    this._loader.load("world-1", "assets/Sounds/world_1.ogg");
    this._loader.load("energybar", "assets/Sprites/healthbar.png");
    this._loader.load("ground", "assets/Sprites/tile_0004.png");
    this._loader.load("explosion", "assets/Sprites/explosion-4.png");
    this._loader.load("explosion_long-fx", "assets/Sounds/explosion_long.wav");
    this._loader.load("explosion-fx", "assets/Sounds/explosion.wav");
    this._loader.load("fire-fx", "assets/Sounds/fire.wav");
    this._loader.load("hit-fx", "assets/Sounds/hit.wav");
    this._loader.load("pickup-fx", "assets/Sounds/pickup.wav");
    this._loader.load("tick-fx", "assets/Sounds/tick.wav");
  }
  getAsset(name) {
    return this._loader.get(name);
  }
  ready() {
    console.log("game ready ...");
    this._music = this.getAsset("world-1");
    this._music.play();
    this._music.loop = true;
    this._currentScene = GameScene.GAME_SCENE_TITLE;
    this._activeScene = new TitleScene(this);
    this._activeScene.enter();
  }
  changeScene(newScene) {
    if (this._currentScene == newScene)
      return;
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
  update(dt) {
    this._fps = 1 / dt;
    this.setWindowTitle(`fps: ${Math.round(this._fps)}`);
    this._activeScene?.update(dt);
  }
  draw(ctx) {
    this._activeScene?.draw(ctx);
  }
  pause() {
    console.log("paused ...");
  }
  resume() {
    console.log("resume ...");
  }
}

// src/main.ts
var main = function() {
  const g = new Game4;
  window.onblur = g.stop.bind(g);
  window.onfocus = g.restart.bind(g);
  g.run();
};
main();
