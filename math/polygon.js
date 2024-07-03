import { Vector2 } from "./vector2.js";

export class Polygon {
    /**
     * @param {Array<Vector2>} points 
     */
    constructor(points) {
        /** 
         * @property {Array<Vector2>} points
         */
        this.points = points;
    }

    /**
     * @param {Polygon} polygon 
     */
    copyFrom(polygon) {
        for (let i = 0; i < this.points.length; i++) {
            this.points[i].set(polygon.points[i]);
        }
    }

    /**
     * @param {Array<Array<Number>>} matrix 
     * @param {Vector2} around 
     */
    applyRotationMatrix(matrix, around) {
        for (let point of this.points) {
            const x = point.x;
            const y = point.y;
            point.x = ((x - around.x) * matrix[0][0] 
                    +  (y - around.y) * matrix[0][1]) + around.x;
            point.y = ((x - around.x) * matrix[1][0] 
                    +  (y - around.y) * matrix[1][1]) + around.y;
        }
    }

    /**
     * @param {Number} radians 
     * @param {Vector2} around
     */
    // Wikipedia says this order to the matrix will make positive rotations CCW, 
    //  as positive angle would expect
    rotate(radians, around) {
        // sin cos matrix blah blah.
        const mat = [
            [Math.cos(radians), -Math.sin(radians)],
            [Math.sin(radians), Math.cos(radians)]
        ];
        this.applyRotationMatrix(mat, around);
    }

    rectDimensions() {
        const dim = this.points[2].minus(this.pos());
        return dim;
    }

    /**
     * @param {Vector2} vector2 
     */
    moveTo(vector2) {
        const disp = vector2.minus(this.pos());
        for (let point of this.points) {
            point.x += disp.x;
            point.y += disp.y;
        }
    }

    /**
     * @returns {Polygon}
     */
    clone() {
        let points = [];
        for (const point of this.points) {
            points.push(point.clone());
        }
        return new Polygon(points);
    }

    moveBy(vector2) {
        for (let point of this.points) {
            point.add(vector2);
        }
    }

    /**
     * @param {Array<Array<Number>>} array 
     * @param {Number} width 
     * @param {Number} height 
     * @returns {Polygon}
     */
    static normal2d(array, width, height) {
        let points = [];
        for (const point of array) {
            points.push(new Vector2(point[0] * width, point[1] * height));
        }
        return new Polygon(points);
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
        return this.points[0].clone();
    }
}