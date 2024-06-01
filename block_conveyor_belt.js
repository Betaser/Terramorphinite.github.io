class BlockConveyorBelt {
    constructor() {
        this.columnSize = 5;
        this.onTheRight = WORLD_WIDTH - Block.SIZE;
        this.blocks = [BlockConveyorBelt.createColumn(this.onTheRight, this.columnSize)];
        this.frameCounter = 0;
    }

    update() {
        const FRAMES_TO_SPAWN = 60;
        const movementLeft = -Block.SIZE / FRAMES_TO_SPAWN / this.columnSize;
        this.frameCounter++;

        if (this.frameCounter > FRAMES_TO_SPAWN) {
            this.frameCounter = 0;

            BlockConveyorBelt.spawn(this.blocks, this.columnSize);
        }

        for (let column of this.blocks) {
            for (let block of column) {
                block.pos.x += movementLeft;
            }
        }
    }
    
    render() {
        const screen = getElement("viewport").getBoundingClientRect();
        for (let column of this.blocks) {
            for (let block of column) {
                // start at 160 - 8 + 4.
                const normCenter = new Vector2((block.pos.x + Block.SIZE / 2) / WORLD_WIDTH, (block.pos.y + Block.SIZE / 2) / WORLD_HEIGHT);
                const rect = block.element.getBoundingClientRect();
                block.element.style.left = (screen.width * normCenter.x - rect.width / 2) + "px";
                block.element.style.top = (screen.height * normCenter.y - rect.height / 2) + "px";
                console.log("compare the two, " + (Block.SIZE / 2 / WORLD_HEIGHT * screen.height) + " vs " + rect.height / 2);
            }
        }
    }

    static mkBlockElement() {
        const element = document.createElement("div");
        element.className = "block";
        getElement("viewport").appendChild(element);
        return element;
    }

    static createColumn(xPos, columnSize) {
        let column = [];
        for (let i = 0; i < columnSize; i++) {
            const element = BlockConveyorBelt.mkBlockElement();
            const pos = new Vector2(xPos, column.length * Block.SIZE);
            column.push(new Block(element, pos));
        }
        return column;
    }

    static spawn(pastBlocks, columnSize) {
        const element = BlockConveyorBelt.mkBlockElement();
        let lastColumn = pastBlocks[pastBlocks.length - 1];
        const lastPos = lastColumn[lastColumn.length - 1].pos;

        // make a new column
        if (lastColumn.length >= columnSize) {
            pastBlocks.push([
                new Block(element, lastColumn[0].pos.plus(new Vector2(Block.SIZE, 0)))
            ]);
        } else {
            lastColumn.push(new Block(element, lastPos.plus(new Vector2(0, Block.SIZE))));
        }
    }
}

class Block {

    // world is 160x90.
    // to match the render size.
    static SIZE = 0.08 * 160;

    constructor(element, pos) {
        this.pos = pos;
        this.element = element;
    }
}