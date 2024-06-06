class Pickaxe {
    static SwingState = Object.freeze({
        None : "None",
        Swinging : "Swinging"
    });
    constructor(element) {
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
                const rect = this.element.getBoundingClientRect();
                this.renderWidth = rect.width;
                this.renderHeight = rect.height;
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
            // say world coordinates are 160x90
            this.pos = new Vector2(normalMouse.x * WORLD_WIDTH, normalMouse.y * WORLD_HEIGHT);

            const normalPos = normalMouse;
            const screen = getElement("viewport").getBoundingClientRect();
            const screenPos = new Vector2(normalPos.x * screen.width, normalPos.y * screen.height);
            this.renderLeft = (screenPos.x - this.renderWidth / 2) + "px";
            this.renderTop = (screenPos.y - this.renderHeight / 2) + "px";
        }
    }

    render() {
        this.element.style.left = this.renderLeft;
        this.element.style.top = this.renderTop; 
    }
}