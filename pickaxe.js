import { Vector2 } from "./math/vector2.js";
import { Entity } from "./entity.js";
import { gamePaused, getElement, PlayerInputsControllerKeyDown, WORLD_HEIGHT, WORLD_WIDTH, renderNow,  drawPolygon } from "./game.js";
import { getNormalizedMousePos } from "./input.js";
import { Polygon } from "./math/polygon.js";

export class Pickaxe extends Entity {
    static SwingState = Object.freeze({
        None: "None",
        Swinging: "Swinging"
    });
    constructor(element) {
        super();
        this.pos = new Vector2(0, 0);
        this.element = element;
        this.initialDegrees = 0;
        this.degrees = this.initialDegrees;
        this.renderLeft = this.element.style.left;
        this.renderTop = this.element.style.top;

        this.swingState = Pickaxe.SwingState.None;
        const rect = this.element.getBoundingClientRect();
        this.renderWidth = rect.width;
        this.renderHeight = rect.height;

        const screen = getElement("viewport").getBoundingClientRect();
        const width = rect.width / screen.width * WORLD_WIDTH;
        const height = rect.height / screen.height * WORLD_HEIGHT;
        // this.hitbox = Polygon.rect(this.pos, width, height);
        // make it so that the "bottom left" to be at 0,0
        this.hitbox = Polygon.normal2d([
            [0.4, 1],
            [0.6, 1],
            [0.6, 0.2],
            [1, 0.2],
            [0.5, 0],
            [0, 0.2],
            [0.4, 0.2],
        ], width, height);
        this.clonedHitbox = this.hitbox.clone();
        this.hitboxOffset = this.hitbox.points[0].clone();
        /*
        this.hitbox = Polygon.normal2d([
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
        ], width, height);
        */

        // set the transform origin. Then, apply it to style. It's that annoying.
        const tlNormOrigin = new Vector2(0.5, 1.2);
        this.element.style.transformOrigin = 
            `${tlNormOrigin.x * 100}% ${tlNormOrigin.y * 100}% 0px`;
        this.transformOrigin = tlNormOrigin.times2(width, height);
    }

    rotateHitbox(amt, around) {
        const pos = this.hitbox.pos().clone();
        this.hitbox = this.clonedHitbox.clone();
        this.hitbox.moveTo(
            around.minus(this.transformOrigin)
            .plus(this.clonedHitbox.pos()));
        this.hitbox.rotate(amt * Math.PI / 180, around);
    }

    renderHitbox() {
        /**
         * @param {CanvasRenderingContext2D} ctx 
         */
        const rend = ctx => {
            ctx.lineWidth = 1;
            ctx.strokeStyle = "rgb(255, 0, 0)";
            drawPolygon(this.hitbox, ctx);
        }
        renderNow("debug-layer", rend);
    }

    update() {
        if (PlayerInputsControllerKeyDown.LeftClick) {
            this.swingState = Pickaxe.SwingState.Swinging;
        }
        if (gamePaused) {
            this.swingState = Pickaxe.SwingState.None;
            this.degrees = this.initialDegrees;
        }

        switch (this.swingState) {
            case Pickaxe.SwingState.None:
                this.hitbox.moveTo(this.pos.plus(this.hitboxOffset));
                break;
            case Pickaxe.SwingState.Swinging:
                // For now, say we are constantly rotating.
                const rotationSpeed = 360 / 60;
                this.degrees += rotationSpeed;
                if (this.degrees > 360) {
                    this.swingState = Pickaxe.SwingState.None;
                    this.degrees = this.initialDegrees;
                    this.element.style.transform = "rotate(" + this.degrees + "deg)";
                    const rect = this.element.getBoundingClientRect();
                    this.renderWidth = rect.width;
                    this.renderHeight = rect.height;
                    break;
                }

                // Choose to not mod this.degrees to notice if we have bugs.
                // rotates around the middle of the pickaxe.
                this.element.style.transform = "rotate(" + this.degrees + "deg)";

                this.rotateHitbox(-this.degrees, getNormalizedMousePos().times2(WORLD_WIDTH, WORLD_HEIGHT));
                break;
        }
        if (!gamePaused) {
            this.pos = this.rotationPosition();
            const normalPos = this.pos.div2(WORLD_WIDTH, WORLD_HEIGHT);

            const screen = getElement("viewport").getBoundingClientRect();
            const screenPos = normalPos.times2(screen.width, screen.height);
            this.renderLeft = screenPos.x + "px";
            this.renderTop = screenPos.y + "px";
        }
    }

    rotationPosition() {
        const normalMouse = getNormalizedMousePos();
        // put pos at the location at which style.left and style.top should be at.
        this.pos = normalMouse.times2(WORLD_WIDTH, WORLD_HEIGHT)
            .minus(this.transformOrigin);
        return this.pos;
    }

    render() {
        this.element.style.left = this.renderLeft;
        this.element.style.top = this.renderTop; 
    }
}