import {RunType} from './Input';

export function createSeed(rt: RunType): number {
    // start with a 32 bit number, top bit set
    let r: number = 0x00000000;
    r = updateRunType(rt, r);
    // create a 28 bit random number to fill the rest
    let n = Math.random() * (1<<27);
    r = r | n;
    return r;
}

export function updateRunType(rt: RunType, r: number): number {
    // zero out the seed bits
    r = r & 0x0FFFFFFF;
    // set the next three bits to the run type
    if (rt === RunType.Any) {
        // 0001
        r = r | 0x10000000;
    } else if (rt === RunType.Dark) {
        // 0010
        r = r | 0x20000000;
    } else if (rt === RunType.Darker) {
        // 0011
        r = r | 0x30000000;
    } else if (rt === RunType.All) {
        // 0100
        r = r | 0x40000000;
    } // if unset it stays as zero

    return r;
}
