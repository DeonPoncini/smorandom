import {RunType} from './Input';

export function createSeed(rt: RunType): [number, number] {
    // control bits
    let r: number = 0x0;
    r = updateRunType(rt, r);
    // create a 32 bit random number to fill the rest
    let n = generateSeed();
    return [r, n];
}

export function generateSeed(): number {
    return Math.floor(Math.random() * (1<<30));
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
    let s0 = s[0].toString(16);
    let s1 = s[1].toString(16);
    if (isNaN(s[0])) { s0 = ""; }
    if (isNaN(s[1])) { s1 = ""; }
    return s0 + s1;
}

export function seedFromString(st: string): [number, number] {
    let s0 = st.substr(0, 8);
    let s1 = st.substr(8, 8);
    let p0 = parseInt(s0, 16);
    let p1 = parseInt(s1, 16);
    return [p0, p1];
}

export function validate(s: [number, number]): boolean {
    // the top four bits must equal a valid run type
    let r = (s[0] & 0xF0000000) >> 28;
    if (r === 0 || r > 4) {
        return false;
    }

    // all bits must be zero after world peace
    let q = (s[0] & 0x07FFFFFF);
    if (q !== 0) {
        return false;
    }
    return true;
}

export function runtype(s: number): RunType {
    // the top four bits are the runtype
    let r = (s & 0xF0000000) >> 28;
    switch (r) {
        default: return RunType.Unset;
        case 1: return RunType.Any;
        case 2: return RunType.Dark;
        case 3: return RunType.Darker;
        case 4: return RunType.All;
    }
}

export function worldpeace(s: number): boolean {
    // the fifth bit is worldpeace
    let r = (s & 0x08000000) >> 27;
    if (r === 1) {
        return true;
    }
    return false;
}
