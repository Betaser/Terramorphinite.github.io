import { Vector2 } from "./vector2.js";

export class Polygon {
    /**
     * @param {Array<Vector2>} points 
     */
    constructor(points) {
        /** 
         * @property {Array<Vector2>} points
         */
        this.points = points
    }

    rectDimensions() {
        const dim = this.points[2].minus(this.pos());
        return dim;
    }

    moveBy(vector2) {
        for (let point of this.points) {
            point.add(vector2);
        }
    }

    static rect(topLeft, width, height) {
        topLeft = topLeft.clone();
        return new Polygon([
            topLeft,
            topLeft.plus2(width, 0),
            topLeft.plus2(width, height),
            topLeft.plus2(0, height)
        ]);
    }

    static square(topLeft, size) {
        return Polygon.rect(topLeft, size, size);
    }

    pos() {
        return this.points[0];
    }
}