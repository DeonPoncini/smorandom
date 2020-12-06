import React, { ChangeEvent } from 'react';
import './Input.css';
import {Button, Jumbotron, Form} from 'react-bootstrap';
import * as seed from './seed';
import * as generate from './generate';
import {Output} from './state';

export enum RunType {
    Unset,
    Any,
    Dark,
    Darker,
    All
}

export class GenerateOptions {
    runtype: RunType;
    worldpeace: boolean;
    mkany: boolean;
    backtrack: boolean;
    ipclip: boolean;
    lakeclip: boolean;
    snowclip: boolean;
    snowdram: boolean;

    constructor() {
        this.runtype = RunType.Unset;
        this.worldpeace = false;
        this.mkany = false;
        this.backtrack = false;
        this.ipclip = false;
        this.lakeclip = false;
        this.snowclip = false;
        this.snowdram = false;
    }
}

class Checks {
    anyp: boolean;
    dark: boolean;
    darker: boolean;
    allm: boolean;
    wp: boolean;
    mkany: boolean;
    backtrack: boolean;
    ipclip: boolean;
    lakeclip: boolean;
    snowclip: boolean;
    snowdram: boolean;

    constructor() {
        this.anyp = false;
        this.dark = false;
        this.darker = false;
        this.allm = false;
        this.wp = false;
        this.mkany = false;
        this.backtrack = false;
        this.ipclip = false;
        this.lakeclip = false;
        this.snowclip = false;
        this.snowdram = false;
    }
}

type InputProps = {
    executeFn: (execute: boolean, output: Output, seed: string) => void;
};
type InputState = {
    seed: [number,  number],
    seed_string: string,
    options: GenerateOptions,
    valid_seed: boolean,
    valid_runtype: boolean
    checks: Checks,
};

class Input extends React.Component<InputProps, InputState> {

    constructor(props: InputProps) {
        super(props);
        let s: [number, number] = seed.createSeed(RunType.Unset);
        let ss: string = seed.seedToString(s);
        this.state = {
            seed: s,
            seed_string: ss,
            options: new GenerateOptions(),
            valid_seed: false,
            valid_runtype: false,
            checks: new Checks()
        };
    }

    checkForm(): boolean {
        return seed.validate(this.state.seed) && this.checkRun();
    }

    checkRun(): boolean {
        if (this.state.options.runtype === RunType.Unset) {
            return false;
        }
        return true;
    }

