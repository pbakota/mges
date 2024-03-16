package rs.lab.mges.engine;

import com.sun.jna.Pointer;
import com.sun.jna.ptr.IntByReference;
import com.sun.jna.ptr.PointerByReference;
import io.github.libsdl4j.api.audio.SDL_AudioDeviceID;
import io.github.libsdl4j.api.audio.SDL_AudioFormat;
import io.github.libsdl4j.api.audio.SDL_AudioSpec;
import io.github.libsdl4j.api.audio.SdlAudio;
import java.util.ArrayList;
import java.util.Collection;

import static io.github.libsdl4j.api.Sdl.SDL_WasInit;
import static io.github.libsdl4j.api.SdlSubSystemConst.SDL_INIT_AUDIO;
import static io.github.libsdl4j.api.audio.SdlAudioConst.AUDIO_S16LSB;
import static io.github.libsdl4j.api.audio.SdlAudioConst.SDL_MIX_MAXVOLUME;
import static io.github.libsdl4j.api.error.SdlError.SDL_GetError;
import static io.github.libsdl4j.api.audio.SdlAudio.SDL_CloseAudioDevice;
import static io.github.libsdl4j.api.audio.SdlAudio.SDL_FreeWAV;
import static io.github.libsdl4j.api.audio.SdlAudio.SDL_LockAudioDevice;
import static io.github.libsdl4j.api.audio.SdlAudio.SDL_PauseAudioDevice;
import static io.github.libsdl4j.api.audio.SdlAudio.SDL_UnlockAudioDevice;
import static io.github.libsdl4j.api.audio.SdlAudioConst.SDL_AUDIO_ALLOW_FORMAT_CHANGE;

public class Sound {

    private final static int AUDIO_FREQUENCY = 44100;
    private final static int AUDIO_FORMAT = AUDIO_S16LSB;
    private final static int AUDIO_CHANNELS = 2;
    private final static int AUDIO_SAMPLES = 4096;
    private final static int AUDIO_MAX_SOUNDS = 25;

    private static class PrivateAudioDevice {

        public SDL_AudioDeviceID device;
        public SDL_AudioSpec want;
        public boolean audioEnabled;
    }

    public static class Audio {

        public int length;
        public int lengthTrue;
        public long bufferTrue;
        public long buffer;
        public int position;
        public boolean loop;
        public boolean fade;
        public boolean free;
        public int volume;
        public SDL_AudioSpec audio;
        public boolean active;

        // <editor-fold defaultstate="collapsed" desc="Builder">
        public static Audio builder() {
            return new Audio();
        }

        public Audio setLength(int length) {
            this.length = length;
            return this;
        }

        public Audio setLengthTrue(int lengthTrue) {
            this.lengthTrue = lengthTrue;
            return this;
        }

        public Audio setBufferTrue(long bufferTrue) {
            this.bufferTrue = bufferTrue;
            return this;
        }

        public Audio setBuffer(long buffer) {
            this.buffer = buffer;
            return this;
        }

        public Audio setPosition(int position) {
            this.position = position;
            return this;
        }

        public Audio setLoop(boolean loop) {
            this.loop = loop;
            return this;
        }

        public Audio setFade(boolean fade) {
            this.fade = fade;
            return this;
        }

        public Audio setFree(boolean free) {
            this.free = free;
            return this;
        }

        public Audio setVolume(int volume) {
            this.volume = volume;
            return this;
        }

        public Audio setAudio(SDL_AudioSpec audio) {
            this.audio = audio;
            return this;
        }

        public Audio setActive(boolean active) {
            this.active = active;
            return this;
        }
        // </editor-fold>
    }

    private static final Collection<Audio> audios = new ArrayList<>();
    private static final PrivateAudioDevice device = new PrivateAudioDevice();

    private static int soundCount = 0;

    public static void playSound(String filename, int volume) {
        playAudio(filename, null, false, volume);
    }

    public static void playMusic(String filename) {
        playMusic(filename, SDL_MIX_MAXVOLUME);
    }

    public static void playMusic(String filename, int volume) {
        playAudio(filename, null, true, volume);
    }

    public static void playSoundFromMemory(Audio audio) {
        playSoundFromMemory(audio, SDL_MIX_MAXVOLUME);
    }

    public static void playSoundFromMemory(Audio audio, int volume) {
        playAudio(null, audio, false, volume);
    }

    public static void playMusicFromMemory(Audio audio) {
        playMusicFromMemory(audio, SDL_MIX_MAXVOLUME);
    }

    public static void playMusicFromMemory(Audio audio, int volume) {
        playAudio(null, audio, true, volume);
    }

