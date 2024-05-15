class Pickaxe {
    static SwingState = Object.freeze({
        None : "None",
        Swinging : "Swinging"
    });
    constructor(element) {
        this.pos = new Vector2(0, 0);
        this.element = element;
        const rect = this.element.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        this.initialDegrees = 0;
        this.degrees = this.initialDegrees;

        this.swingState = Pickaxe.SwingState.None;
    }

    update() {
        if (PlayerInputsController.LeftClick) {
            this.swingState = Pickaxe.SwingState.Swinging;
        }
        if (PlayerInputsController.FreezeGame) {
            this.swingState = Pickaxe.SwingState.None;
            this.degrees = this.initialDegrees;
        }

        switch (this.swingState) {
            case Pickaxe.SwingState.None:
                this.element.style.transform = "rotate(" + this.degrees + "deg)";
                break;
            case Pickaxe.SwingState.Swinging:
                // For now, say we are constantly rotating.
                this.degrees += (360 / 60);
                if (this.degrees > 360) {
                    this.swingState = Pickaxe.SwingState.None;
                    this.degrees = this.initialDegrees;
                }

                // Choose to not mod this.degrees to notice if we have bugs.
                // rotates around the middle of the pickaxe.
                this.element.style.transform = "rotate(" + this.degrees + "deg)";
                break;
        }
        if (PlayerInputsController.FreezeGame) {
            // don't follow the mouse, for debugging purposes.
            console.log("left " + this.element.style.left + " top " + this.element.style.top)
        } else {
            let normalMouse = getNormalizedMousePos();
            // say world coordinates are 100x100
            this.pos = normalMouse.scaled(100);

            const normalPos = this.pos.scaled(1 / 100);
            const screen = getElement("viewport").getBoundingClientRect();
            const screenPos = new Vector2(normalPos.x * screen.width, normalPos.y * screen.height);
            const rect = this.element.getBoundingClientRect();
            this.element.style.left = (screenPos.x - this.width / 2) + "px";
            this.element.style.top = (screenPos.y - this.height / 2) + "px";
        }
    }
}