    handleSubmit(event: React.MouseEvent<HTMLFormElement>) {
        if (this.checkForm() === false) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            // generate the output
            let output = generate.generate(this.state.seed[1], this.state.options);
            this.props.executeFn(true, output, seed.seedToString(this.state.seed));
            // move to actually running
        }
    }

    handleSeedChange(event: ChangeEvent<HTMLInputElement>): void {
        let seed_string = event.currentTarget.value;
        let s: [number, number] = seed.seedFromString(seed_string);
        // check the seed is valid
        let valid = seed.validate(s);
        // setup the checks appropriately
        let checks = this.state.checks;
        let rt = seed.runtype(s[0]);
        switch (rt) {
            case RunType.Unset:
                checks.anyp = false;
                checks.dark = false;
                checks.darker = false;
                checks.allm = false;
            break;
            case RunType.Any:
                checks.anyp = true;
                checks.dark = false;
                checks.darker = false;
                checks.allm = false;
            break;
            case RunType.Dark:
                checks.anyp = false;
                checks.dark = true;
                checks.darker = false;
                checks.allm = false;
            break;
            case RunType.Darker:
                checks.anyp = false;
                checks.dark = false;
                checks.darker = true;
                checks.allm = false;
            break;
            case RunType.All:
                checks.anyp = false;
                checks.dark = false;
                checks.darker = false;
                checks.allm = true;
            break;
        }
        checks.wp = seed.worldpeace(s[0]);
        let options = this.state.options;
        options.runtype = rt;
        this.setState({seed: s, seed_string: seed_string, valid_seed: valid,
            checks: checks, options: options});
    }

    updateCheck(rt: RunType, checks: Checks): void {
        let options = this.state.options;
        options.runtype = rt;
        let s:number = seed.updateRunType(rt, this.state.seed[0]);
        let st: string = seed.seedToString([s, this.state.seed[1]]);
        let valid = seed.validate([s, this.state.seed[1]]);
        this.setState({seed: [s, this.state.seed[1]], seed_string: st,
            options: options, valid_seed: valid, checks: checks});
    }

    handleAny(event: React.MouseEvent<HTMLInputElement>): void {
        let checked: boolean = event.currentTarget.checked;
        if (checked) {
            let checks = this.state.checks;
            checks.anyp = true;
            checks.dark = false;
            checks.darker = false;
            checks.allm = false;
            this.updateCheck(RunType.Any, checks);
        }
    }

    handleDark(event: React.MouseEvent<HTMLInputElement>): void {
        let checked: boolean = event.currentTarget.checked;
        if (checked) {
            let checks = this.state.checks;
            checks.anyp = false;
            checks.dark = true;
            checks.darker = false;
            checks.allm = false;
            this.updateCheck(RunType.Dark, checks);
        }
    }

    handleDarker(event: React.MouseEvent<HTMLInputElement>): void {
        let checked: boolean = event.currentTarget.checked;
        if (checked) {
            let checks = this.state.checks;
            checks.anyp = false;
            checks.dark = false;
            checks.darker = true;
            checks.allm = false;
            this.updateCheck(RunType.Darker, checks);
        }
    }

    handleAll(event: React.MouseEvent<HTMLInputElement>): void {
        let checked: boolean = event.currentTarget.checked;
        if (checked) {
            let checks = this.state.checks;
            checks.anyp = false;
            checks.dark = false;
            checks.darker = false;
            checks.allm = true;
            this.updateCheck(RunType.All, checks);
        }
    }

    handleWorldPeace(event: React.MouseEvent<HTMLInputElement>): void {
        let checked: boolean = event.currentTarget.checked;
        let options = this.state.options;
        options.worldpeace = checked;
        let s:number = seed.updateWorldPeace(checked, this.state.seed[0]);
        let st: string = seed.seedToString([s, this.state.seed[1]]);
        let checks = this.state.checks;
        checks.wp = checked;
        this.setState({seed: [s, this.state.seed[1]], seed_string: st,
            options: options, checks: checks});
    }

    handleMkAny(event: React.MouseEvent<HTMLInputElement>): void {
        let checked: boolean = event.currentTarget.checked;
        let options = this.state.options;
        options.mkany = checked;
        let checks = this.state.checks;
        checks.mkany = checked;
        let s:number = seed.updateMkAny(checked, this.state.seed[0]);
        let st: string = seed.seedToString([s, this.state.seed[1]]);
        this.setState({seed: [s, this.state.seed[1]], seed_string: st,
            options: options, checks: checks});
    }

    handleBacktrack(event: React.MouseEvent<HTMLInputElement>): void {
        let checked: boolean = event.currentTarget.checked;
        let options = this.state.options;
        options.backtrack = checked;
        let checks = this.state.checks;
        checks.backtrack = checked;
        let s:number = seed.updateBacktrack(checked, this.state.seed[0]);
        let st: string = seed.seedToString([s, this.state.seed[1]]);
        this.setState({seed: [s, this.state.seed[1]], seed_string: st,
            options: options, checks: checks});
    }

    handleIpClip(event: React.MouseEvent<HTMLInputElement>): void {
        let checked: boolean = event.currentTarget.checked;
        let options = this.state.options;
        options.ipclip = checked;
        let checks = this.state.checks;
        checks.ipclip = checked;
        let s:number = seed.updateIpClip(checked, this.state.seed[0]);
        let st: string = seed.seedToString([s, this.state.seed[1]]);
        this.setState({seed: [s, this.state.seed[1]], seed_string: st,
            options: options, checks: checks});
    }

    handleLakeClip(event: React.MouseEvent<HTMLInputElement>): void {
        let checked: boolean = event.currentTarget.checked;
        let options = this.state.options;
        options.lakeclip = checked;
        let checks = this.state.checks;
        checks.lakeclip = checked;
        let s:number = seed.updateLakeClip(checked, this.state.seed[0]);
        let st: string = seed.seedToString([s, this.state.seed[1]]);
        this.setState({seed: [s, this.state.seed[1]], seed_string: st,
            options: options, checks: checks});
    }

    handleSnowClip(event: React.MouseEvent<HTMLInputElement>): void {
        let checked: boolean = event.currentTarget.checked;
        let options = this.state.options;
        options.snowclip = checked;
        let checks = this.state.checks;
        checks.snowclip = checked;
        let s:number = seed.updateSnowClip(checked, this.state.seed[0]);
        let st: string = seed.seedToString([s, this.state.seed[1]]);
        this.setState({seed: [s, this.state.seed[1]], seed_string: st,
            options: options, checks: checks});
    }

    handleSnowDram(event: React.MouseEvent<HTMLInputElement>): void {
        let checked: boolean = event.currentTarget.checked;
        let options = this.state.options;
        options.snowdram = checked;
        let checks = this.state.checks;
        checks.snowdram = checked;
        let s:number = seed.updateSnowDram(checked, this.state.seed[0]);
        let st: string = seed.seedToString([s, this.state.seed[1]]);
        this.setState({seed: [s, this.state.seed[1]], seed_string: st,
            options: options, checks: checks});
    }

    newSeed(): void {
        let s: number = seed.generateSeed();
        let st: string = seed.seedToString([this.state.seed[0], s]);
        this.setState({seed: [this.state.seed[0], s], seed_string: st});
    }

    render() {
        return(
            <div className="bgimage">
                <Jumbotron>
                <div><h2>Randomizer</h2></div>
                <Form.Control
                        type="text"
                        value={this.state.seed_string}
                        onChange={this.handleSeedChange.bind(this)}
                        placeholder="Seed"
                        isValid={seed.validate(this.state.seed)}>
                </Form.Control>
                {!this.state.valid_seed && <div>Seed is invalid</div>}
                <Form.Group controlId="run">
                    <Form.Check inline type="radio" label="Any %"
                        name="runtype" id="runtypeany"
                        checked={this.state.checks.anyp}
                        onChange={this.handleAny.bind(this)}/>
                    <Form.Check inline type="radio" label="Dark Side"
                        name="runtype" id="runtypedark"
                        checked={this.state.checks.dark}
                        onChange={this.handleDark.bind(this)}/>
                    <Form.Check inline type="radio" label="Darker Side"
                        name="runtype" id="runtypedarker"
                        checked={this.state.checks.darker}
                        onChange={this.handleDarker.bind(this)}/>
                    <Form.Check inline type="radio" label="All Moons"
                        name="runtype" id="runtypeall"
                        checked={this.state.checks.allm}
                        onChange={this.handleAll.bind(this)}/>
                </Form.Group>
                <Form.Group>
                    <Form.Check inline type="switch" label="World Peace"
                        name="worldpeace" id="worldpeace"
                        checked={this.state.checks.wp}
                        onChange={this.handleWorldPeace.bind(this)}/>
                </Form.Group>
                <Form.Group>
                    <Form.Check inline type="switch" label="Moon Kingdom in Any%"
                        name="mkany" id="mkany"
                        checked={this.state.checks.mkany}
                        onChange={this.handleMkAny.bind(this)}/>
                </Form.Group>
                <Form.Group>
                    <Form.Check inline type="switch" label="Backtrack in pre-game"
                        name="backtrack" id="backtrack"
                        checked={this.state.checks.backtrack}
                        onChange={this.handleBacktrack.bind(this)}/>
                </Form.Group>
                <Form.Group>
                    <Form.Check inline type="switch" label="IP Clip"
                        name="ipclip" id="ipclip"
                        checked={this.state.checks.ipclip}
                        onChange={this.handleIpClip.bind(this)}/>
                </Form.Group>
                <Form.Group>
                    <Form.Check inline type="switch" label="Lake Clip"
                        name="lakeclip" id="lakeclip"
                        checked={this.state.checks.lakeclip}
                        onChange={this.handleLakeClip.bind(this)}/>
                </Form.Group>
                <Form.Group>
                    <Form.Check inline type="switch" label="Snow Clip"
                        name="snowclip" id="snowclip"
                        checked={this.state.checks.snowclip}
                        onChange={this.handleSnowClip.bind(this)}/>
                </Form.Group>
                <Form.Group>
                    <Form.Check inline type="switch" label="Snow Dram"
                        name="snowdram" id="snowdram"
                        checked={this.state.checks.snowdram}
                        onChange={this.handleSnowDram.bind(this)}/>
                </Form.Group>
                <Button variant="primary" disabled={!this.state.valid_seed}
                    onClick={this.handleSubmit.bind(this)}>
                    Generate
                </Button>
                <div className="spacer" />
                <Button variant="primary" onClick={this.newSeed.bind(this)}>
                    New Seed
                </Button>
                </Jumbotron>
            </div>
        );
    }
}

export default Input;
