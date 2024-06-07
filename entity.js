export class Entity {
    render() {
        console.log("render " + this.constructor.name);
    }
    update() {
        console.log("update " + this.constructor.name);
    }
    renderHitbox() {
        console.log("render hitbox " + this.constructor.name);
    }
}