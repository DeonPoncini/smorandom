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

type InputProps = {
    executeFn: (execute: boolean, output: Output, seed: number) => void;
};
type InputState = {
    seedText: string,
    seed: number,
    runtype: RunType,
    validated: boolean
};

class Input extends React.Component<InputProps, InputState> {

    constructor(props: InputProps) {
        super(props);
        let s: number = seed.createSeed(RunType.Unset);
        let st: string = s.toString(16);
        this.state = {
            seedText: st,
            seed: s,
            runtype: RunType.Unset,
            validated: false
        };
    }

    checkForm(): boolean {
        return this.checkSeed() && this.checkRun();
    }

    checkSeed(): boolean {
        if (isNaN(this.state.seed)) {
            return false;
        }
        if (this.state.seed === 0) {
            return false;
        }
        return true;
    }

    checkRun(): boolean {
        if (this.state.runtype === RunType.Unset) {
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
            let output = generate.generate(this.state.seed);
            console.log(output);
            this.props.executeFn(true, output, this.state.seed);
            // move to actually running
        }
    }

    handleSeedChange(event: ChangeEvent<HTMLInputElement>): void {
        let s: number = parseInt(event.currentTarget.value, 16);
        let st: string = event.currentTarget.value;
        this.setState({seed: s, seedText: st});
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
        let s:number = seed.updateRunType(rt, this.state.seed);
        let st: string = s.toString(16);
        this.setState({seed: s, seedText: st, runtype: rt});
    }

    render() {
        return(
            <div className="bgimage">
                <Jumbotron>
                <Form noValidate validated={this.state.validated}>
                <Form.Group controlId="seed">
                    <Form.Control
                            required
                            type="text"
                            value={this.state.seedText}
                            onChange={this.handleSeedChange.bind(this)}
                            placeholder="Seed"
                            isValid={this.checkSeed()}>
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                        Invalid seed
                    </Form.Control.Feedback>
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
                <Button variant="primary" onClick={this.handleSubmit.bind(this)}>
                    Generate
                </Button>
                </Form>
                </Jumbotron>
            </div>
        );
    }
}

export default Input;
