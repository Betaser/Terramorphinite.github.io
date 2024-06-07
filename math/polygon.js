import { Vector2 } from "./vector2.js";

export class Polygon {
    constructor(points) {
        this.points = points
    }

    squareDimensions() {
        return this.points[2].minus(this.pos()).toList();
    }

    moveBy(vector2) {
        for (let point of this.points) {
            point.add(vector2);
        }
    }

    static square(topLeft, size) {
        topLeft = topLeft.clone();
        return new Polygon([
            topLeft,
            topLeft.plus2(size, 0),
            topLeft.plus2(size, size),
            topLeft.plus2(0, size)
        ]);
    }

    pos() {
        return this.points[0];
    }
}