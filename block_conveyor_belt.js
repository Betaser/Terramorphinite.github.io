class BlockConveyorBelt {
    constructor() {
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
                // console.log("compare the two, " + (Block.SIZE / 2 / WORLD_HEIGHT * screen.height) + " vs " + rect.height / 2);
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
    }

    static mkElement() {
        const element = document.createElement("div");
        element.className = "block";
        getElement("viewport").appendChild(element);
        return element;
    }
}

class AirBlock extends Block {

    constructor(element, pos) {
        super(element, pos);
    }

    static mkAirElement() {
        const element = document.createElement("div");
        element.className = "air block";
        getElement("viewport").appendChild(element);
        return element;
    }
}