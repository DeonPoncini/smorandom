import Random from './random';
import State, {Output} from './state';
import {Kingdoms, KingdomName} from './kingdom';
import {Moons, MoonID} from './moon';
import {GenerateOptions} from './Input';

export function generate(seed: number, options: GenerateOptions): Output {
    let random = new Random(seed);
    let state = new State(random);
    let kingdoms = new Kingdoms();
    let moons = new Moons(kingdoms, options);
    let leave_chance = 1;

    // start up the first kingdom
    state.add_kingdom_to_schedule(KingdomName.Cap);
    state.schedule_kingdom();

    while(1) {
        // first, find all moons that can be scheduled
        let available: Array<MoonID> = moons.return_available(state);
        for (let a of available) {
            state.add_moon_to_schedule(a);
        }
        // schedule a random count trying to be enough to leave
        let ec = 0;
        if (state.completed_main_game) {
            ec = 1;
        } else {
            ec = kingdoms.kingdom(state.current_kingdom).moons_to_leave;
        }
        let scheduleable = state.moons_to_schedule.length;
        let exit_count = Math.min(ec, scheduleable);
        let scheduled = 0;
        if (exit_count === scheduleable) {
            scheduled = exit_count;
        } else {
            scheduled = random.gen_range_int(exit_count, scheduleable-1);
        }
        if (scheduled === 0) {
            state.next_kingdom(kingdoms);
            // schedule the next kingdom
            if (!state.schedule_kingdom()) {
                // no more moons and no more kingdoms, we are done
                console.log("WE ARE DONE");
                break;
            }
        } else {
            // schedule the moons
            for (let x = 0; x < scheduled; x++) {
                state.schedule_moon(moons);
            }
            // lets only leave with a 10% chance that increases 10% each time
            let chance = random.gen_range_int(0, 10);
            if (chance < leave_chance) {
                leave_chance = 1;
                // leave for the next kingdom
                if (state.next_kingdom(kingdoms)) {
                    state.schedule_kingdom();
                }
            } else {
                leave_chance += 1;
                console.log("Increasing leave chance to " + leave_chance);
            }
        }
    }
    console.log("PREPARING OUTPUT");

    return state.output_moons(kingdoms, moons);
}
