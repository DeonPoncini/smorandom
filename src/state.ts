import {Kingdoms, KingdomName} from './kingdom';
import {MoonID, Moons} from './moon';
import Random from './random';
import {GenerateOptions, RunType} from './Input';

export class Output {
    kingdoms: Array<[string, Array<[string, number]>]>;
    current_index: number;

    constructor() {
        this.kingdoms = [];
        this.current_index = 0;
    }

    add_kingdom(kingdom: string): void {
        this.current_index = this.kingdoms.length;
        this.kingdoms.push([kingdom, []]);
    }

    add_moon(name: string, count: number): void {
        let [kingdom, moons] = this.kingdoms[this.current_index];
        moons.push([name, count]);
        this.kingdoms[this.current_index] = [kingdom, moons];
    }
}

class State {
    current_kingdom: KingdomName;
    total_kingdom_moons: number;
    total_moons: number;
    moons_to_schedule: Array<MoonID>;
    moons_stored_queue: Map<KingdomName, Array<MoonID>>;
    moons_ordered: Array<MoonID>;
    moons_scheduled: Set<MoonID>;
    kingdoms_to_schedule: Array<KingdomName>;
    kingdoms_ordered: Array<KingdomName>;
    kingdoms_scheduled: Map<KingdomName, number>;
    kingdoms_completed: Set<KingdomName>;
    completed_main_game: boolean;
    random: Random;

    constructor(random: Random) {
        this.current_kingdom = KingdomName.Darker;
        this.total_kingdom_moons = 0;
        this.total_moons = 0;
        this.moons_to_schedule = [];
        this.moons_stored_queue = new Map();
        this.moons_ordered = [];
        this.moons_scheduled = new Set();
        this.kingdoms_to_schedule = [];
        this.kingdoms_ordered = [];
        this.kingdoms_scheduled = new Map();
        this.kingdoms_completed = new Set();
        this.completed_main_game = false;
        this.random = random;
    }

    output_moons(kingdoms: Kingdoms, moons: Moons): Output {
        let output = new Output();
        let current_kingdom = KingdomName.Cap;
        for (let m of this.moons_ordered) {
            if (moons.moon(m).kingdom !== current_kingdom) {
                let k = moons.moon(m).kingdom;
                output.add_kingdom(kingdoms.kingdom(k).name);
                current_kingdom = k;
            }
            output.add_moon(moons.moon(m).name, moons.moon(m).count);
        }
        return output;
    }

    add_kingdom_to_schedule(id: KingdomName): void {
        if (id === this.current_kingdom) {
            return; // don't reschedule yourself
        }

        if (this.kingdoms_completed.has(id)) {
            let sq = this.moons_stored_queue.get(id);
            if (sq !== undefined) {
                if (sq.length === 0) {
                    return; // no stored moons
                }
                // otherwise, reschedule the kingdom
            } else {
                return;
            }
        }
        this.kingdoms_to_schedule.push(id);
    }

    schedule_kingdom(): boolean {
        // if there are no kingdoms to schedule, return false
        if (this.kingdoms_to_schedule.length === 0) {
            return false;
        }

        // randomly pick an available kingdom and schedule it
        let random = this.random.gen_range_int(0,
            this.kingdoms_to_schedule.length-1);
        // remove it from the scheduled
        let kts = this.kingdoms_to_schedule[random];
        let id = JSON.parse(JSON.stringify(kts));
        this.kingdoms_to_schedule.splice(random, 1);
        // schedule it
        this.kingdoms_ordered.push(id);
        // update how many times we scheduled it
        let ksc = this.kingdoms_scheduled.get(id);
        if (ksc === undefined) {
            this.kingdoms_scheduled.set(id, 1);
        } else {
            this.kingdoms_scheduled.set(id, ksc+1);
        }
        // if we have moons in the queue, back them up
        let v = this.moons_stored_queue.get(this.current_kingdom);
        if (v === undefined) {
            this.moons_stored_queue.set(this.current_kingdom,
                JSON.parse(JSON.stringify(this.moons_to_schedule)));
            this.moons_to_schedule = [];
        } else {
            let a = v.concat(this.moons_to_schedule);
            this.moons_stored_queue.set(this.current_kingdom, a);
            this.moons_to_schedule = [];
        }

        // set the current schedule
        this.current_kingdom = id;
        this.total_kingdom_moons = 0;
        // check if we beat the game
        if (this.current_kingdom === KingdomName.Mushroom) {
            this.completed_main_game = true;
        }
        // if we have backed up moons, move them to the queue
        let x = this.moons_stored_queue.get(this.current_kingdom);
        if (x !== undefined) {
            for (let xx of x) {
                this.moons_to_schedule.push(xx);
            }
        }
        this.moons_stored_queue.set(this.current_kingdom, []);
        return true;
    }

