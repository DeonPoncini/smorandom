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
    world_peace_active: boolean;
    exit_moon_chain: Array<MoonID>;
    exit_moon_chain_set: Set<MoonID>;
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
        this.world_peace_active = false;
        this.exit_moon_chain = [];
        this.exit_moon_chain_set = new Set();
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

    calculate_exit_moon_chain(kingdoms: Kingdoms, moons: Moons) {
        // no exit moon available
        let exit_moon = kingdoms.kingdom(this.current_kingdom).exit_moon;
        if (exit_moon === undefined || exit_moon < 0) {
            return [];
        }
        this.exit_moon_chain_set = new Set();

        // do a BFS from the exit moon to all its dependencies
        let ret = [];
        let q = [];
        let visited = new Map();
        q.push(exit_moon);
        while (q.length !== 0) {
            let m = q.shift();
            let v = visited.get(m);
            if (v !== true) {
                // mark visited, push to ret queue and insert prereqs
                if (m !== undefined) {
                    visited.set(m, true);
                    // if it hasn't already been scheduled, add it to the chain
                    if (!this.moons_scheduled.has(m)) {
                        ret.push(m);
                        this.exit_moon_chain_set.add(m);
                    }
                    for (let mm of moons.moon(m).prerequisite_moons) {
                        q.push(mm);
                    }
                }
            }
        }
        this.exit_moon_chain = ret.reverse();
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
            if (options.backtrack) {
                // add all the previous kingdoms
                switch (this.current_kingdom) {
                    default: break;
                    case KingdomName.Sand:
                        this.add_kingdom_to_schedule(KingdomName.Cap);
                        this.add_kingdom_to_schedule(KingdomName.Cascade);
                        break;
                    case KingdomName.Lake:
                    case KingdomName.Wooded:
                        this.add_kingdom_to_schedule(KingdomName.Cap);
                        this.add_kingdom_to_schedule(KingdomName.Cascade);
                        this.add_kingdom_to_schedule(KingdomName.Sand);
                        break;
                    case KingdomName.Cloud:
                    case KingdomName.Metro:
                        this.add_kingdom_to_schedule(KingdomName.Cap);
                        this.add_kingdom_to_schedule(KingdomName.Cascade);
                        this.add_kingdom_to_schedule(KingdomName.Sand);
                        this.add_kingdom_to_schedule(KingdomName.Lake);
                        this.add_kingdom_to_schedule(KingdomName.Wooded);
                        break;
                    case KingdomName.Snow:
                    case KingdomName.Seaside:
                        this.add_kingdom_to_schedule(KingdomName.Cap);
                        this.add_kingdom_to_schedule(KingdomName.Cascade);
                        this.add_kingdom_to_schedule(KingdomName.Sand);
                        this.add_kingdom_to_schedule(KingdomName.Lake);
                        this.add_kingdom_to_schedule(KingdomName.Wooded);
                        this.add_kingdom_to_schedule(KingdomName.Metro);
                        break;
                    case KingdomName.Luncheon:
                        this.add_kingdom_to_schedule(KingdomName.Cap);
                        this.add_kingdom_to_schedule(KingdomName.Cascade);
                        this.add_kingdom_to_schedule(KingdomName.Sand);
                        this.add_kingdom_to_schedule(KingdomName.Lake);
                        this.add_kingdom_to_schedule(KingdomName.Wooded);
                        this.add_kingdom_to_schedule(KingdomName.Metro);
                        this.add_kingdom_to_schedule(KingdomName.Snow);
                        this.add_kingdom_to_schedule(KingdomName.Seaside);
                        break;
                    case KingdomName.Ruined:
                    case KingdomName.Bowser:
                        this.add_kingdom_to_schedule(KingdomName.Cap);
                        this.add_kingdom_to_schedule(KingdomName.Cascade);
                        this.add_kingdom_to_schedule(KingdomName.Sand);
                        this.add_kingdom_to_schedule(KingdomName.Lake);
                        this.add_kingdom_to_schedule(KingdomName.Wooded);
                        this.add_kingdom_to_schedule(KingdomName.Metro);
                        this.add_kingdom_to_schedule(KingdomName.Snow);
                        this.add_kingdom_to_schedule(KingdomName.Seaside);
                        this.add_kingdom_to_schedule(KingdomName.Luncheon);
                        break;
                }
            }
        }
        return true;
    }

    add_moon_to_schedule(id: MoonID): void {
        // don't add to schedule if its world peace and present in the exit chain
        if (this.world_peace_active) {
            if (this.exit_moon_chain_set.has(id)) {
                return;
            }
        }

        // don't add if its already scheduled
        if (!this.moons_scheduled.has(id)) {
            this.moons_to_schedule.push(id);
        }
    }

    schedulable(moons: Moons): number {
        // calculate the total weight of moons left
        let weight = 0;
        // we need to know the count of all the moons in case of multi
        for (let mm of this.exit_moon_chain) {
            weight += moons.moon(mm).count;
        }
        for (let mm of this.moons_to_schedule) {
            weight += moons.moon(mm).count;
        }
        return weight;
    }

    schedule_moon(kingdoms: Kingdoms, moons: Moons): number {
        let schedule_from_exit_chain = false;
        if (this.world_peace_active) {
            // if moons remaining is equal to or less than exit chain
            // always schedule exit chain
            let remaining = kingdoms.kingdom(this.current_kingdom).moons_to_leave
                - this.total_kingdom_moons;
            let exit_chain_weight = 0;
            // we need to know the count of all the moons in case of multi
            for (let mm of this.exit_moon_chain) {
                exit_chain_weight += moons.moon(mm).count;
            }
            if (remaining <= exit_chain_weight) {
                schedule_from_exit_chain = true;
            } else {
                // flip a coin
                let random = this.random.gen_range_int(0, 1);
                if (random === 0) {
                    schedule_from_exit_chain = true;
                }
            }
        }

        // if there are no moons to schedule, return false
        if (this.moons_to_schedule.length === 0) {
            if (this.world_peace_active) {
                // schedule from the exit chain if available
                if (this.exit_moon_chain.length === 0) {
                    return 0;
                } else {
                    schedule_from_exit_chain = true;
                }
            } else {
                return 0;
            }
        }

        let mts = 0;
        // randomly pick a moon and schedule it
        if (schedule_from_exit_chain && this.exit_moon_chain.length !== 0) {
            // take the front of the chain
            let m = this.exit_moon_chain.shift();
            if (m !== undefined) {
                mts = m;
            }
        } else {
            let random = this.random.gen_range_int(0,
                this.moons_to_schedule.length-1);
            mts = this.moons_to_schedule[random];
            this.moons_to_schedule.splice(random, 1);
        }
        let id = JSON.parse(JSON.stringify(mts));
        let count = moons.moon(id).count;
        // schedule it
        this.moons_ordered.push(id);
        this.moons_scheduled.add(id);
        this.total_kingdom_moons += count;
        this.total_moons += count;
        return count;
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
