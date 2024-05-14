let mouseX = 0;
let mouseY = 0;
onmousemove = e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
};

function getNormalizedMousePos() {
    const screen = getElement("viewport").getBoundingClientRect();
    return new Vector2(
        Math.max(0, Math.min(1, (mouseX - screen.left) / screen.width)),
        Math.max(0, Math.min(1, (mouseY - screen.top) / screen.height))
    );
}

function updateInputs(e, eventInfoToCheck = "code", keyDown = true) {
    let matched = false;
    checkInput: for (const input of Object.keys(PlayerInputs)) {
        const codes = PlayerInputs[input];

        for (const code of codes) {
            if (e[eventInfoToCheck] === code) {
                PlayerInputsController[input] = keyDown;
                matched = true;
                break checkInput;
            }
        }
    }
    if (!matched) {
        console.log("did not recognize input " + e[eventInfoToCheck]);
    }
}

onmouseup = e => {
    updateInputs(e, "button", false);
};

onmousedown = e => {
    updateInputs(e, "button", true);
};

function setupInput() {
    document.addEventListener("keyup", (e) => {
        updateInputs(e, "code", false);
    });

    document.addEventListener("keydown", (e) => {
        updateInputs(e, "code", true);
    });
    // I can do document.addEventListener "click", but it's annoying that it will only activate on clicks,
    //  and therefore I would have to invert the dependency of PlayerInputsController and PlayerInputsControllerKeyDown for just the mouse, bleh.
}

function updateInput() {
    // Proper way to toggle an input.
    for (const input of Object.keys(PlayerInputsController)) {
        PlayerInputsControllerKeyDown[input] = !LastPlayerInputs[input] && PlayerInputsController[input];
        LastPlayerInputs[input] = PlayerInputsController[input];
    }
}