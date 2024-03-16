package rs.lab.mges.engine;

import io.github.libsdl4j.api.rect.SDL_Point;
import io.github.libsdl4j.api.rect.SDL_Rect;
import io.github.libsdl4j.api.render.SDL_Renderer;
import io.github.libsdl4j.api.render.SDL_RendererFlip;
import io.github.libsdl4j.api.render.SDL_Texture;
import rs.lab.mges.engine.SDLUtils.Vector2f;
import rs.lab.mges.engine.SDLUtils.Vector2i;

import static io.github.libsdl4j.api.rect.SdlRect.SDL_HasIntersection;
import static io.github.libsdl4j.api.render.SdlRender.SDL_SetTextureAlphaMod;
import static io.github.libsdl4j.api.render.SdlRender.SDL_RenderCopyEx;
import static io.github.libsdl4j.api.render.SdlRender.SDL_RenderDrawRect;
import static io.github.libsdl4j.api.render.SdlRender.SDL_SetRenderDrawColor;

public interface Drawable {

    public static class Sprite implements Drawable {

        public Vector2f position;
        public Vector2f oldPosition;

        public Vector2f velocity;
        public Vector2i size;

        public boolean flipped;

        protected SDL_Texture frame;

        public int alpha = 255;
        protected SDL_Rect hitbox;

        public Sprite(SDL_Texture frame, int w, int h) {
            this.frame = frame;
            this.position = new Vector2f();
            this.velocity = new Vector2f();
            this.oldPosition = null;
            this.size = new Vector2i(w, h);
            this.flipped = false;
            this.hitbox = SDLUtils.rect(0, 0, size.x, size.y);
        }

        public SDL_Rect getHitbox() {
            return SDLUtils.rect(position.x + hitbox.x, position.y + hitbox.y, hitbox.w, hitbox.h);
        }

        public void draw(SDL_Renderer renderer, float delta) {
            int x;
            int y;
            if (oldPosition != null) {
                x = (int) Math.round(oldPosition.x * delta + position.x * (1.0f - delta));
                y = (int) Math.round(oldPosition.y * delta + position.y * (1.0f - delta));
            } else {
                oldPosition = position;
                x = (int) Math.round(position.x);
                y = (int) Math.round(position.y);
            }

            var dst = SDLUtils.rect(x, y, size.x, size.y);
            var flip = flipped ? SDL_RendererFlip.SDL_FLIP_HORIZONTAL : SDL_RendererFlip.SDL_FLIP_NONE;

            if (alpha < 255) {
                SDLUtils.CheckSDLErr(() -> SDL_SetTextureAlphaMod(frame, (byte) alpha));
            }

            SDLUtils.CheckSDLErr(() -> SDL_RenderCopyEx(renderer, frame, null, dst, 0.0f, (SDL_Point) null, flip));

            if (alpha < 255) {
                SDLUtils.CheckSDLErr(() -> SDL_SetTextureAlphaMod(frame, (byte) 255));
            }
        }

        public void update(float dt) {
        }
        
        /**
         * Draw red rectangle around sprite's hit-box, can be used for debugging purpose
         * @param renderer 
         */
        public void debug(SDL_Renderer renderer) {
            SDLUtils.CheckSDLErr(() -> SDL_SetRenderDrawColor(renderer, (byte) 255, (byte) 0, (byte) 0, (byte) 255));
            SDLUtils.CheckSDLErr(() -> SDL_RenderDrawRect(renderer, getHitbox()));
        }

        // <editor-fold defaultstate="collapsed" desc="Builder">
        @SuppressWarnings("unchecked")
        public <TSprite extends Sprite> TSprite setPosition(Vector2f position) {
            this.position = position;
            this.oldPosition = null;
            return (TSprite) this;
        }

        @SuppressWarnings("unchecked")
        public <TSprite extends Sprite> TSprite setVelocity(Vector2f velocity) {
            this.velocity = velocity;
            return (TSprite) this;
        }

        @SuppressWarnings("unchecked")
        public <TSprite extends Sprite> TSprite setFlipped(boolean flipped) {
            this.flipped = flipped;
            return (TSprite) this;
        }
        // </editor-fold>
    }

    
    public static boolean AABB(SDL_Rect rect1, SDL_Rect rect2) {
        return SDL_HasIntersection(rect1, rect2);
    }

    /**
     * Animated sprite
     */
    public static abstract class AnimatedSprite extends Sprite {

        public int animFrame;
        public double animTimer;

        private final SDL_Texture[] frames;

        public AnimatedSprite(SDL_Texture[] frames, int w, int h) {
            super(frames[0], w, h);
            this.frames = frames;
            this.animFrame = 0;
            this.animTimer = 0.0d;
        }

        @Override
        public void draw(SDL_Renderer renderer, float delta) {
            frame = frames[animFrame];
            super.draw(renderer, delta);
            
        }
    }
}
