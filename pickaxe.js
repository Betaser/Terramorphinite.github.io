import { Vector2 } from "./math/vector2.js";
import { Entity } from "./entity.js";
import { gamePaused, getElement, PlayerInputsControllerKeyDown, renderSquareElement, WORLD_HEIGHT, WORLD_WIDTH } from "./game.js";
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
        this.hitbox = Polygon.rect(this.pos, width, height);

        // set the transform origin. Then, apply it to style. It's that annoying.
        const tlNormOrigin = new Vector2(0.5, 1.2);
        this.element.style.transformOrigin = 
            `${tlNormOrigin.x * 100}% ${tlNormOrigin.y * 100}% 0px`;
        this.transformOrigin = tlNormOrigin.times2(width, height);
    }

    renderHitbox() {
        renderSquareElement(this.hitbox, "red-outline-square", "hitbox-container");
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
                break;
            case Pickaxe.SwingState.Swinging:
                // For now, say we are constantly rotating.
                this.degrees += (360 / 60);
                if (this.degrees > 360) {
                    this.swingState = Pickaxe.SwingState.None;
                    this.degrees = this.initialDegrees;
                    this.element.style.transform = "rotate(" + this.degrees + "deg)";
                    const rect = this.element.getBoundingClientRect();
                    this.renderWidth = rect.width;
                    this.renderHeight = rect.height;
                }

                // Choose to not mod this.degrees to notice if we have bugs.
                // rotates around the middle of the pickaxe.
                this.element.style.transform = "rotate(" + this.degrees + "deg)";
                break;
        }
        if (!gamePaused) {
            const normalMouse = getNormalizedMousePos();
            // put pos at the location at which style.left and style.top should be at.
            this.pos = normalMouse.times2(WORLD_WIDTH, WORLD_HEIGHT)
                .minus(this.transformOrigin);
            const normalPos = this.pos.div2(WORLD_WIDTH, WORLD_HEIGHT);

            const screen = getElement("viewport").getBoundingClientRect();
            const screenPos = normalPos.times2(screen.width, screen.height);
            this.renderLeft = screenPos.x + "px";
            this.renderTop = screenPos.y + "px";
        }
        this.hitbox.moveBy(this.pos.minus(this.hitbox.pos()));
    }

    render() {
        this.element.style.left = this.renderLeft;
        this.element.style.top = this.renderTop; 
    }
}