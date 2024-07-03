import { Polygon } from "./polygon.js";
import { Vector2 } from "./vector2.js";

function calcRotationCmp(radians, mat) {
    // cos0, 1 for small rotations.
    let cmp = -mat[0];
    // sin0
    // quadrants 1, 2
    if (mat[1] >= 0) {
        cmp = 2 + mat[0];
    }
    if (radians >= 0) {
        return -cmp;
    }
    return cmp;
}

/**
 * @param {Vector2} around
 * @param {Vector2} initialPoint 
 * @param {Vector2} finalPoint 
 * @returns {Array<Number>}
 */
function calcRotation(around, initialPoint, finalPoint) {
    const xi = initialPoint.x - around.x;
    const yi = initialPoint.y - around.y;
    const xf = finalPoint.x - around.x;
    const yf = finalPoint.y - around.y;

    const A = [
        [xi,-yi], 
        [yi, xi]
    ];

    const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    const aInv = [
        [A[1][1] / det,-A[0][1] / det],
       [-A[1][0] / det, A[0][0] / det]
    ];

    const cosTheta = aInv[0][0] * xf + aInv[0][1] * yf;
    const sinTheta = aInv[1][0] * xf + aInv[1][1] * yf;

    return [cosTheta, sinTheta];
}

export class Rotation {
    /**
     * @param {Array<Array<Number>>} rotationMatrix
     * @param {Vector2} point
     * @param {Vector2} sideP1
     * @param {Vector2} sideP2
     */
    constructor() {
        this.rotationMatrix = null;
        this.point = null;
        this.sideP1 = null;
        this.sideP2 = null;
    }
}

/**
 * The big algorithm.
 * @param {Polygon} polygon 
 * @param {Number} radians 
 * @param {Vector2} around 
 * @param {Array<Polygon>} otherPolygons 
 * @returns {null | Rotation}
 */
// we check IF our closest collision is within radians, weird.
export function rotateUntilHit(polygon, radians, around, otherPolygons) {
    // First, let's search for vertex of polygon to side of otherPolygons collisions.
    let ret = new Rotation();
    // currently testing with positive radians.
    ret.rotationMatrix = radians < 0 ? [Infinity, 0] : [-Infinity, 0];

    for (const point of polygon.points) {
        for (const otherPolygon of otherPolygons) {
            for (let i = 0; i < otherPolygon.points.length; i++) {
                const p1 = otherPolygon.points[i];
                const p2 = otherPolygon.points[(i + 1) % otherPolygon.points.length];

                const d = point.minus(around).mag();

                // the side is defined by:
                // sx = {(p2.x - p1.x)t + p1.x
                // sx = {(xCoef)t       + (xConst + around.x)}
                // sy = {...y
                // (sx - around.x)^2 + (sy - around.y)^2 = d^2
                // ((xCoef)t + xConst + around.x - around.x)^2...
                const xConst = p1.x - around.x;
                const yConst = p1.y - around.y;
                const xCoef = p2.x - p1.x;
                const yCoef = p2.y - p1.y;
                // Then we have
                // xCoef^2(t^2) + 2xConst*xCoef(t) + xConst^2 +
                // yCoef^2(t^2) + 2yConst*yCoef(t) + yConst^2 = d^2
                const a = xCoef * xCoef + yCoef * yCoef;
                const b = 2 * (xConst * xCoef + yConst * yCoef);
                const c = xConst * xConst + yConst * yConst - d * d;
                // Solve for t. If it would be an imaginary solution, we expect there not to be a collision.

                // none for imaginary, or one, or two.
                let roots = [];
                // t is between 0 and 1. Simply reject imaginary roots, erring on the side of not rejecting it.
                // In the case of not rejecting it, we should use one solution.
                const underTheRoot = b * b - 4 * a * c;

                if (-0.002 < underTheRoot && underTheRoot < 0.001) {
                    roots = [0];
                } else if (underTheRoot > 0.001) {
                    roots = [-Math.sqrt(underTheRoot), Math.sqrt(underTheRoot)];
                } else {
                    continue;
                }

                // note, there should be either 1 or 2 solutions.
                const solutions = roots.map(n => (n - b) / (2 * a));

                if (-0.1 < solutions[0] && solutions[0] < 1.1) {
                    const finalPoint = new Vector2(
                        p1.x + solutions[0] * (p2.x - p1.x),
                        p1.y + solutions[0] * (p2.y - p1.y));
                    // cosTheta, sinTheta
                    const rotation = calcRotation(around, point, finalPoint);
                    
                    const rotationCmp = calcRotationCmp(radians, rotation);
                    const rotationMatrixCmp = calcRotationCmp(radians, ret.rotationMatrix);

                    if (rotationCmp < rotationMatrixCmp) {
                        ret.rotationMatrix = rotation;
                        ret.point = point;
                        ret.sideP1 = p1;
                        ret.sideP2 = p2;
                    }
                }
                // remember, we repeat this if there's two solutions. See below.

                if (solutions.length === 2 && -0.1 < solutions[1] && solutions[1] < 1.1) {
                    const finalPoint = new Vector2(
                        p1.x + solutions[1] * (p2.x - p1.x),
                        p1.y + solutions[1] * (p2.y - p1.y));
                    // cosTheta, sinTheta
                    const rotation = calcRotation(around, point, finalPoint);
                    
                    const rotationCmp = calcRotationCmp(radians, rotation);
                    const rotationMatrixCmp = calcRotationCmp(radians, ret.rotationMatrix);

                    if (rotationCmp < rotationMatrixCmp) {
                        ret.rotationMatrix = rotation;
                        ret.point = point;
                        ret.sideP1 = p1;
                        ret.sideP2 = p2;
                    }
                }

            }
        }
    }

    // so far, we keep hitting this.
    if (ret.point === null) {
        return null;
    }

    // compare the actual radians rotation
    let invCosTheta = Math.acos(ret.rotationMatrix[0]);
    if (ret.rotationMatrix[1] < 0) {
        invCosTheta += Math.PI;
    }
    
    /*
    // console.log(`compare radians ${radians} to invCosTheta ${invCosTheta}`);

    if ((radians < 0 && invCosTheta > radians) 
     || (radians > 0 && invCosTheta < radians)) {
        return null; 
    }
    */

    // And let's make the rotation matrix a touch weaker.
    // Try making this smarter though.
    const ROTATE_EPSILON = 0.999;
    ret.rotationMatrix = [
        [ret.rotationMatrix[0] / ROTATE_EPSILON, -ret.rotationMatrix[1] * ROTATE_EPSILON],
        [ret.rotationMatrix[1] * ROTATE_EPSILON, ret.rotationMatrix[0] / ROTATE_EPSILON]
    ];
    return ret;
    // remember, I've only went from point to side of polygon so far.
}

/**
 * @param {DOMRect} boundingBox 
 * @param {Vector2} vector2 
 * @returns {Boolean}
 */
export function boxContains(boundingBox, vector2) {
    return boundingBox.left <= vector2.x && vector2.x <= boundingBox.right
        && boundingBox.top <= vector2.y && vector2.y <= boundingBox.bottom;
}