import Rand from 'rand-seed';

class Random {
    rand: Rand;

    constructor(seed: number) {
        this.rand = new Rand(seed.toString(10));
    }

    gen_range(min: number, max: number): number {
        return this.rand.next() * (max-min)+min;
    }

    gen_range_int(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(this.rand.next() * (max-min+1)) + min;
    }
}

export default Random;
