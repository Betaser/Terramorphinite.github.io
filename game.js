import { updateInput, setupInput } from "./input.js";
import { Pickaxe } from "./pickaxe.js";
import { Vector2 } from "./math/vector2.js";
import { BlockConveyorBelt } from "./block_conveyor_belt.js";
import { Polygon } from "./math/polygon.js";

// Pixel perfectness can't be currently achieved, limiting the canvas for pixel perfect drawing to be exact divisors of the real pixel viewport 
//  is a requirement.
// The other generally required thing is avoiding antialiasing with certain drawing functions. fillrect works though, ofc limit the inputs to ints.

// in console debugging, do const game = await import("./game.js")...
export const PlayerInputs = Object.freeze({
    Jump: ["KeyW", "Space"],
    LeftClick: [0],
    FreezeGame: ["KeyF"],
    ToggleGameplayMode: ["KeyG"],
    ShowHitboxes: ["KeyH"]
});

export const PlayerInputsController = Object.assign({}, PlayerInputs);
for (const action of Object.keys(PlayerInputsController)) {
    PlayerInputsController[action] = false;
}

export const LastPlayerInputs = Object.assign({}, PlayerInputs);
for (const action of Object.keys(LastPlayerInputs)) {
    LastPlayerInputs[action] = false;
}

export const PlayerInputsControllerKeyDown = Object.assign({}, PlayerInputs);
for (const action of Object.keys(PlayerInputsController)) {
    PlayerInputsControllerKeyDown[action] = false;
}

/// INPUT
setupInput();

/// UPDATE LOOP
let frames = 0;

let fps, displayFrameInterval, fpsInterval, prevTime, prevDisplayTime, startTime;
let now, elapsed, elapsedDisplay;

function initFps(fpsValue) {
    fps = fpsValue;
    displayFrameInterval = fps / 2;
    fpsInterval = 1000 / fps;
    prevTime = Date.now();
    prevDisplayTime = Date.now();
    startTime = prevTime;
}
initFps(60);

export const WORLD_WIDTH = 160;
export const WORLD_HEIGHT = 90;

export let gamePaused = false;
export let showHitboxes = false;
export let inGameplayMode = true;

export function makeElement(uniqueClassName, { from = "viewport", id = null } = {}) {
    const element = document.createElement("div");
    if (id !== null) {
        element.id = id;
    }
    element.className = uniqueClassName;
    getElement(from).appendChild(element);
    return element;
}

export function drawSquareElement(square, uniqueClassName, from = "viewport") {
    const element = makeElement(uniqueClassName, { from: from });
    const dimensions = square.rectDimensions();
    renderViewportDimensions(element.style, dimensions.x, dimensions.y, from);
    renderViewportPosition(element.style, square.pos(), from);
}

/**
 * @param {Polygon} polygon
 * @param {CanvasRenderingContext2D} ctx 
 */
export function drawPolygon(polygon, ctx) {
    ctx.beginPath();
    const scx = canvasWidth / WORLD_WIDTH;
    const scy = canvasHeight / WORLD_HEIGHT;
    for (let i = 0; i < polygon.points.length; i++) {
        let pt = polygon.points[i];
        ctx.moveTo(Math.floor(pt.x * scx), Math.floor(pt.y * scy));
        pt = polygon.points[(i + 1) % polygon.points.length];
        ctx.lineTo(Math.floor(pt.x * scx), Math.floor(pt.y * scy));
    }
    ctx.stroke();
}

function renderViewportDimensions(style, width, height, from = "viewport") {
    const screen = getElement(from).getBoundingClientRect();
    const norm = new Vector2(width / WORLD_WIDTH, height / WORLD_HEIGHT);
    style.width = (screen.width * norm.x) + "px";
    style.height = (screen.height * norm.y) + "px";
}

export function renderViewportPosition(style, worldPosition, from = "viewport") {
    const screen = getElement(from).getBoundingClientRect();
    const norm = worldPosition.div2(WORLD_WIDTH, WORLD_HEIGHT);
    style.left = (screen.width * norm.x) + "px";
    style.top = (screen.height * norm.y) + "px";
}

/**
 * @param {string} layerId 
 * @param {Function<CanvasRenderingContext2D>} render 
 */
export function renderNow(layerId, render = canvasCtx => {}) {
    /**
     * @type {HTMLCanvasElement}
     */
    const canvas = document.getElementById(layerId);
    render(canvas.getContext("2d"));
}

