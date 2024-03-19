package main

import "github.com/pbakota/mges/game"

func main() {
	g := game.NewRabbitGame(640, 480, "Rabbit unleashed")
	g.Run()
}
