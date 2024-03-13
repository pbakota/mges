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

import { Rect, Vector2 } from "Engine";

export interface Sprite {
    position: Vector2;
    draw(ctx: CanvasRenderingContext2D): void;
}

export abstract class Drawable implements Sprite {
    public position: Vector2;

    constructor(position: Vector2) {
        this.position = position;
    }

    public update(dt: number): void { }
    public abstract draw(ctx: CanvasRenderingContext2D): void;

    /**
     * AABB implementation
     * @param rect1
     * @param rect2
     * @returns boolean
     */
    public static aabb(rect1: Rect, rect2: Rect): boolean {
        return (
            rect1.x < rect2.x + rect2.w &&
            rect1.x + rect1.w > rect2.x &&
            rect1.y < rect2.y + rect2.h &&
            rect1.h + rect1.y > rect2.y
        );
    }

    /**
     * Draw box overlay over sprite
     * @param ctx
     * @param hb
     */
    public static debug = (ctx: CanvasRenderingContext2D, hb: Rect) => {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(hb.x, hb.y, hb.w, hb.h);
        ctx.stroke();
    }
}

export abstract class Movable extends Drawable {
    public velocity: Vector2;

    constructor(position: Vector2, velocity: Vector2) {
        super(position);
        this.velocity = velocity;
    }

    public abstract update(dt: number): void;
    public abstract draw(ctx: CanvasRenderingContext2D): void;
}
