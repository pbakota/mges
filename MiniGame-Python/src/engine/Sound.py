from ctypes import *
from typing import Any  # type: ignore
from sdl2 import *  # type: ignore
from . import SDLUtils

__all__ = [
    "Audio",
    "Sound",
]

AUDIO_FREQUENCY = 44100
AUDIO_FORMAT = AUDIO_S16LSB
AUDIO_CHANNELS = 2
AUDIO_SAMPLES = 4096
AUDIO_MAX_SOUNDS = 25

USERDATA = c_void_p


class PrivateAudioDevice:
    def __init__(self):
        self.device = None
        self.want = SDL_AudioSpec(0, 0, 0, 0)
        self.audioEnabled = False


class Audio:
    def __init__(
        self,
        length=Uint32(),
        buffer=None,
        position=0,
        loop=False,
        volume=0,
        audioSpec=None,
        active=False,
    ):
        self._length = length
        self._lengthTrue = length
        self._buffer = buffer
        self._position = position
        self._loop = loop
        self._free = False
        self._volume = volume
        self._audioSpec = audioSpec
        self._active = active


class Sound:
    def __init__(self):
        self._audios = []
        self._device = PrivateAudioDevice()
        self._soundCount = 0

    # Factory method
    @staticmethod
    def initAudio() -> Any:
        if SDL_WasInit(SDL_INIT_AUDIO) & SDL_INIT_AUDIO == 0:
            SDLUtils.LogErr("Error: SDL_INIT_AUDIO not initialized")
            return None

        sound = Sound()
        sound._device.want = SDL_AudioSpec(
            freq=AUDIO_FREQUENCY,
            aformat=AUDIO_FORMAT,
            channels=AUDIO_CHANNELS,
            samples=AUDIO_SAMPLES,
            callback=SDL_AudioCallback(sound.audioCallback),
            userdata=USERDATA(0)
        )

        obtained = SDL_AudioSpec(
            freq=AUDIO_FREQUENCY,
            aformat=AUDIO_FORMAT,
            channels=AUDIO_CHANNELS,
            samples=AUDIO_SAMPLES,
        )
        sound._device.device = SDL_OpenAudioDevice(
            None, 0, sound._device.want, obtained, SDL_AUDIO_ALLOW_FORMAT_CHANGE
        )
        if sound._device.device == 0:
            SDLUtils.LogInfo(
                f"Warning: failed to open audio device: {SDL_GetError()}")
        elif sound._device.want.format != obtained.format:
            SDLUtils.LogInfo(
                f"Warning: format missmatch wanted {sound._device.want.format} but got {obtained.format}"
            )
        else:
            # Set global flag
            sound._device.audioEnabled = True
            # Unpause audio stream
            sound.unpauseAudio()

        return sound

    def endAudio(self):
        if self._device.audioEnabled:
            self.pauseAudio()
            SDL_LockAudioDevice(self._device.device)
            SDL_CloseAudioDevice(self._device.device)

    def pauseAudio(self):
        if self._device.audioEnabled:
            SDL_PauseAudioDevice(self._device.device, 1)

    def unpauseAudio(self):
        if self._device.audioEnabled:
            SDL_PauseAudioDevice(self._device.device, 0)

    def freeAudio(self, audio):
        SDL_FreeWAV(audio._buffer)

    def audioCallback(self, unused, buf, bufSize):
        # Silence the main buffer (important!)
        memset(buf, 0, bufSize)
        # Mixing audio
        for audio in [audio for audio in self._audios if audio._active]:
            if audio._length.value > audio._position:
                tmpLen = min(bufSize, audio._length.value - audio._position)
                ptr = cast(addressof(audio._buffer.contents) +
                           audio._position, POINTER(Uint8))
                SDL_MixAudioFormat(
                    buf, ptr, audio._audioSpec.format, tmpLen, audio._volume)
                audio._position += tmpLen
            else:
                if audio._loop:
                    audio._position = 0
                else:
                    audio._active = False
                    if self._soundCount > 0:
                        self._soundCount -= 1

    def playMusicFromMemory(self, audio:Audio, volume=SDL_MIX_MAXVOLUME):
        self.playAudio(audio, volume, True)

    def playSoundFromMemory(self, audio:Audio, volume=SDL_MIX_MAXVOLUME):
        self.playAudio(audio, volume, False)

    def createAudio(self, filename) -> None | Audio:
        newAudio = Audio()

        spec = SDL_AudioSpec(0, 0, 0, 0)
        buf = POINTER(Uint8)()
        length = Uint32()

        data = SDL_LoadWAV(
            filename.encode("utf8"),
            spec,
            buf,
            length,
        )
        if data == None:
            SDLUtils.LogInfo(
                f"Error: failed to open wave file: {filename} error: {SDL_GetError()}"
            )
            return None

        if self._device.want.format != spec.format:
            SDLUtils.LogInfo(
                f"Warning: format missmatch wanted {self._device.want.format} but got {spec.format}"
            )
        newAudio._buffer = buf
        newAudio._length = length
        newAudio._audioSpec = spec
        return newAudio

    def playAudio(self, audio, volume, loop):
        # Is audio enabled?
        if not self._device.audioEnabled:
            return
        # Too many sounds?
        if loop and self._soundCount >= AUDIO_MAX_SOUNDS:
            return
        newAudio = Audio(
            length=audio._length,
            buffer=audio._buffer,
            audioSpec=audio._audioSpec,
            position=0,
            loop=loop,
            volume=volume,
            active=True,
        )
        SDL_LockAudioDevice(self._device.device)
        # Remove inactive audio samples
        audios = [audio for audio in self._audios if audio._active]
        # Append new audio
        self._audios.append(newAudio)
        SDL_UnlockAudioDevice(self._device.device)
        if loop:
            self._soundCount += 1
