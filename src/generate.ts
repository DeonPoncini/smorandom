import Random from './random';
import State, {Output} from './state';
import {Kingdoms, KingdomName} from './kingdom';
import {Moons, MoonID} from './moon';
import {GenerateOptions, RunType} from './Input';

export function generate(seed: number, options: GenerateOptions): Output {
    let random = new Random(seed);
    let state = new State(random);
    let kingdoms = new Kingdoms();
    let moons = new Moons(kingdoms, options);
    let leave_chance = 1;
    let darkleave = false;
    let anykeepgoing = false;

    // start up the first kingdom
    state.add_kingdom_to_schedule(KingdomName.Cap);
    state.schedule_kingdom();
    let current_kingdom = KingdomName.Darker;

    while(1) {
        // check if we are in world peace mode
        if (!state.completed_main_game) {
            if (options.worldpeace ||
                state.current_kingdom === KingdomName.Bowser) {
                state.world_peace_active = true;
                // if we switch kingdoms, recalculate the exit chain
                if (current_kingdom !== state.current_kingdom) {
                    // calculate the moon exit chain
                    state.calculate_exit_moon_chain(kingdoms, moons);
                    current_kingdom = state.current_kingdom;
                }
            } else {
                state.world_peace_active = false;
            }
        } else {
            state.world_peace_active = false;
        }
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
        let scheduleable = state.schedulable(moons);
        let exit_count = Math.min(ec, scheduleable);
        let scheduled = 0;
        if (exit_count === scheduleable) {
            scheduled = exit_count;
        } else {
            scheduled = random.gen_range_int(exit_count, scheduleable-1);
        }
        // for Any% leave after the number of scheduled moons exactly
        if (options.runtype === RunType.Any && !anykeepgoing) {
            let tkm = state.total_kingdom_moons;
            let kt = kingdoms.kingdom(state.current_kingdom).moons_to_leave;
            if (tkm + scheduled > kt) {
                scheduled = kt - tkm;
            }
        }
        if (scheduled === 0) {
            if (!state.next_kingdom(kingdoms, options)) {
                // we need to keep going
                if (options.runtype === RunType.Any) {
                    anykeepgoing = true;
                    continue;
                }
            }
            // schedule the next kingdom
            if (!state.schedule_kingdom()) {
                // no more moons and no more kingdoms, we are done
                break;
            }
            // end depending on type
            if (options.runtype === RunType.Any) {
                if (options.mkany) {
                    if (state.current_kingdom === KingdomName.Moon) {
                        break;
                    }
                } else {
                    if (state.current_kingdom === KingdomName.Bowser) {
                        break;
                    }
                }
            }
            if (options.runtype === RunType.Dark) {
                if (state.current_kingdom === KingdomName.Dark) {
                    break;
                }
            }
            if (options.runtype === RunType.Darker) {
                if (state.current_kingdom === KingdomName.Darker) {
                    break;
                }
            }
        } else {
            // schedule the moons
            let x = 0;
            while(x < scheduled) {
                x += state.schedule_moon(kingdoms, moons);
            }
            // lets only leave with a 10% chance that increases 10% each time
            let chance = random.gen_range_int(0, 10);
            // for Any%, we try and leave as soon as possible
            if (options.runtype === RunType.Any) {
                chance = -1;
            }
            if (options.runtype === RunType.Any) {
                if (options.mkany) {
                    if (state.current_kingdom === KingdomName.Moon) {
                        break;
                    }
                } else {
                    if (state.current_kingdom === KingdomName.Bowser) {
                        if (state.next_kingdom(kingdoms, options)) {
                            // we are able to leave the kingdom
                            break;
                        }
                    }
                }
            }
            // for Dark side, we leave for Dark side if we are done
            if (options.runtype === RunType.Dark) {
                // we need to schedule two moons before quitting
                if (state.current_kingdom === KingdomName.Dark) {
                    if (darkleave) {
                        break;
                    } else {
                        darkleave = true;
                    }
                }
            }
            // for Darker side, we leave for Darker side if we are done
            if (options.runtype === RunType.Darker) {
                chance = -1;
                if (state.current_kingdom === KingdomName.Darker) {
                    break;
                }
            }
            if (chance < leave_chance) {
                leave_chance = 1;
                // leave for the next kingdom
                if (state.next_kingdom(kingdoms, options)) {
                    state.schedule_kingdom();
                }
            } else {
                leave_chance += 1;
            }
        }
    }

    return state.output_moons(kingdoms, moons);
}
