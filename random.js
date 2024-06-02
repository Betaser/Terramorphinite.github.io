// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
// 32 bit numbers.
class Random {
    constructor(seed) {
        this.a = seed;
    }
    getNorm() {
        this.a |= 0;
        this.a = this.a + 0x9e3779b9 | 0;
        let t = this.a ^ this.a >>> 16;
        t = Math.imul(t, 0x21f0aaad);
        t = t ^ t >>> 15;
        t = Math.imul(t, 0x735a2d97);
        // >>> 0 turns any integer positive.
        return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
    }
}