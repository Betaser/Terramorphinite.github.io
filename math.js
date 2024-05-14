class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    scaled(by) {
        return new Vector2(this.x * by, this.y * by);
    }
    toString() {
        return "<" + x + ", " + y + ">";
    }
}