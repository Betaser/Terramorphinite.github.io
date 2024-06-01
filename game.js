const PlayerInputs = Object.freeze({
    Jump: ["KeyW", "Space"],
    LeftClick: [0],
    FreezeGame: ["KeyF"]
});

const PlayerInputsController = Object.assign({}, PlayerInputs);
for (const action of Object.keys(PlayerInputsController)) {
    PlayerInputsController[action] = false;
}

const LastPlayerInputs = Object.assign({}, PlayerInputs);
for (const action of Object.keys(LastPlayerInputs)) {
    LastPlayerInputs[action] = false;
}

const PlayerInputsControllerKeyDown = Object.assign({}, PlayerInputs);
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

const WORLD_WIDTH = 160;
const WORLD_HEIGHT = 90;

let entities = [new Pickaxe(getElement("pickaxe")), new BlockConveyorBelt()];
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

        // updateEntities(frames);
        for (entity of entities) {
            entity.update();
        }

        for (entity of entities) {
            entity.render();
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

function getElement(uniqueClassName) {
    return document.getElementsByClassName(uniqueClassName)[0];
}