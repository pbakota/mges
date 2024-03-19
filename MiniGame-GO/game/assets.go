package game

import (
	"github.com/pbakota/mges/engine"
	"github.com/veandco/go-sdl2/sdl"
)

var cwd string = ""

type Assets struct {
	PlayerFrames    []*sdl.Texture
	BeeFrames       []*sdl.Texture
	BlueFrames      []*sdl.Texture
	SnikyFrames     []*sdl.Texture
	FoxyFrames      []*sdl.Texture
	HeroBFrames     []*sdl.Texture
	PlayerBullet    *sdl.Texture
	Ground          *sdl.Texture
	BloodGround     *sdl.Texture
	BloodParticle   *sdl.Texture
	Explosion       *sdl.Texture
	Healthbar       *sdl.Texture
	Elements        *sdl.Texture
	Title           *sdl.Texture
	Medkit          *sdl.Texture
	Forest          *sdl.Texture
	Bomb            *sdl.Texture
	Music           *engine.Audio
	TickFx          *engine.Audio
	ExplosionFx     *engine.Audio
	PickupFx        *engine.Audio
	MobHitFx        *engine.Audio
	FireFx          *engine.Audio
	ExplosionLongFx *engine.Audio
}

func NewAssets(renderer *sdl.Renderer, loader *engine.Loader) *Assets {

	loadFrame := func(filename string) *sdl.Texture {
		return loader.LoadBitmap(renderer, cwd+"Tiles/"+filename)
	}

	loadBitmap := func(filename string) *sdl.Texture {
		return loader.LoadBitmap(renderer, cwd+"Bitmaps/"+filename)
	}

	loadSound := func(filename string) *engine.Audio {
		return loader.LoadAudio(cwd + "Sounds/" + filename)
	}

	p := &Assets{
		PlayerFrames: []*sdl.Texture{
			loadFrame("hero1.bmp"),
			loadFrame("hero2.bmp"),
		},
		BeeFrames: []*sdl.Texture{
			loadFrame("bee1a.bmp"),
			loadFrame("bee2a.bmp"),
		},
		BlueFrames: []*sdl.Texture{
			loadFrame("blue1a.bmp"),
			loadFrame("blue2a.bmp"),
		},
		SnikyFrames: []*sdl.Texture{
			loadFrame("sniky1.bmp"),
			loadFrame("sniky2.bmp"),
		},
		FoxyFrames: []*sdl.Texture{
			loadFrame("roka1.bmp"),
			loadFrame("roka2.bmp"),
		},
		HeroBFrames: []*sdl.Texture{
			loadFrame("hero1b.bmp"),
			loadFrame("hero2b.bmp"),
		},

		Music: loadSound("world_1.wav"),

		Elements:        loadBitmap("elements.bmp"),
		Title:           loadBitmap("title.bmp"),
		Forest:          loadBitmap("background.bmp"),
		PlayerBullet:    loadFrame("bullet.bmp"),
		Ground:          loadFrame("tile_0004.bmp"),
		BloodGround:     loadFrame("blood_tile.bmp"),
		BloodParticle:   loadFrame("blood.bmp"),
		Explosion:       loadFrame("explosion-4.bmp"),
		Healthbar:       loadFrame("healthbar.bmp"),
		Medkit:          loadFrame("medkit.bmp"),
		Bomb:            loadFrame("bombball.bmp"),
		TickFx:          loadSound("tick.wav"),
		ExplosionFx:     loadSound("explosion.wav"),
		PickupFx:        loadSound("pickup.wav"),
		MobHitFx:        loadSound("hit.wav"),
		FireFx:          loadSound("fire.wav"),
		ExplosionLongFx: loadSound("explosion_long.wav"),
	}

	return p
}

func (a *Assets) Free(loader *engine.Loader) {
	// NOTE: I am unsure here, is this a viable approach?
	defer loader.FreeBitmap(a.PlayerFrames[0])
	defer loader.FreeBitmap(a.PlayerFrames[1])
	defer loader.FreeBitmap(a.BeeFrames[0])
	defer loader.FreeBitmap(a.BeeFrames[1])
	defer loader.FreeBitmap(a.BlueFrames[0])
	defer loader.FreeBitmap(a.BlueFrames[1])
	defer loader.FreeBitmap(a.SnikyFrames[0])
	defer loader.FreeBitmap(a.SnikyFrames[1])
	defer loader.FreeBitmap(a.FoxyFrames[0])
	defer loader.FreeBitmap(a.FoxyFrames[1])
	defer loader.FreeBitmap(a.HeroBFrames[0])
	defer loader.FreeBitmap(a.HeroBFrames[1])
	defer loader.FreeAudio(a.Music)
	defer loader.FreeBitmap(a.Elements)
	defer loader.FreeBitmap(a.Title)
	defer loader.FreeBitmap(a.Forest)
	defer loader.FreeBitmap(a.PlayerBullet)
	defer loader.FreeBitmap(a.Ground)
	defer loader.FreeBitmap(a.BloodGround)
	defer loader.FreeBitmap(a.BloodParticle)
	defer loader.FreeBitmap(a.Explosion)
	defer loader.FreeBitmap(a.Healthbar)
	defer loader.FreeBitmap(a.Medkit)
	defer loader.FreeBitmap(a.Bomb)
	defer loader.FreeAudio(a.TickFx)
	defer loader.FreeAudio(a.ExplosionFx)
	defer loader.FreeAudio(a.PickupFx)
	defer loader.FreeAudio(a.MobHitFx)
	defer loader.FreeAudio(a.FireFx)
	defer loader.FreeAudio(a.ExplosionLongFx)
}
