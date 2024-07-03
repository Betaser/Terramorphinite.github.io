class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function calcRotation(initialPoint, finalPoint) {
    // Now, solve for the rotation matrix that corresponds to t.

    const xi = initialPoint.x;
    const yi = initialPoint.y;

    const A = [
        [xi, yi], 
        [yi,-xi]
    ];

    const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    const aInv = [
        [A[1][1] / det,-A[0][1] / det],
       [-A[1][0] / det, A[0][0] / det]
    ];

    const cosTheta = aInv[0][0] * finalPoint.x
                   + aInv[0][1] * finalPoint.y;
    const sinTheta = aInv[1][0] * finalPoint.x
                   + aInv[1][1] * finalPoint.y;

    // And let's make the rotation matrix a touch weaker.
    const ROTATE_EPSILON = 0.999;
    return [cosTheta / ROTATE_EPSILON, sinTheta * ROTATE_EPSILON];
}

function applyRotationMatrix(toThis, matrix, around) {
    const x = toThis.x;
    const y = toThis.y;
    const xf = ((x - around.x) * matrix[0][0] 
            +  (y - around.y) * matrix[0][1]) + around.x;
    const yf = ((x - around.x) * matrix[1][0] 
            +  (y - around.y) * matrix[1][1]) + around.y;
    return new Vector2(xf, yf);
}

function radToMat(rad) {
    return [
        [Math.cos(rad), -Math.sin(rad)],
        [Math.sin(rad), Math.cos(rad)]
    ];
}

const rotationOrigin = new Vector2(1, 1);
const initialPoint = new Vector2(1, 2);

const rotationRad = -Math.PI / 4;
const rotationMat = radToMat(rotationRad);
// console.log(rotationMat);

const finalPoint = applyRotationMatrix(initialPoint, rotationMat, rotationOrigin);
// console.log(finalPoint);

function calcRotationMatrix(around, initialPoint, finalPoint) {
    const xi = initialPoint.x - around.x;
    const yi = initialPoint.y - around.y;
    const xf = finalPoint.x - around.x;
    const yf = finalPoint.y - around.y;

    const A = [
        [xi,-yi],
        [yi, xi]
    ];

    /*
    [c0 -s0] [xi] = [xf]
    [s0  c0] [yi]   [yf]

    c0xi - s0yi = xf
    s0xi + c0yi = yf

    c0xi - s0yi = xf
    c0yi + s0xi = yf

    [xi -yi] [c0] = [xf]
    [yi  xi] [s0]   [yf]
    */

    const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    const aInv = [
        [A[1][1] / det, -A[0][1] / det],
       [-A[1][0] / det,  A[0][0] / det]
    ];
    console.log(aInv);

    const cosTheta = aInv[0][0] * xf + aInv[0][1] * yf;
    const sinTheta = aInv[1][0] * xf + aInv[1][1] * yf;
    return [
        [cosTheta, -sinTheta],
        [sinTheta, cosTheta]
    ];
}

/*
const calcedMat = calcRotationMatrix(rotationOrigin, initialPoint, finalPoint);
console.log(calcedMat);
const calcedFinalPoint = applyRotationMatrix(initialPoint, calcedMat, rotationOrigin);
console.log(calcedFinalPoint);
*/

/*
const rotationRad2 = -Math.PI - 0.2;
const rotationMat2 = radToMat(rotationRad2);
console.log(rotationMat2);
*/

function calcRotationCmp(radians, mat) {
    // cos0, 1 for small rotations.
    let cmp = -mat[0][0];
    // sin0
    // quadrants 1, 2
    if (mat[1][0] >= 0) {
        cmp = 2 + mat[0][0];
    }
    if (radians >= 0) {
        return -cmp;
    }
    return cmp;
}

const N = 10;
for (let i = 0; i < N - 1; i++) {
    const j = i + 1;
    const rad1 = -Math.PI * 2 / N * i;
    const rad2 = -Math.PI * 2 / N * j;

    const rotationCmp1 = calcRotationCmp(rad1, radToMat(rad1));
    const rotationCmp2 = calcRotationCmp(rad2, radToMat(rad2));
    /*
    console.log("rad1 " + rad1 + " rad2 " + rad2);
    console.log(rotationCmp1 + " cmp " + rotationCmp2);
    */
    if (rotationCmp1 < rotationCmp2) {
        console.log("success");
    } else {
        console.log("fail, " + rotationCmp1 + " " + rotationCmp2);
        console.log(rad1 + " " + rad2);
    }
}