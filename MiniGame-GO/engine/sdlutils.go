package engine

import "github.com/veandco/go-sdl2/sdl"

func LogInfo(str string, args ...interface{}) {
	sdl.LogInfo(sdl.LOG_CATEGORY_APPLICATION, str, args)
}

func LogErr(str string, args ...interface{}) {
	sdl.LogError(sdl.LOG_CATEGORY_APPLICATION, str, args)
}

func LogWarn(str string, args ...interface{}) {
	sdl.LogWarn(sdl.LOG_CATEGORY_APPLICATION, str, args)
}
