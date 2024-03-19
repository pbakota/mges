package game

import (
	"fmt"

	"github.com/pbakota/mges/engine"
	"github.com/veandco/go-sdl2/sdl"
)

const (
	ADD_KILLS    = 0
	ADD_MISSES   = 1
	ADD_MEDIKITS = 2
	ADD_BOMS     = 3
	PRESS_FIRE   = 4
	KILLS_BONUS  = 2
	MISSED_BONUS = 0
	BOMBS_BONUS  = 50
	MEDKIT_BONUS = 100
)

type GameOver struct {
	engine.Sprite
	g                 *RabbitGame
	GameOverTimer     float64
	PressFiretimer    float64
	CountTimer        float64
	Killed            int32
	Missed            int32
	MedkitCollected   int32
	BombsCollected    int32
	CurrentScoreCount int32
	Score             int32
}

func NewGameOver(game *RabbitGame) *GameOver {
	return &GameOver{
		g: game,
	}
}

func (r *GameOver) Reset() {
	r.GameOverTimer = 0.0
	r.Killed = 0
	r.Missed = 0
	r.MedkitCollected = 0
	r.BombsCollected = 0
	r.Score = 0
	r.CurrentScoreCount = ADD_KILLS
	r.PressFiretimer = 99999999999999999
}

func (r *GameOver) Set(killed, missed, medkitCollected, bombsCollected, score int32) {
	r.Killed = killed
	r.Missed = missed
	r.MedkitCollected = medkitCollected
	r.BombsCollected = bombsCollected
	r.Score = score
}

func (r *GameOver) Update(dt float64) {
	r.GameOverTimer += dt
	if r.GameOverTimer > 3.0 {
		r.CountTimer += dt
		if r.CountTimer > 0.02 {
			r.CountTimer -= 0.02
			switch r.CurrentScoreCount {
			case ADD_KILLS:
				if r.Killed > 10 {
					r.g.Sound.PlayAudioVolume(r.g.Assets.TickFx, false, 64)
					r.Score += KILLS_BONUS * 10
					r.Killed -= 10
				} else if r.Killed > 0 {
					r.g.Sound.PlayAudioVolume(r.g.Assets.TickFx, false, 64)
					r.Score += KILLS_BONUS
					r.Killed--
				}
				if r.Killed == 0 {
					r.CurrentScoreCount = ADD_MISSES
				}
			case ADD_MISSES:
				if r.Missed > 10 {
					r.g.Sound.PlayAudioVolume(r.g.Assets.TickFx, false, 64)
					r.Score += MISSED_BONUS * 10
					r.Missed -= 10
				} else if r.Missed > 0 {
					r.g.Sound.PlayAudioVolume(r.g.Assets.TickFx, false, 64)
					r.Score += MISSED_BONUS
					r.Missed--
				}
				if r.Missed == 0 {
					r.CurrentScoreCount = ADD_BOMS
				}
			case ADD_BOMS:
				if r.BombsCollected > 10 {
					r.g.Sound.PlayAudioVolume(r.g.Assets.TickFx, false, 64)
					r.Score += BOMBS_BONUS * 10
					r.BombsCollected -= 10
				} else if r.BombsCollected > 0 {
					r.g.Sound.PlayAudioVolume(r.g.Assets.TickFx, false, 64)
					r.Score += BOMBS_BONUS
					r.BombsCollected--
				}
				if r.BombsCollected == 0 {
					r.CurrentScoreCount = ADD_MEDIKITS
				}
			case ADD_MEDIKITS:
				if r.MedkitCollected > 10 {
					r.g.Sound.PlayAudioVolume(r.g.Assets.TickFx, false, 64)
					r.Score += MEDKIT_BONUS * 10
					r.MedkitCollected -= 10
				}
				if r.MedkitCollected > 0 {
					r.g.Sound.PlayAudioVolume(r.g.Assets.TickFx, false, 64)
					r.Score += MEDKIT_BONUS
					r.MedkitCollected--
				}
				if r.MedkitCollected == 0 {
					r.CurrentScoreCount = PRESS_FIRE
					r.PressFiretimer = r.GameOverTimer + 1
				}
			}
		}
	}

	if r.CurrentScoreCount == PRESS_FIRE {
		if r.GameOverTimer > r.PressFiretimer {
			if r.g.Control.Fire {
				r.g.ChangeScene(GAME_SCENE_TITLE)
			}
		}
	}
}

