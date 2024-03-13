library engine;

import 'dart:html';
import 'dart:web_audio';

// NOTE: Putting the audio context here will cause the well known warning in main browsers ("The AudioContext was not allowed to start...") just ingore it!
final AudioContext audioContext = new AudioContext();

class Sound {
  String _src;
  AudioBuffer? _buffer;
  bool _loop = false;
  num _volume = 1.0;

  Sound(this._src);

  Future<void> load() {
    return new Future(()  {
      final request = new HttpRequest();
      request.open('GET', this._src, async: true);
      request.responseType = 'arraybuffer';
      request.onLoad.listen((event) {
        audioContext.decodeAudioData(request.response, (buffer) {
          this._buffer = buffer;
        });
      });
      request.send();
    });
  }

  void set loop(bool val) => this._loop = val;
  void set volume(num val) => this._volume = val;

  void play() {
    final source = audioContext.createBufferSource();
    final gainNode = audioContext.createGain();
    gainNode.connectNode(audioContext.destination as AudioNode);
    gainNode.gain?.value = this._volume;
    source.connectNode(gainNode);
    source.connectNode(audioContext.destination as AudioNode);
    source.buffer = this._buffer;
    source.loop = this._loop;
    source.start();
  }
}

class Music
{
  AudioElement _sound;
  Music(String src): this._sound = new AudioElement()
  {
    this._sound.preload = 'auto';
    this._sound.src = src;
    document.body?.append(this._sound);
  }

  bool get loop => this._sound.loop;
  void set loop(bool val) => this._sound.loop = val;

  void set volume(num val) => this._sound.volume = val;
  void addEventListener(String type, EventListener? listener)
    => this._sound.addEventListener(type, listener);

  void removeEventListener(String type, EventListener? listener) {
    this._sound.removeEventListener(type, listener);
  }

  Future<void> play() async => this._sound.play();
  void stop() {
    this._sound.pause();
    this._sound.currentTime = 0;
  }
}
