import {RunType} from './Input';

export function createSeed(rt: RunType): [number, number] {
    // control bits
    let r: number = 0x0;
    r = updateRunType(rt, r);
    // create a 32 bit random number to fill the rest
    let n = Math.floor(Math.random() * (1<<30));
    console.log(n);
    return [r, n];
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

export function updateWorldPeace(wp: boolean, r: number): number {
    // zero out the world peace bits
    r = r & 0xF7FFFFFF;
    if (wp) {
        r = r | 0x08000000;
    }
    return r;
}

export function seedToString(s: [number, number]): string {
    return s[0].toString(16) + s[1].toString(16);
}

export function seedFromString(st: string): [number, number] {
    let s0 = st.substr(0, 8);
    let s1 = st.substr(8, 8);
    return [parseInt(s0, 16), parseInt(s1, 16)];
}