    complete_kingdom(id: KingdomName): void {
        this.kingdoms_completed.add(id);
    }

    next_kingdom(kingdoms: Kingdoms, options: GenerateOptions): boolean {
        // move to the next kingdom
        if (this.completed_main_game) {
            if (!kingdoms.kingdom(this.current_kingdom).can_leave(this)) {
                // can't leave yet
                return false;
            }
            if (options.runtype === RunType.Dark && this.total_moons >= 250) {
                this.kingdoms_to_schedule = [];
                this.add_kingdom_to_schedule(KingdomName.Dark);
            } else if (options.runtype === RunType.Darker &&
                    this.total_moons >= 500) {
                this.kingdoms_to_schedule = [];
                this.add_kingdom_to_schedule(KingdomName.Darker);
            } else {
                // add every kingdom that isn't this one
                this.add_kingdom_to_schedule(KingdomName.Cap);
                this.add_kingdom_to_schedule(KingdomName.Cascade);
                this.add_kingdom_to_schedule(KingdomName.Sand);
                this.add_kingdom_to_schedule(KingdomName.Lake);
                this.add_kingdom_to_schedule(KingdomName.Wooded);
                this.add_kingdom_to_schedule(KingdomName.Cloud);
                this.add_kingdom_to_schedule(KingdomName.Lost);
                this.add_kingdom_to_schedule(KingdomName.Metro);
                this.add_kingdom_to_schedule(KingdomName.Snow);
                this.add_kingdom_to_schedule(KingdomName.Seaside);
                this.add_kingdom_to_schedule(KingdomName.Luncheon);
                this.add_kingdom_to_schedule(KingdomName.Ruined);
                this.add_kingdom_to_schedule(KingdomName.Bowser);
                this.add_kingdom_to_schedule(KingdomName.Moon);
                this.add_kingdom_to_schedule(KingdomName.Mushroom);
                if (kingdoms.kingdom(KingdomName.Dark).available(this)) {
                    this.add_kingdom_to_schedule(KingdomName.Dark);
                }
                if (kingdoms.kingdom(KingdomName.Darker).available(this)) {
                    this.add_kingdom_to_schedule(KingdomName.Darker);
                }
            }
        } else {
            if (!kingdoms.kingdom(this.current_kingdom).can_leave(this)) {
                // can't leave yet
                return false;
            }
            for (let k of kingdoms.kingdom(this.current_kingdom).next_kingdoms) {
                if (kingdoms.kingdom(k).available(this)) {
                    this.add_kingdom_to_schedule(k);
                }
            }
        }
        return true;
    }

    add_moon_to_schedule(id: MoonID): void {
        this.moons_to_schedule.push(id);
    }

    schedule_moon(moons: Moons): boolean {
        // if there are no moons to schedule, return false
        if (this.moons_to_schedule.length === 0) {
            return false;
        }

        // randomly pick a moon and schedule it
        let random = this.random.gen_range_int(0, this.moons_to_schedule.length-1);
        let mts = this.moons_to_schedule[random];
        let id = JSON.parse(JSON.stringify(mts));
        this.moons_to_schedule.splice(random, 1);
        let count = moons.moon(id).count;
        // schedule it
        this.moons_ordered.push(id);
        this.moons_scheduled.add(id);
        this.total_kingdom_moons += count;
        this.total_moons += count;
        return true;
    }

    moon_scheduled(moon: MoonID): boolean {
        return this.moons_scheduled.has(moon);
    }

    kingdom_scheduled(kingdom: KingdomName, visited: number): boolean {
        let ks = this.kingdoms_scheduled.get(kingdom);
        if (ks === undefined) {
            return false;
        } else {
            if (ks >= visited) {
                return true;
            }
            return false;
        }
    }
}

export default State;
