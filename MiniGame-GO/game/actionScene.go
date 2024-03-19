package game

import (
	"fmt"

	"github.com/pbakota/mges/engine"
	"github.com/veandco/go-sdl2/sdl"
)

type ActionScene struct {
	IScene
	g *RabbitGame

	healthbar        *Healthbar
	player           *Hero
	mobs             []IMob
	explosions       []*Explosion
	dirts            []*Dirt
	nextMob          float64
	nextMobTimer     float64
	score            int32
	hiscore          int32
	ready            *GetReady
	isGameOver       bool
	gameOver         *GameOver
	bomb             *Bomb
	bombTimer        float64
	medkit           *Medkit
	medkitTimer      float64
	killed           int32
	missed           int32
	medkitCollected  int32
	bombsCollected   int32
	bombExplodeTimer float64
	bombExploded     bool
	bombExplodeAlpha int
}

func NewActionScene(game *RabbitGame) *ActionScene {
	p := &ActionScene{
		g: game,
	}
	p.healthbar = NewHealthbar(game)
	p.player = NewHero(game)
	p.gameOver = NewGameOver(game)
	p.ready = NewGetReady(game)
	p.bomb = NewBomb(game)
	p.medkit = NewMedkit(game)
	return p
}

func (a *ActionScene) Enter() {
	a.g.Control.Reset()

	clear(a.mobs)
	clear(a.explosions)
	clear(a.dirts)

	a.ready.Reset()
	a.player.Reset()
	a.gameOver.Reset()

	a.nextMob = 0
	a.nextMobTimer = 0
	a.score = 0
	a.hiscore = 0
	a.isGameOver = false
	a.bombTimer = 0
	a.medkitTimer = 0
	a.killed = 0
	a.missed = 0
	a.medkitCollected = 0
	a.bombsCollected = 0
	a.bombExplodeTimer = 0
	a.bombExploded = false
	a.bombExplodeAlpha = 255
}

func (a *ActionScene) Leave() {
}

func (a *ActionScene) Draw(renderer *sdl.Renderer, delta float64) {
	a.drawBackground(renderer, delta)

	// Get ready
	if !a.ready.IsReady {
		a.ready.Draw(renderer, delta)
	}

	if a.medkit.Active {
		a.medkit.Draw(renderer, delta)
	}

	if a.bomb.Active {
		a.bomb.Draw(renderer, delta)
	}

	if a.isGameOver {
		a.gameOver.Draw(renderer, delta)
	} else {
		a.player.Draw(renderer, delta)
		// player.debug(renderer);
	}

	a.drawEntities(renderer, delta)
}

func (a *ActionScene) drawBackground(renderer *sdl.Renderer, delta float64) {
	// static background
	r := sdl.Rect{X: 0, Y: 16, W: a.g.Width, H: 312}
	renderer.Copy(a.g.Assets.Forest, nil, &r)
	dst := sdl.Rect{X: 0, Y: 280 + 32, W: 32, H: 32}
	for i := 0; i < int(a.g.Width/32); i++ {
		dst.X = int32(i * 32)
		renderer.Copy(a.g.Assets.Ground, nil, &dst)
	}

	// Health bar
	a.healthbar.Draw(renderer, delta)

	// Score
	a.g.Text.DrawText(renderer, 0, 0, WhiteColor, DkGrayColor, fmt.Sprintf("Score: %08d", a.score))
	a.g.Text.DrawText(renderer, 356, 0, WhiteColor, DkGrayColor, fmt.Sprintf("HI-Score: %08d", a.hiscore))

	// Dirt
	for d := 0; d < len(a.dirts); d++ {
		dirt := a.dirts[d]
		if dirt.Active {
			dirt.Draw(renderer, delta)
		}
	}

	if a.bombExploded {
		renderer.SetDrawColor(WhiteColor.R, WhiteColor.G, WhiteColor.B, byte(a.bombExplodeAlpha))
		renderer.SetDrawBlendMode(sdl.BLENDMODE_BLEND)
		renderer.FillRect(&r)
		renderer.SetDrawBlendMode(sdl.BLENDMODE_NONE)
	}
}

func (a *ActionScene) drawEntities(renderer *sdl.Renderer, delta float64) {
	for e := len(a.dirts) - 1; e >= 0; e-- {
		entity := a.dirts[e]
		if entity.Active {
			entity.Draw(renderer, delta)
		}
	}
	for e := len(a.explosions) - 1; e >= 0; e-- {
		entity := a.explosions[e]
		if entity.Active {
			entity.Draw(renderer, delta)
		}
	}
}

func (a *ActionScene) Update(dt float64) {
	if a.g.Control.Exit {
		a.g.ChangeScene(GAME_SCENE_TITLE)
		return
	}

	a.removeInactiveEntities()

	if a.isGameOver {
		a.gameOver.Update(dt)
		a.score = a.gameOver.Score
		if a.score > a.hiscore {
			a.hiscore = a.score
		}
	} else {
		a.player.Update(dt)
	}

	if !a.ready.IsReady {
		a.ready.Update(dt)
	}

	if !a.medkit.Active && !a.isGameOver {
		a.medkitSpawn(dt)
	} else {
		a.updateMedkit(dt)
	}

	if !a.bomb.Active && !a.isGameOver {
		a.bombSpawn(dt)
	}

	a.updateBomb(dt)

	if a.ready.IsReady && !a.isGameOver {
		a.mobSpawn(dt)
	}
	a.updateMobs(dt)
	a.updateActiveEntities(dt)
}

