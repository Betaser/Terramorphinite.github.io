import { updateInput, setupInput } from "./input.js";
import { Pickaxe } from "./pickaxe.js";
import { Vector2 } from "./math/vector2.js";
import { BlockConveyorBelt } from "./block_conveyor_belt.js";

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

export function makeElement(uniqueClassName) {
    const element = document.createElement("div");
    element.className = uniqueClassName;
    getElement("viewport").appendChild(element);
    return element;
}

export function renderSquareElement(square, uniqueClassName) {
    const element = makeElement(uniqueClassName);
    // TODO
    const dimensions = square.squareDimensions();
    drawViewportDimensions(element.style, dimensions[0], dimensions[1]);
    drawViewportPosition(element.style, square.pos());
}

function drawViewportDimensions(style, width, height) {
    const screen = getElement("viewport").getBoundingClientRect();
    const norm = new Vector2(width / WORLD_WIDTH, height / WORLD_HEIGHT);
    style.width = (screen.width * norm.x) + "px";
    style.height = (screen.height * norm.y) + "px";
}

export function drawViewportPosition(style, worldPosition) {
    const screen = getElement("viewport").getBoundingClientRect();
    const norm = new Vector2(worldPosition.x / WORLD_WIDTH, worldPosition.y / WORLD_HEIGHT);
    style.left = (screen.width * norm.x) + "px";
    style.top = (screen.height * norm.y) + "px";
}

export let entities = [new Pickaxe(getElement("pickaxe")), new BlockConveyorBelt()];
let viewportRatio = 1;
{
    let viewport = getElement("viewport").getBoundingClientRect();
    viewportRatio = viewport.width / viewport.height;
}
console.log("viewport is " + viewportRatio);

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

        if (PlayerInputsControllerKeyDown.Jump) {
            console.log("pressed jump");
        }
        if (PlayerInputsController.ShowHitboxes) {
            showHitboxes = !showHitboxes;
        }

        // updateEntities(frames);
        for (const entity of entities) {
            entity.update();
            entity.render();
            if (showHitboxes) {
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