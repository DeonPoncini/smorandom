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
    options: GenerateOptions,
    validated: boolean
};

class Input extends React.Component<InputProps, InputState> {

    constructor(props: InputProps) {
        super(props);
        let s: [number, number] = seed.createSeed(RunType.Unset);
        this.state = {
            seed: s,
            options: new GenerateOptions(),
            validated: false
        };
    }

    checkForm(): boolean {
        return this.checkSeed() && this.checkRun();
    }

    checkSeed(): boolean {
        if (isNaN(this.state.seed[0])) {
            return false;
        }
        if (this.state.seed[0] === 0) {
            return false;
        }
        return true;
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
            this.setState({validated: false});
        } else {
            this.setState({validated: true});
            // generate the output
            let output = generate.generate(this.state.seed[1], this.state.options);
            console.log(output);
            this.props.executeFn(true, output, seed.seedToString(this.state.seed));
            // move to actually running
        }
    }

    handleSeedChange(event: ChangeEvent<HTMLInputElement>): void {
        let s: [number, number] = seed.seedFromString(event.currentTarget.value);
        this.setState({seed: s});
    }

    handleRunType(event: React.MouseEvent<HTMLInputElement>): void {
        let id: string = event.currentTarget.id;
        let rt: RunType = RunType.Unset;
        if (id === "runtypeany") {
            rt = RunType.Any;
        } else if (id === "runtypedark") {
            rt = RunType.Dark;
        } else if (id === "runtypedarker") {
            rt = RunType.Darker;
        } else if (id === "runtypeall") {
            rt = RunType.All;
        }
        let s:number = seed.updateRunType(rt, this.state.seed[0]);
        let options = this.state.options;
        options.runtype = rt;
        this.setState({seed: [s, this.state.seed[1]], options: options});
    }

    handleWorldPeace(event: React.MouseEvent<HTMLInputElement>): void {
        let checked: boolean = event.currentTarget.checked;
        let options = this.state.options;
        options.worldpeace = checked;
        let s:number = seed.updateWorldPeace(checked, this.state.seed[0]);
        this.setState({seed: [s, this.state.seed[1]], options: options});
    }

    render() {
        return(
            <div className="bgimage">
                <Jumbotron>
                <div><h2>Randomizer</h2></div>
                <Form.Group controlId="seed">
                    <Form.Control
                            required
                            type="text"
                            value={seed.seedToString(this.state.seed)}
                            onChange={this.handleSeedChange.bind(this)}
                            placeholder="Seed"
                            isValid={this.checkSeed()}>
                    </Form.Control>
                </Form.Group>
                <Form.Group controlId="run">
                    <Form.Check inline type="radio" label="Any %"
                        name="runtype" id="runtypeany"
                        onClick={this.handleRunType.bind(this)}/>
                    <Form.Check inline type="radio" label="Dark Side"
                        name="runtype" id="runtypedark"
                        onClick={this.handleRunType.bind(this)}/>
                    <Form.Check inline type="radio" label="Darker Side"
                        name="runtype" id="runtypedarker"
                        onClick={this.handleRunType.bind(this)}/>
                    <Form.Check inline type="radio" label="All Moons"
                        name="runtype" id="runtypeall"
                        onClick={this.handleRunType.bind(this)}/>
                </Form.Group>
                <Form.Group>
                    <Form.Check inline type="switch" label="World Peace"
                        name="worldpeace" id="worldpeace"
                        onChange={this.handleWorldPeace.bind(this)}/>
                </Form.Group>
                <Button variant="primary" onClick={this.handleSubmit.bind(this)}>
                    Generate
                </Button>
                </Jumbotron>
            </div>
        );
    }
}

export default Input;
