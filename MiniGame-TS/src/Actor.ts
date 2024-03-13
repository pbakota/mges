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

import { Movable, Rect, Vector2 } from "lib/Engine";

export abstract class Actor extends Movable {
    public flipped: boolean;

    constructor(flipped: boolean, position: Vector2, velocity: Vector2 = new Vector2(0, 0)) {
        super(position, velocity);
        this.flipped = flipped;
    }

    public abstract get hitbox(): Rect;

    public abstract update(dt: number): void;
    public abstract draw(ctx: CanvasRenderingContext2D): void;
    public abstract hit(opponent: Actor): boolean;
}
