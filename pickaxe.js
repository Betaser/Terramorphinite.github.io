class Pickaxe {
    constructor(element) {
        this.pos = new Vector2(0, 0);
        this.element = element;
    }

    update() {
        let normalMouse = getNormalizedMousePos();
        // say world coordinates are 100x100
        this.pos = normalMouse.scaled(100);

        const normalPos = this.pos.scaled(1 / 100);
        const screen = getElement("viewport").getBoundingClientRect();
        const screenPos = new Vector2(normalPos.x * screen.width, normalPos.y * screen.height);
        const rect = this.element.getBoundingClientRect();
        this.element.style.left = (screenPos.x - rect.width / 2) + "px";
        this.element.style.top = (screenPos.y - rect.height / 2) + "px";
        // console.log(rect);
    }
}