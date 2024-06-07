import { Vector2 } from "./math/vector2.js";
import { inGameplayMode, getElement } from "./game.js";
import { PlayerInputsController, PlayerInputs, PlayerInputsControllerKeyDown, LastPlayerInputs } from "./game.js";
import { boxContains } from "./math/misc.js";

export let mouseX = 0;
export let mouseY = 0;

onmousemove = e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
};

export function getNormalizedMousePos() {
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
    if (!inGameplayMode) return;
    e.preventDefault();
    updateInputs(e, "button", false);
};

onmousedown = e => {
    if (!inGameplayMode) return;
    e.preventDefault();
    updateInputs(e, "button", true);
};

document.addEventListener("contextmenu", e => {
    if (!inGameplayMode) return;
    const fpsRect = getElement("tl-infobox");
    if (e.button === 2 
        && !boxContains(fpsRect.getBoundingClientRect(), new Vector2(mouseX, mouseY))) {
        e.preventDefault();
    }
});

function openContextMenu() {
    var ev3 = new CustomMouseEvent("contextmenu", {
        bubbles: true,
        cancelable: false,
        view: window,
        button: 2,
        buttons: 0,
        clientX: mouseX,
        clientY: mouseY
    });
    getElement("background").dispatchEvent(ev3);
    return;
}

export function setupInput() {
    document.addEventListener("keyup", e => {
        updateInputs(e, "code", false);
    });

    document.addEventListener("keydown", e => {
        updateInputs(e, "code", true);
    });
    // I can do document.addEventListener "click", but it's annoying that it will only activate on clicks,
    //  and therefore I would have to invert the dependency of PlayerInputsController and PlayerInputsControllerKeyDown for just the mouse, bleh.
}

export function updateInput() {
    // Proper way to toggle an input.
    for (const input of Object.keys(PlayerInputsController)) {
        PlayerInputsControllerKeyDown[input] = !LastPlayerInputs[input] && PlayerInputsController[input];
        LastPlayerInputs[input] = PlayerInputsController[input];
    }
}