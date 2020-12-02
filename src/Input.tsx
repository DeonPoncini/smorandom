import React, { ChangeEvent } from 'react';
import './Input.css';
import {Button, Jumbotron, Form, Tab, Tabs} from 'react-bootstrap';
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

    constructor() {
        this.runtype = RunType.Unset;
        this.worldpeace = false;
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
            valid_runtype: false
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
        this.setState({seed: s, seed_string: seed_string, valid_seed: valid});
    }

    updateCheck(rt: RunType): void {
        let options = this.state.options;
        options.runtype = rt;
        let s:number = seed.updateRunType(rt, this.state.seed[0]);
        let st: string = seed.seedToString([s, this.state.seed[1]]);
        let valid = seed.validate([s, this.state.seed[1]]);
        this.setState({seed: [s, this.state.seed[1]], seed_string: st,
            options: options, valid_seed: valid});
    }

    handleAny(event: React.MouseEvent<HTMLInputElement>): void {
        let checked: boolean = event.currentTarget.checked;
        if (checked) {
            this.updateCheck(RunType.Any);
        }
    }

    handleDark(event: React.MouseEvent<HTMLInputElement>): void {
        let checked: boolean = event.currentTarget.checked;
        if (checked) {
            this.updateCheck(RunType.Dark);
        }
    }

    handleDarker(event: React.MouseEvent<HTMLInputElement>): void {
        let checked: boolean = event.currentTarget.checked;
        if (checked) {
            this.updateCheck(RunType.Darker);
        }
    }

    handleAll(event: React.MouseEvent<HTMLInputElement>): void {
        let checked: boolean = event.currentTarget.checked;
        if (checked) {
            this.updateCheck(RunType.All);
        }
    }

    handleWorldPeace(event: React.MouseEvent<HTMLInputElement>): void {
        let checked: boolean = event.currentTarget.checked;
        let options = this.state.options;
        options.worldpeace = checked;
        let s:number = seed.updateWorldPeace(checked, this.state.seed[0]);
        let st: string = seed.seedToString([s, this.state.seed[1]]);
        this.setState({seed: [s, this.state.seed[1]], seed_string: st,
            options: options});
    }

    render() {
        let rt = seed.runtype(this.state.seed[0]);
        let rttext = (<div>Run is unset</div>);
        switch (rt) {
            case 1: rttext = (<div>Any%</div>); break;
            case 2: rttext = (<div>Dark Side</div>); break;
            case 3: rttext = (<div>Darker Side</div>); break;
            case 4: rttext = (<div>All Moons</div>); break;
            default: break;
        }
        let wp = seed.worldpeace(this.state.seed[0]);
        let wptext = (<div>World peace disabled</div>);
        if (wp) {
            wptext = (<div>World peace enabled</div>);
        }
        return(
            <div className="bgimage">
                <Jumbotron>
                <div><h2>Randomizer</h2></div>
                <Tabs id="mainpage" >
                <Tab eventKey="generatenew"
                     title="Generate a new seed">
                <div><h3>{this.state.seed_string}</h3></div>
                <Form.Group controlId="run">
                    <Form.Check inline type="radio" label="Any %"
                        name="runtype" id="runtypeany"
                        onChange={this.handleAny.bind(this)}/>
                    <Form.Check inline type="radio" label="Dark Side"
                        name="runtype" id="runtypedark"
                        onChange={this.handleDark.bind(this)}/>
                    <Form.Check inline type="radio" label="Darker Side"
                        name="runtype" id="runtypedarker"
                        onChange={this.handleDarker.bind(this)}/>
                    <Form.Check inline type="radio" label="All Moons"
                        name="runtype" id="runtypeall"
                        onChange={this.handleAll.bind(this)}/>
                </Form.Group>
                <Form.Group>
                    <Form.Check inline type="switch" label="World Peace"
                        name="worldpeace" id="worldpeace"
                        onChange={this.handleWorldPeace.bind(this)}/>
                </Form.Group>
                </Tab>
                <Tab eventKey="enterseed"
                     title="Enter an existing seed">
                    <Form.Control
                            type="text"
                            value={this.state.seed_string}
                            onChange={this.handleSeedChange.bind(this)}
                            placeholder="Seed"
                            isValid={seed.validate(this.state.seed)}>
                    </Form.Control>
                    {!this.state.valid_seed && <div>Seed is invalid</div>}
                    {this.state.valid_seed && <div>{rttext}</div>}
                    {this.state.valid_seed && <div>{wptext}</div>}
                </Tab>
                </Tabs>
                <Button variant="primary" disabled={!this.state.valid_seed}
                    onClick={this.handleSubmit.bind(this)}>
                    Generate
                </Button>
                </Jumbotron>
            </div>
        );
    }
}

export default Input;
