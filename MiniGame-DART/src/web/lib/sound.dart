library engine;

import 'dart:html';
import 'dart:web_audio';

// NOTE: Putting the audio context here will cause the well known warning in main browsers ("The AudioContext was not allowed to start...") just ingore it!
final AudioContext audioContext = AudioContext();

class Sound {
  final String _src;
  AudioBuffer? _buffer;
  bool _loop = false;
  num _volume = 1.0;

  Sound(this._src);

  Future<void> load() {
    return HttpRequest.request(_src, responseType: 'arraybuffer')
        .then((HttpRequest request) {
      return audioContext.decodeAudioData(request.response);
    }).then((AudioBuffer buffer) {
      _buffer = buffer;
    });
    // return Future(()  {
    //   final request = HttpRequest();
    //   request.open('GET', _src, async: true);
    //   request.responseType = 'arraybuffer';
    //   request.onLoad.listen((event) {
    //     audioContext.decodeAudioData(event.target.response, (buffer) {
    //       _buffer = buffer;
    //     });
    //   });
    //   request.send();
    // });
  }

  set loop(bool val) => _loop = val;
  set volume(num val) => _volume = val;

  void play() {
    final source = audioContext.createBufferSource();
    final gainNode = audioContext.createGain();
    gainNode.connectNode(audioContext.destination as AudioNode);
    gainNode.gain?.value = _volume;
    source.connectNode(gainNode);
    source.connectNode(audioContext.destination as AudioNode);
    source.buffer = _buffer;
    source.loop = _loop;
    source.start();
  }
}

class Music {
  final AudioElement _sound;
  Music(String src) : _sound = AudioElement() {
    _sound.preload = 'auto';
    _sound.src = src;
    document.body?.append(_sound);
  }

  bool get loop => _sound.loop;
  set loop(bool val) => _sound.loop = val;

  set volume(num val) => _sound.volume = val;
  void addEventListener(String type, EventListener? listener) =>
      _sound.addEventListener(type, listener);

  void removeEventListener(String type, EventListener? listener) {
    _sound.removeEventListener(type, listener);
  }

  Future<void> play() async => _sound.play();
  void stop() {
    _sound.pause();
    _sound.currentTime = 0;
  }
}