    public static void initAudio() {
        if ((SDL_WasInit(SDL_INIT_AUDIO) & SDL_INIT_AUDIO) == 0) {
            SDLUtils.LogErr("Error: SDL_INIT_AUDIO not initialized");
            return;
        }
        
        device.want = new SDL_AudioSpec();
        device.want.freq = AUDIO_FREQUENCY;
        device.want.format = new SDL_AudioFormat(AUDIO_FORMAT);
        device.want.channels = AUDIO_CHANNELS;
        device.want.samples = AUDIO_SAMPLES;
        device.want.callback = (Pointer userdata, Pointer stream, int len) -> audioCallback(userdata, stream, len);
        device.want.userdata = null;

        SDL_AudioSpec obtained = new SDL_AudioSpec();
        device.device = SdlAudio.SDL_OpenAudioDevice(null, 0, device.want, obtained, SDL_AUDIO_ALLOW_FORMAT_CHANGE);
        if (device.device.intValue() == 0) {
            SDLUtils.LogInfo("Warning: failed to open audio device: %s", SDL_GetError());
        } else if (device.want.format.longValue() != obtained.format.longValue()) {
            SDLUtils.LogInfo("Warning: format missmatch wanted %d but got %d", device.want.format, obtained.format);
        } else {
            /* Set audio device enabled global flag */
            device.audioEnabled = true;

            /* Unpause active audio stream */
            unpauseAudio();
        }
    }

    public static void audioCallback(Pointer userdata, Pointer stream, int len) {
        /* Silence the main buffer (important!) */
        stream.clear(len);

        /* Mixing audio */
        for (var audio : audios) {
            if (audio.length > 0) {
                var tempLength = Math.min(len, audio.length);
                var ptr = Pointer.createConstant(audio.buffer + audio.position);
                SdlAudio.SDL_MixAudioFormat(stream, ptr, audio.audio.format, tempLength, audio.volume);
                audio.position += tempLength;
                audio.length -= tempLength;
            } else {
                if (audio.loop) {
                    audio.buffer = audio.bufferTrue;
                    audio.length = audio.lengthTrue;
                    audio.position = 0;
                } else {
                    if (soundCount > 0) {
                        soundCount--;
                    }
                }
            }
        }
    }

    public static void endAudio() {
        if (device.audioEnabled) {
            pauseAudio();

            SDL_LockAudioDevice(device.device);
            /* Close down audio */
            SDL_CloseAudioDevice(device.device);
        }
    }

    public static void pauseAudio() {
        if (device.audioEnabled) {
            SDL_PauseAudioDevice(device.device, 1);
        }
    }

    public static void unpauseAudio() {
        if (device.audioEnabled) {
            SDL_PauseAudioDevice(device.device, 0);
        }
    }

    public static void freeAudio(Audio audio) {
        if (audio.free) {
            SDL_FreeWAV(Pointer.createConstant(audio.bufferTrue));
        }
    }

    public static Audio createAudio(String filename, boolean loop, int volume) {
        Audio new_ = new Audio();

        if (Helpers.isNullOrEmpty(filename)) {
            SDLUtils.LogInfo("Warning: filename empty");
            return null;
        }

        new_.loop = loop;
        new_.fade = false;
        new_.free = true;
        new_.volume = volume;
        new_.audio = new SDL_AudioSpec();

        PointerByReference buffer = new PointerByReference();
        IntByReference bufferLen = new IntByReference();

        if (SdlAudio.SDL_LoadWAV(filename, new_.audio, buffer, bufferLen) == null) {
            SDLUtils.LogInfo("Warning: failed to open wave file: %s error: %s", filename, SDL_GetError());
            return null;
        }

        // Pointer-to-pointer: return the real buffer pointer
        new_.bufferTrue = Pointer.nativeValue(buffer.getPointer().getPointer(0));
        new_.lengthTrue = bufferLen.getValue();

        if (device.want.format.longValue() != new_.audio.format.longValue()) {
            SDLUtils.LogInfo("Warning: format missmatch wanted 0x%04x but got 0x%04x", device.want.format, new_.audio.format);
        }
        new_.buffer = new_.bufferTrue;
        new_.length = new_.lengthTrue;
        new_.position = 0;
        new_.active = true;

        return new_;
    }

    public static void playSound(String filename) {
        playAudio(filename, null, false, SDL_MIX_MAXVOLUME);
    }

    private static void playAudio(String filename, Audio audio, boolean loop) {
        playAudio(filename, audio, loop, SDL_MIX_MAXVOLUME);
    }

    private static void playAudio(String filename, Audio audio, boolean loop, int volume) {
        Audio new_;
        /* Check if audio is enabled */
        if (!device.audioEnabled) {
            return;
        }

        /* If sound, check if under max number of sounds allowed, else don't play */
        if (loop == false) {
            if (soundCount >= AUDIO_MAX_SOUNDS) {
                return;
            } else {
                soundCount++;
            }
        }
        /* Load from filename or from Memory */
        if (!Helpers.isNullOrEmpty(filename)) {
            /* Create new music sound with loop */
            var nnew_ = createAudio(filename, loop, volume);
            if (nnew_ == null) {
                return;
            }

            new_ = nnew_;
        } else if (audio != null) {
            new_ = Audio.builder()
                    .setLoop(loop)
                    .setFade(false)
                    .setVolume(volume)
                    .setPosition(0)
                    .setBuffer(audio.buffer)
                    .setLength(audio.length)
                    .setBufferTrue(audio.buffer)
                    .setLengthTrue(audio.length)
                    .setActive(true)
                    .setFree(false)
                    .setAudio(audio.audio);
        } else {
            SDLUtils.LogInfo("Warning: filename and Audio parameters NULL");
            return;
        }

        /* Lock callback function */
        SdlAudio.SDL_LockAudioDevice(device.device);

        audios.add(new_);

        SDL_UnlockAudioDevice(device.device);
    }

}