func (r *GameOver) Draw(renderer *sdl.Renderer, delta float64) {
	src := sdl.Rect{X: 0, Y: 0, W: 160, H: 16}
	dst := sdl.Rect{X: 160, Y: 50, W: 160 * 2, H: 16 * 2}

	r.Frame.SetAlphaMod(255)
	renderer.Copy(r.Frame, &src, &dst)

	r.g.Text.DrawText(renderer, 170, 100, WhiteColor, DkGrayColor, fmt.Sprintf("Killed: %04d", r.Killed))
	r.g.Text.DrawTextEx(renderer, 400, 104, WhiteColor, DkGrayColor, fmt.Sprintf("x %d", KILLS_BONUS), engine.NewTextDrawOptions(engine.WithSize(0.5)))
	r.g.Text.DrawText(renderer, 170, 120, WhiteColor, DkGrayColor, fmt.Sprintf("Missed: %04d", r.Missed))
	r.g.Text.DrawTextEx(renderer, 400, 124, WhiteColor, DkGrayColor, fmt.Sprintf("x %d", MISSED_BONUS), engine.NewTextDrawOptions(engine.WithSize(0.5)))
	r.g.Text.DrawText(renderer, 170, 140, WhiteColor, DkGrayColor, fmt.Sprintf("Bombs : %04d", r.BombsCollected))
	r.g.Text.DrawTextEx(renderer, 400, 144, WhiteColor, DkGrayColor, fmt.Sprintf("x %d", MEDKIT_BONUS), engine.NewTextDrawOptions(engine.WithSize(0.5)))
	r.g.Text.DrawText(renderer, 170, 160, WhiteColor, DkGrayColor, fmt.Sprintf("Medkit: %04d", r.MedkitCollected))
	r.g.Text.DrawTextEx(renderer, 400, 164, WhiteColor, DkGrayColor, fmt.Sprintf("x %d", BOMBS_BONUS), engine.NewTextDrawOptions(engine.WithSize(0.5)))
	r.g.Text.DrawText(renderer, 140, 200, WhiteColor, BlackColor, fmt.Sprintf("FINAL SCORE: %08d", r.Score))

	if r.GameOverTimer > r.PressFiretimer {
		r.g.Text.DrawText(renderer, 200, 250, WhiteColor, BlackColor, "Press \"FIRE\"!")
	}
}

type GetReady struct {
	engine.Sprite
	IsReady       bool
	GetreadyTimer float64
	Alpha         int
	Game          *RabbitGame
}

func NewGetReady(game *RabbitGame) *GetReady {
	return &GetReady{}
}

func (r *GetReady) Reset() {
	r.IsReady = false
	r.Alpha = 255
	r.GetreadyTimer = 0
}

func (r *GetReady) Update(dt float64) {
	if r.IsReady {
		return
	}

	r.GetreadyTimer += dt
	if r.GetreadyTimer > 2.0 {
		r.Alpha -= 10
		if r.Alpha < 0 {
			r.Alpha = 0
		}
	}

	if r.GetreadyTimer > 5.0 {
		r.IsReady = true
	}
}

func (r *GetReady) Draw(renderer *sdl.Renderer, delta float64) {
	if r.IsReady {
		return
	}

	src := sdl.Rect{X: 0, Y: 16, W: 160, H: 16}
	dst := sdl.Rect{X: 160, Y: 150, W: 160 * 2, H: 16 * 2}

	r.Frame.SetAlphaMod(byte(r.Alpha))
	renderer.Copy(r.Frame, &src, &dst)
}
