import {MoonID} from './moon';
import State from './state';

export enum KingdomName {
    Cap = 0,
    Cascade,
    Sand,
    Lake,
    Wooded,
    Cloud,
    Lost,
    Metro,
    Snow,
    Seaside,
    Luncheon,
    Ruined,
    Bowser,
    Moon,
    Mushroom,
    Dark,
    Darker
}

export class Kingdom {
    name: string;
    moons_to_leave: number;
    moons_to_unlock: number;
    prerequisite_kingdoms: Array<KingdomName>;
    next_kingdoms: Array<KingdomName>;
    exit_moon: MoonID;

    constructor(name: string, moons_to_leave: number, moons_to_unlock: number) {
        this.name = name;
        this.moons_to_leave = moons_to_leave;
        this.moons_to_unlock = moons_to_unlock;
        this.prerequisite_kingdoms = [];
        this.next_kingdoms = [];
        this.exit_moon = -1;
    }

    add_prerequisite(id: KingdomName): void {
        this.prerequisite_kingdoms.push(id);
    }

    link_next(id: KingdomName): void {
        this.next_kingdoms.push(id);
    }

    set_exit_moon(moon: MoonID): void {
        this.exit_moon = moon;
    }

    can_leave(state: State): boolean {
        // can leave if the required moon ID has been scheduled
        if (this.exit_moon >= 0) {
            if (!state.moon_scheduled(this.exit_moon)) {
                return false;
            }
        }
        // can leave if the total kingdom moons are enough
        if (state.completed_main_game) {
            if (state.total_kingdom_moons < 1) {
                return false;
            }
        } else {
            if (state.total_kingdom_moons < this.moons_to_leave) {
                return false;
            }
        }
        return true;
    }

    available(state: State): boolean {
        // available if all prerequisites are scheduled
        for (let p of this.prerequisite_kingdoms) {
            if (!state.kingdom_scheduled(p, 1)) {
                return false;
            }
        }

        // available if total moons is enough
        if (state.total_moons < this.moons_to_unlock) {
            return false;
        }

        return true;
    }

}

export class Kingdoms {
    kingdoms: Array<Kingdom>;

    kingdom(id: KingdomName): Kingdom {
        return this.kingdoms[id];
    }

    constructor() {
        this.kingdoms = [];

        this.kingdoms.push(new Kingdom("Cap Kingdom", 0, 0));
        this.kingdoms.push(new Kingdom("Cascade Kingdom", 5, 0));
        this.kingdoms.push(new Kingdom("Sand Kingdom", 16, 0));
        this.kingdoms.push(new Kingdom("Lake Kingdom", 8, 0));
        this.kingdoms.push(new Kingdom("Wooded Kingdom", 16, 0));
        this.kingdoms.push(new Kingdom("Cloud Kingdom", 0, 0));
        this.kingdoms.push(new Kingdom("Lost Kingdom", 10, 0));
        this.kingdoms.push(new Kingdom("Metro Kingdom", 20, 0));
        this.kingdoms.push(new Kingdom("Snow Kingdom", 10, 0));
        this.kingdoms.push(new Kingdom("Seaside Kingdom", 10, 0));
        this.kingdoms.push(new Kingdom("Luncheon Kingdom", 18, 0));
        this.kingdoms.push(new Kingdom("Ruined Kingdom", 3, 0));
        this.kingdoms.push(new Kingdom("Bowser's Kingdom", 8, 0));
        this.kingdoms.push(new Kingdom("Moon Kingdom", 1, 0));
        this.kingdoms.push(new Kingdom("Mushroom Kingdom", 1, 0));
        this.kingdoms.push(new Kingdom("Dark Side", 4, 250));
        this.kingdoms.push(new Kingdom("Darker Side", 3, 500));

        // link up the main game
        this.kingdoms[KingdomName.Cap].link_next(KingdomName.Cascade);
        this.kingdoms[KingdomName.Cascade].link_next(KingdomName.Sand);
        this.kingdoms[KingdomName.Cascade].add_prerequisite(KingdomName.Cap);
        this.kingdoms[KingdomName.Sand].link_next(KingdomName.Lake);
        this.kingdoms[KingdomName.Sand].link_next(KingdomName.Wooded);
        this.kingdoms[KingdomName.Sand].add_prerequisite(KingdomName.Cascade);
        this.kingdoms[KingdomName.Lake].link_next(KingdomName.Cloud);
        this.kingdoms[KingdomName.Lake].add_prerequisite(KingdomName.Sand);
        this.kingdoms[KingdomName.Wooded].link_next(KingdomName.Cloud);
        this.kingdoms[KingdomName.Wooded].add_prerequisite(KingdomName.Sand);
        this.kingdoms[KingdomName.Cloud].link_next(KingdomName.Lost);
        this.kingdoms[KingdomName.Cloud].add_prerequisite(KingdomName.Lake);
        this.kingdoms[KingdomName.Cloud].add_prerequisite(KingdomName.Wooded);
        this.kingdoms[KingdomName.Lost].link_next(KingdomName.Metro);
        this.kingdoms[KingdomName.Lost].add_prerequisite(KingdomName.Cloud);
        this.kingdoms[KingdomName.Metro].link_next(KingdomName.Snow);
        this.kingdoms[KingdomName.Metro].link_next(KingdomName.Seaside);
        this.kingdoms[KingdomName.Metro].add_prerequisite(KingdomName.Lost);
        this.kingdoms[KingdomName.Snow].link_next(KingdomName.Luncheon);
        this.kingdoms[KingdomName.Snow].add_prerequisite(KingdomName.Metro);
        this.kingdoms[KingdomName.Seaside].link_next(KingdomName.Luncheon);
        this.kingdoms[KingdomName.Seaside].add_prerequisite(KingdomName.Metro);
        this.kingdoms[KingdomName.Luncheon].link_next(KingdomName.Ruined);
        this.kingdoms[KingdomName.Luncheon].add_prerequisite(KingdomName.Snow);
        this.kingdoms[KingdomName.Luncheon].add_prerequisite(KingdomName.Seaside);
        this.kingdoms[KingdomName.Ruined].link_next(KingdomName.Bowser);
        this.kingdoms[KingdomName.Ruined].add_prerequisite(KingdomName.Metro);
        this.kingdoms[KingdomName.Bowser].link_next(KingdomName.Moon);
        this.kingdoms[KingdomName.Bowser].add_prerequisite(KingdomName.Ruined);
        this.kingdoms[KingdomName.Moon].link_next(KingdomName.Mushroom);
        this.kingdoms[KingdomName.Moon].add_prerequisite(KingdomName.Bowser);
        this.kingdoms[KingdomName.Mushroom].add_prerequisite(KingdomName.Moon);
    }
}
