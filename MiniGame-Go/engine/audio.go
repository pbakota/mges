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

package engine

// typedef unsigned char Uint8;
// void OnAudioPlayback(void *userdata, Uint8 *stream, int len);
import "C"
import (
	"unsafe"

	"github.com/veandco/go-sdl2/sdl"
)

const (
	AUDIO_FREQUENCY  = 44100
	AUDIO_FORMAT     = sdl.AUDIO_S16LSB
	AUDIO_CHANNELS   = 2
	AUDIO_SAMPLES    = 4096
	AUDIO_MAX_SOUNDS = 25
)

var (
	audios       []*Audio
	soundCount   int
	audioEnabled bool
)

type Audio struct {
	Position int
	Buffer   []byte
	Loop     bool
	Volume   int
	Spec     *sdl.AudioSpec
	Active   bool
}

type privateAudioDevice struct {
	device sdl.AudioDeviceID
	want   *sdl.AudioSpec
}

type Sound struct {
	device *privateAudioDevice
}

func (a *privateAudioDevice) pauseAudio() {
	if audioEnabled {
		sdl.PauseAudioDevice(a.device, true)
	}
}

func (a *privateAudioDevice) unpauseAudio() {
	if audioEnabled {
		sdl.PauseAudioDevice(a.device, false)
	}
}

//export OnAudioPlayback
func OnAudioPlayback(userdata unsafe.Pointer, stream *byte, length C.int) {
	n := int(length)
	buf := unsafe.Slice((*byte)(stream), n)
	for i := 0; i < n; i++ {
		buf[i] = 0
	}

	for index := len(audios) - 1; index >= 0; index-- {
		audio := audios[index]
		len := len(audio.Buffer)
		if len > audio.Position {
			tmpLen := uint32(min(len-audio.Position, int(length)))
			sdl.MixAudioFormat(stream, (*byte)(&audio.Buffer[audio.Position]), audio.Spec.Format, tmpLen, audio.Volume)
			audio.Position += int(tmpLen)
		} else if audio.Loop {
			audio.Position = 0
		} else {
			audio.Active = false
			if soundCount > 0 {
				soundCount--
			}

			audios = append(audios[:index], audios[index+1:]...)
		}
	}
}

func NewSound() *Sound {
	want := &sdl.AudioSpec{
		Freq:     AUDIO_FREQUENCY,
		Format:   AUDIO_FORMAT,
		Channels: AUDIO_CHANNELS,
		Samples:  AUDIO_SAMPLES,
		Callback: sdl.AudioCallback(C.OnAudioPlayback),
		UserData: nil,
	}
	obtained := &sdl.AudioSpec{}
	deviceId, err := sdl.OpenAudioDevice("", false, want, obtained, sdl.AUDIO_ALLOW_FORMAT_CHANGE)
	if err != nil {
		panic(err)
	} else if deviceId == 0 {
		LogErr("Warning: failed to open audio device: %s", sdl.GetError())
		return nil
	} else if want.Format != obtained.Format {
		LogWarn("Warning: format missmatch wanted %d but got %d", want.Format, obtained.Format)
	}
	p := &Sound{
		device: &privateAudioDevice{
			want:   want,
			device: deviceId,
		},
	}
	audioEnabled = true
	p.device.unpauseAudio()
	return p
}

func (s *Sound) EndSound() {
	if audioEnabled {
		s.device.pauseAudio()
		audioEnabled = false
		sdl.LockAudioDevice(s.device.device)
		sdl.CloseAudioDevice(s.device.device)
	}
}

func NewAudio(buffer []byte, spec *sdl.AudioSpec, volume int, loop bool) *Audio {
	return &Audio{
		Buffer: buffer,
		Loop:   loop,
		Volume: volume,
		Active: true,
		Spec:   spec,
	}
}

func (s *Sound) CreateAudio(filename string) *Audio {
	if len(filename) == 0 {
		LogErr("Warning: filename empty")
		return nil
	}

	buffer, spec := sdl.LoadWAV(filename)
	return NewAudio(buffer, spec, 0, false)
}

func (s *Sound) FreeAudio(audio *Audio) {
	sdl.FreeWAV(audio.Buffer)
}

func (s *Sound) PlayAudio(audio *Audio, loop bool) {
	s.PlayAudioVolume(audio, loop, sdl.MIX_MAXVOLUME)
}

func (s *Sound) PlayAudioVolume(audio *Audio, loop bool, volume int) {
	if !audioEnabled {
		return
	}

	if !loop {
		if soundCount >= AUDIO_MAX_SOUNDS {
			return
		}

		soundCount++
	}

	a := &Audio{
		Buffer:   audio.Buffer,
		Position: 0,
		Loop:     loop,
		Volume:   volume,
		Spec:     audio.Spec,
	}

	/* Lock callback function */
	sdl.LockAudioDevice(s.device.device)
	audios = append(audios, a)
	sdl.UnlockAudioDevice(s.device.device)
}
