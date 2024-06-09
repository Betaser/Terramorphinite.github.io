import { updateInput, setupInput } from "./input.js";
import { Pickaxe } from "./pickaxe.js";
import { Vector2 } from "./math/vector2.js";
import { BlockConveyorBelt } from "./block_conveyor_belt.js";

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

export function renderSquareElement(square, uniqueClassName, from = "viewport") {
    const element = makeElement(uniqueClassName, { from: from });
    const dimensions = square.rectDimensions();
    renderViewportDimensions(element.style, dimensions.x, dimensions.y, from);
    renderViewportPosition(element.style, square.pos(), from);
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