export class Vector2 {
    static zero() {
        return new Vector2(0, 0);
    }
    /**
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(vector2) {
        this.x += vector2.x;
        this.y += vector2.y;
        return this;
    }
    /**
     * @returns {Number}
     */
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    /**
     * @param {Vector2} vector2
     */
    set(vector2) {
        this.x = vector2.x;
        this.y = vector2.y;
        return this;
    }
    plus2(x, y) {
        return new Vector2(this.x + x, this.y + y);
    }
    plus(vector2) {
        return new Vector2(this.x + vector2.x, this.y + vector2.y);
    }
    minus(vector2) {
        return new Vector2(this.x - vector2.x, this.y - vector2.y);
    }
    div2(a, b) {
        return new Vector2(this.x / a, this.y / b);
    }
    times2(a, b) {
        return new Vector2(this.x * a, this.y * b);
    }
    scaled(by) {
        return new Vector2(this.x * by, this.y * by);
    }
    clone() {
        return new Vector2(this.x, this.y);
    }
    toString() {
        return "<" + x + ", " + y + ">";
    }
    toList() {
        return [this.x, this.y];
    }
}