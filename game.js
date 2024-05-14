const PlayerInputs = Object.freeze({
    Jump: ["KeyW", "Space"],
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

function update() {
    requestAnimationFrame(update);

    now = Date.now();
    elapsed = now - prevTime;

    if (elapsed > fpsInterval) {
        prevTime = now - (elapsed % fpsInterval);

        updateInput();

        if (PlayerInputsControllerKeyDown.Jump) {
            console.log("pressed jump");
        }

        // updateEntities(frames);
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