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
     * @param {Number} radians 
     * @param {Vector2} around
     */
    rotate(radians, around) {
        // center points around around being the origin.
        /*
        const pos = this.pos().clone();
        const relativePos = pos.minus(around);
        const rand = Math.random() > 0.9;
        this.moveTo(relativePos);
        if (rand) {
            console.log(relativePos.minus(pos));
            // console.log(toAround);
            console.log(this.clone().points);
        }
        */
        // sin cos matrix blah blah.
        // not sure how to use around.
        const mat = [
            [Math.cos(radians), Math.sin(radians)],
            [-Math.sin(radians), Math.cos(radians)]
        ];
        for (let point of this.points) {
            const x = point.x;
            const y = point.y;
            const diff = point.minus(around);
            if (diff.mag() > 100) {
                console.log(diff);
            }
            point.x = ((x - around.x) * mat[0][0] 
                    +  (y - around.y) * mat[0][1]) + around.x;
            point.y = ((x - around.x) * mat[1][0] 
                    +  (y - around.y) * mat[1][1]) + around.y;

            // why does this almost work
            // point.x = x * mat[0][0] + y * mat[0][1];
            // point.y = x * mat[1][0] + y * mat[1][1];
        }
        // this.moveTo(pos);
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