func (a *ActionScene) medkitSpawn(dt float64) {
	a.medkitTimer += dt
	if a.medkitTimer > 20.0 {
		a.medkitTimer -= 20.0
		a.medkit.Reset(engine.Rnd.Float64() * float64(a.g.Width-32))
	}
}

func (a *ActionScene) updateMedkit(dt float64) {
	a.medkit.Update(dt)
	if !a.isGameOver {
		if a.medkit.HitBy(a.player) {
			a.g.Sound.PlayAudioVolume(a.g.Assets.PickupFx, false, 255)
			a.score += a.medkit.Point
			a.healthbar.Inc(20)
			a.medkitCollected++
		}
	}
}

func (a *ActionScene) bombSpawn(dt float64) {
	a.bombTimer += dt
	if a.bombTimer > 30.0 {
		a.bombTimer -= 30.0
		a.bomb.Reset(engine.Rnd.Float64() * float64(a.g.Width-32))
	}
}

func (a *ActionScene) updateBomb(dt float64) {
	if a.bombExploded {
		a.bombExplodeTimer += dt
		if a.bombExplodeTimer > 0.2 {
			a.bombExploded = false
		}
	}
	if a.bomb.Active {
		a.bomb.Update(dt)
		if !a.isGameOver {
			if a.bomb.HitBy(a.player) {
				a.g.Sound.PlayAudioVolume(a.g.Assets.ExplosionLongFx, false, 255)
				a.score += a.bomb.Point
				a.bombsCollected++

				for b := 0; b < len(a.mobs); b++ {
					mob := a.mobs[b].GetMob()
					if mob.Active {
						a.mobKilled(mob)
					}
				}
				a.bombExplodeTimer = 0.0
				a.bombExploded = true
				a.bombExplodeAlpha = 10
			}
		}
	}
}

func (a *ActionScene) mobSpawn(dt float64) {
	a.nextMobTimer += dt
	if a.nextMobTimer > a.nextMob {
		a.nextMobTimer = 0.0
		a.nextMob = engine.Rnd.Float64() * 0.8

		var flipped = engine.Rnd.Int31n(2) == 0
		var mobid = engine.Rnd.Float64() * 100

		var newMob IMob
		if mobid < 10 {
			newMob = NewMobSniky(a.g, flipped)
		} else if mobid < 40 && mobid >= 10 {
			newMob = NewMobBlue(a.g, flipped)
		} else if mobid < 70 && mobid >= 40 {
			newMob = NewMobBee(a.g, flipped)
		} else {
			newMob = NewMobFoxy(a.g, flipped)
		}
		a.mobs = append(a.mobs, newMob)
	}
}

func (a *ActionScene) updateMobs(dt float64) {
	for e := len(a.mobs) - 1; e >= 0; e-- {
		mob := a.mobs[e].GetMob()
		mob.Update(dt)
		if !a.isGameOver {
			if !mob.Active {
				a.missed++
			}
			if a.player.CheckBulletHit(mob) {
				if mob.HitBy(a.player) {
					a.mobKilled(mob)
				} else {
					// Just hit
					a.g.Sound.PlayAudioVolume(a.g.Assets.MobHitFx, false, 64)
				}
			}

			if a.player.CheckHitBy(mob) {
				a.healthbar.Dec(1)
				if a.healthbar.Health == 0 {
					a.GameOver()
				}
			}
		}
	}
}

func (a *ActionScene) mobKilled(mob *Mob) {
	a.killed++
	a.g.Sound.PlayAudioVolume(a.g.Assets.ExplosionFx, false, 255)

	newExplosion := NewExplosion(a.g, &mob.Position)
	a.explosions = append(a.explosions, newExplosion)

	mob.Active = false
	newDirt := NewDirt(a.g, &engine.Vector2f{X: mob.Position.X, Y: 280.0 + 32.0})
	a.dirts = append(a.dirts, newDirt)

	a.score += mob.Point

	if a.score > a.hiscore {
		a.hiscore = a.score
	}
}

func (a *ActionScene) GameOver() {
	a.isGameOver = true
	a.gameOver.Set(a.killed, a.missed, a.medkitCollected, a.bombsCollected, a.score)
}

func (a *ActionScene) updateActiveEntities(dt float64) {
	for e := len(a.dirts) - 1; e >= 0; e-- {
		entity := a.dirts[e]
		if entity.Active {
			entity.Update(dt)
		}
	}
	for e := len(a.explosions) - 1; e >= 0; e-- {
		entity := a.explosions[e]
		if entity.Active {
			entity.Update(dt)
		}
	}
}

func (a *ActionScene) removeInactiveEntities() {
	for e := len(a.dirts) - 1; e >= 0; e-- {
		entity := a.dirts[e]
		if !entity.Active {
			a.dirts = append(a.dirts[:e], a.dirts[e+1:]...)
		}
	}
	for e := len(a.explosions) - 1; e >= 0; e-- {
		entity := a.explosions[e]
		if !entity.Active {
			a.explosions = append(a.explosions[:e], a.explosions[e+1:]...)
		}
	}
	for e := len(a.mobs) - 1; e >= 0; e-- {
		entity := a.mobs[e].GetMob()
		if !entity.Active {
			a.mobs = append(a.mobs[:e], a.mobs[e+1:]...)
		}
	}
}
