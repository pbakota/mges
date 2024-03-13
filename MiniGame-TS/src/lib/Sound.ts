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

// NOTE: Putting the audio context here will cause the well known warning in main browsers ("The AudioContext was not allowed to start...") just ingore it!
const audioCtx = new AudioContext;

export class Sound {

    private _src: string;
    private _buffer?: AudioBuffer;
    private _loop: boolean = false;
    private _volume: number = 1.0;

    constructor(src: string) {
        this._src = src;
    }

    load(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
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

    set loop(value: boolean) {
        this._loop = value;
    }

    set volume(value: number) {
        this._volume = value;
    }

    play(): void {
        const source = audioCtx.createBufferSource();
        const gainNode = audioCtx.createGain();
        gainNode.connect(audioCtx.destination);
        gainNode.gain.value = this._volume;
        source.connect(gainNode).connect(audioCtx.destination);
        source.buffer = this._buffer!;
        source.loop = this._loop;
        source.start();
    }
}

/**
 * Sound management
 */
export class Music {

    private _sound: HTMLAudioElement;

    constructor(src: string) {
        this._sound = new Audio;
        this._sound.preload = "auto";
        this._sound.src = src;
        document.body.appendChild(this._sound);
    }

    get loop() { return this._sound.loop; }

    set loop(value: boolean) { this._sound.loop = value; }

    set volume(value: number) { this._sound.volume = value; }

    public addEventListener(event: string, cb: any, opts?: EventListenerOptions): void {
        this._sound?.addEventListener(event, cb, opts);
    }

    public removeEventListener(event: string, cb: any, opts?: EventListenerOptions): void {
        this._sound?.removeEventListener(event, cb, opts);
    }

    public play(): Promise<void> {
        return this._sound?.play();
    }

    public stop(): void {
        this._sound?.pause();
        this._sound.currentTime = 0;
    };
}