function getPixelRatio(context) {
    const dpr = window.devicePixelRatio || 1;
    return dpr;
    /*
    const bsr = context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio || 1;

    return dpr / bsr;
    */
}

/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("debug-layer");
let canvasWidth = canvas.width;
let canvasHeight = canvas.height;
let pxRatio;
// 1.5, that is divide something by pixelRatio when rendering to an exact pixel size. 
// I don't think this value ever changes, to be honest.
//  Not necessarily useful except for drawing really small widths or dots?
export function pixelRatio() { return pxRatio };
new ResizeObserver(entries => {
    const ctx = canvas.getContext("2d");
    pxRatio = getPixelRatio(ctx);

    // canvasWidth = canvas.clientWidth;
    // canvasHeight = canvas.clientHeight;

    const entry = entries.find(e => e.target === canvas);
    // Real pixel size.
    // console.log(entry.devicePixelContentBoxSize[0].inlineSize);
    // These do the same thing.
    // console.log(Math.floor(canvasWidth * pxRatio));

    canvasWidth = Math.floor(canvas.clientWidth * pxRatio);
    canvasHeight = Math.floor(canvas.clientHeight * pxRatio);
    // console.log(canvasWidth);
    // ctx.setTransform(pxRatio, 0, 0, pxRatio, 0, 0);
}).observe(canvas, {box: ["device-pixel-content-box"]});

let viewportRatio = 1;
{
    let viewport = getElement("viewport").getBoundingClientRect();
    viewportRatio = viewport.width / viewport.height;
}
console.log("viewport is " + viewportRatio);

function updateViewportDimensions() {
    let background = getElement("background").getBoundingClientRect();
    // very wide
    let viewportWidth, viewportHeight;
    if (background.width / background.height > viewportRatio) {
        viewportHeight = background.height;
        viewportWidth = viewportHeight * viewportRatio;
    } else {
        viewportWidth = background.width;
        viewportHeight = viewportWidth / viewportRatio;
    }
    const viewport = getElement("viewport");
    viewport.style.width = viewportWidth + "px";
    viewport.style.height = viewportHeight + "px";
    viewport.style.top = ((background.height - viewportHeight) / 2) + "px";
    viewport.style.left = ((background.width - viewportWidth) / 2) + "px";
}
updateViewportDimensions();

export let entities = [new Pickaxe(getElement("pickaxe")), new BlockConveyorBelt()];

function update() {
    requestAnimationFrame(update);

    now = Date.now();
    elapsed = now - prevTime;

    if (elapsed > fpsInterval) {
        prevTime = now - (elapsed % fpsInterval);

        updateInput();
        if (PlayerInputsControllerKeyDown.FreezeGame) {
            gamePaused = !gamePaused;
            console.log("game " + (gamePaused ? "paused" : "unpaused"));
        }
        if (PlayerInputsControllerKeyDown.ToggleGameplayMode) {
            inGameplayMode = !inGameplayMode;
        }
        getElement("in-gameplay-mode").innerHTML = inGameplayMode ? "gameplay mode (toggle with G)" : "website mode (toggle with G)";

        updateViewportDimensions();

        if (PlayerInputsControllerKeyDown.Jump) {
            console.log("pressed jump");
        }
        if (PlayerInputsControllerKeyDown.ShowHitboxes) {
            showHitboxes = !showHitboxes;
        }

        /*
        const layers = getElement("layers");
        for (const canvas of layers.children) {
            let ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        */
        // yeah ofc generalize canvas.
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        /*
        // testing, seems to work.
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
        ctx.fillRect(0, 100, 1920 / 2 / pixelRatio(), 400);
        */

        // updateEntities(frames);
        for (const entity of entities) {
            entity.update();
            entity.render();
        }

        for (const node of getElement("hitbox-container").children) {
            node.remove();
        }

        if (showHitboxes) {
            for (const entity of entities) {
                entity.renderHitbox();
            }
        }

        frames++;

        if (frames % displayFrameInterval === 0) {
            elapsedDisplay = now - prevDisplayTime;
            prevDisplayTime = now - (elapsedDisplay % displayFrameInterval);
            const currentFps = 1000 / ( elapsedDisplay / displayFrameInterval);
            getElement("fps").innerHTML = "FPS: " + currentFps;
        }
    }
}

update();

export function getElement(uniqueClassName) {
    return document.getElementsByClassName(uniqueClassName)[0];
}