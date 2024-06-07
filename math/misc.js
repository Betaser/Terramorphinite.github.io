export function boxContains(boundingBox, vector2) {
    return boundingBox.left <= vector2.x && vector2.x <= boundingBox.right
        && boundingBox.top <= vector2.y && vector2.y <= boundingBox.bottom;
}