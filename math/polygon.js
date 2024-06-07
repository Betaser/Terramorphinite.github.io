export class Polygon {
    constructor(points) {
        this.points = points
    }

    squareDimensions() {
        return points[2].minus(pos()).toList();
    }

    static square(topLeft, size) {
        topLeft = topLeft.clone();
        return new Polygon([
            topLeft,
            topLeft.plus(size, 0),
            topLeft.plus(size, size),
            topLeft.plus(0, size)
        ]);
    }

    pos() {
        return this.points[0];
    }
}