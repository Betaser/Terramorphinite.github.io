import { WORLD_HEIGHT, WORLD_WIDTH, gamePaused } from "./game.js"
import { Entity } from "./entity.js";
import { Polygon } from "./math/polygon.js";
import { Vector2 } from "./math/vector2.js";
import { Random } from "./random.js";
import { getElement, drawViewportPosition, renderSquareElement, makeElement } from "./game.js";

// todo: fix
export class BlockConveyorBelt extends Entity {
    constructor() {
        // required by javascript.
        super();
        this.columnSize = 5;
        this.startingColumns = 4;
        this.onTheRight = WORLD_WIDTH - (Block.SIZE * this.startingColumns);
        // Intialize the belt to some random columns, so a different algorithm has a lot of columns to look at.
        // Why not, start with a full column at first. Can be changed later, but that'll be for later.
        this.blocks = [BlockConveyorBelt.createColumn(this.onTheRight, this.columnSize)];
        this.random = new Random(12345);
        for (let i = 0; i < this.startingColumns; i++) {
            for (let j = 0; j < this.columnSize; j++) {
                // Spawn an entire column based on some randomization.
                // For testing and for the future, say the randomization is seed-based.
                let spawnArgs = null;
                if (this.random.getNorm() < 0.7) {
                    spawnArgs = [Block.mkElement(), (element, pos) => new Block(element, pos)];
                } else {
                    spawnArgs = [AirBlock.mkAirElement(), (element, pos) => new AirBlock(element, pos)];
                }
                BlockConveyorBelt.spawn(this.blocks, this.columnSize, spawnArgs[0], spawnArgs[1]);
            }
        }
        this.frameCounter = 0;
    }

    update() {
        if (gamePaused) {
            return;
        }

        const FRAMES_TO_SPAWN = 60;
        const movementLeft = -Block.SIZE / FRAMES_TO_SPAWN / this.columnSize;
        this.frameCounter++;

        if (this.frameCounter > FRAMES_TO_SPAWN) {
            this.frameCounter = 0;

            // Alright, we want to spawn at this rate, but choose what to spawn (can even be air).
            // For now, just do the simple thing of random 70% norm block.

            let spawnArgs = null;
            if (this.random.getNorm() < 0.7) {
                spawnArgs = [Block.mkElement(), (element, pos) => new Block(element, pos)];
            } else {
                spawnArgs = [AirBlock.mkAirElement(), (element, pos) => new AirBlock(element, pos)];
            }
            BlockConveyorBelt.spawn(this.blocks, this.columnSize, spawnArgs[0], spawnArgs[1]);
        }

        for (let column of this.blocks) {
            for (let block of column) {
                block.pos.x += movementLeft;

                // also update hitbox.
                // the general way will be to do this.
                const lastPos = block.hitbox.pos();
                const toCurr = block.pos.minus(lastPos);
                block.hitbox.moveBy(toCurr);
            }
        }
    }

    render() {
        for (const column of this.blocks) {
            for (const block of column) {
                drawViewportPosition(block.element.style, block.pos);
            }
        }
    }

    renderHitbox() {
        for (let column of this.blocks) {
            for (let block of column) {
                renderSquareElement(block.hitbox, "belt-based red-outline-square", "hitbox-container");
            }
        }
    }

    static createColumn(xPos, columnSize) {
        let column = [];
        for (let i = 0; i < columnSize; i++) {
            const element = Block.mkElement();
            const pos = new Vector2(xPos, column.length * Block.SIZE);
            column.push(new Block(element, pos));
        }
        return column;
    }

    static spawn(pastBlocks, columnSize, element = Block.mkElement(), blockConstructor = (element, pos) => new Block(element, pos)) {
        let lastColumn = pastBlocks[pastBlocks.length - 1];
        const lastPos = lastColumn[lastColumn.length - 1].pos;

        // make a new column
        if (lastColumn.length >= columnSize) {
            pastBlocks.push([
                blockConstructor(element, lastColumn[0].pos.plus(new Vector2(Block.SIZE, 0)))
            ]);
        } else {
            lastColumn.push(blockConstructor(element, lastPos.plus(new Vector2(0, Block.SIZE))));
        }
    }
}

class Block {

    // world is 160x90.
    // to match the render size, we use 0.08.
    static SIZE = 0.08 * 160;

    constructor(element, pos) {
        this.pos = pos;
        this.element = element;
        this.hitbox = Polygon.square(this.pos, Block.SIZE);
    }

    static mkElement() {
        return makeElement("block");
    }
}

class AirBlock extends Block {

    constructor(element, pos) {
        super(element, pos);
    }

    static mkAirElement() {
        return makeElement("air block");
    }
}