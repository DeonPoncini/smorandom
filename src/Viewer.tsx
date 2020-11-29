import React from 'react';
import {Button, Col, Container, Row} from 'react-bootstrap';
import MoonView from './MoonView';
import KeyHandler, {KEYPRESS} from 'react-key-handler';
import {Output} from './state';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Viewer.css';

import bowser from './images/bowser.jpg';
import cap from './images/cap.jpg';
import cascade from './images/cascade.jpg';
import cloud from './images/cloud.jpg';
import dark from './images/dark.png';
import darker from './images/darker.jpg';
import lake from './images/lake.jpg';
import lost from './images/lost.jpg';
import luncheon from './images/luncheon.jpg';
import metro from './images/metro.jpg';
import moon from './images/moon.jpg';
import mushroom from './images/mushroom.jpg';
import ruined from './images/ruined.jpg';
import sand from './images/sand.jpg';
import seaside from './images/seaside.jpg';
import smohero from './images/smohero.jpg';
import snow from './images/snow.png';
import wooded from './images/wooded.jpg';

type ViewerProps = {
    output: Output
    exitFn: () => void;
    seed: string;
}
type ViewerState = {
    current_index: number;
    checks: Map<string, boolean>;
    moon_check: Map<number, number>;
}

class Viewer extends React.Component<ViewerProps, ViewerState> {

    constructor(props: ViewerProps) {
        super(props);
        this.state = {
            current_index: 0,
            checks: new Map(),
            moon_check: new Map(),
        };
    }

    previous() {
        let index = this.state.current_index - 1;
        this.setState({current_index: index});
    }

    next() {
        let index = this.state.current_index + 1;
        this.setState({current_index: index});
    }

    exit() {
        this.props.exitFn();
    }

    onCheck(name: string, check: boolean, index: number): void {
        let checks = this.state.checks;
        checks.set(name, check);
        let moon_check = this.state.moon_check;
        // we are interacting, setup the moon check
        moon_check.set(this.state.current_index, index);
        this.setState({checks: checks, moon_check: moon_check});
    }

    onMarkNext() {
        let moon_check = this.state.moon_check;
        let index = moon_check.get(this.state.current_index);
        if (index === undefined) {
            index = 0;
        } else {
            // increment our index by 1
            index = index+1;
        }
        let moons = this.props.output.kingdoms[this.state.current_index][1];
        if (index >= moons.length) {
            return; // no more checks for this page
        }
        let name = moons[index][0];
        this.onCheck(name, true, index);
    }

    onNext() {
        if (this.state.current_index !== this.props.output.kingdoms.length-1) {
            this.next();
        }
    }

    onPrev() {
        if (this.state.current_index !== 0) {
            this.previous();
        }
    }

    render() {
        // check if previous is disabled
        let prev_disabled = false;
        if (this.state.current_index === 0) {
            prev_disabled = true;
        }
        // check if next is disabled
        let next_disabled = false;
        if (this.state.current_index === this.props.output.kingdoms.length-1) {
            next_disabled = true;
        }
        let bgimage = {
            backgroundImage: 'url(' +
                image_selector(this.props.output.kingdoms[
                    this.state.current_index][0]) +
            ')',
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover"
        };
        // allocate all the moons in a grid
        let moons = this.props.output.kingdoms[this.state.current_index][1];
        let checks = []
        let row = 1;
        let col = 1;
        let rows = 21;
        for (let x = 0; x < moons.length; x++) {
            let c = this.state.checks.get(moons[x][0]);
            if (c === undefined) {
                c = false;
            }
            let location = {
                gridRow: row,
                gridColumn: col,
            };
            checks.push(
                <div className="entry" style={location} key={x}>
               <MoonView name={moons[x][0]} count={moons[x][1]}
                    checked={c} index={x} checkFn={this.onCheck.bind(this)}/>
                </div>
            );
            row++;
            if (row === rows) {
                col++;
                row = 1;
            }
        }
        // construct the kingdom label
        let kingdom = this.props.output.kingdoms[this.state.current_index][0];
        let kingdom_count = 1;
        // how many other times have we seen this kingdom?
        for (let y = 0; y < this.state.current_index; y++) {
            let k = this.props.output.kingdoms[y][0];
            if (k === kingdom) {
                kingdom_count++;
            }
        }
        let kingdom_string = kingdom;
        if (kingdom_count > 1) {
            kingdom_string = kingdom + " " + kingdom_count.toString(10);
        }
        return(
            <div className="slide" style={bgimage}>
                <Container>
                    <Row>
                    <Col sm={3}>
                        <Button type="primary"
                            onClick={this.exit.bind(this)}>
                            Exit
                        </Button>
                    </Col>
                    <Col sm={1}>
                        <KeyHandler
                            keyEventName={KEYPRESS}
                            keyValue="a"
                            onKeyHandle={this.onPrev.bind(this)}>
                        </KeyHandler>
                        <Button type="primary" disabled={prev_disabled}
                            onClick={this.previous.bind(this)}>
                            Previous
                        </Button>
                    </Col>
                    <Col sm={4}>
                    </Col>
                    <Col sm={1}>
                        <KeyHandler
                            keyEventName={KEYPRESS}
                            keyValue="d"
                            onKeyHandle={this.onNext.bind(this)}>
                        </KeyHandler>
                        <Button type="primary" disabled={next_disabled}
                            onClick={this.next.bind(this)}>
                            Next
                        </Button>
                    </Col>
                    <Col sm={3}>
                        <h3 className="entry">#{this.props.seed}</h3>
                    </Col>
                    </Row>
                    <Row>
                        <Col>
                            <div className="heading">
                            <h1>
                                {kingdom_string}
                            </h1>
                            </div>
                        </Col>
                    </Row>
                </Container>
                <KeyHandler
                    keyEventName={KEYPRESS}
                    code="Space"
                    onKeyHandle={this.onMarkNext.bind(this)}>
                </KeyHandler>
                <div className="contents">
                    {checks}
                </div>
                <div className="footer">
                    Press SPACE to mark moon completed, A for previous kingdom, D for next kingdom
                </div>
            </div>
        );
    }

}

function image_selector(kingdom: string) {
    if (kingdom === "Bowser's Kingdom") { return bowser; }
    if (kingdom === "Cap Kingdom") { return cap; }
    if (kingdom === "Cascade Kingdom") { return cascade; }
    if (kingdom === "Cloud Kingdom") { return cloud; }
    if (kingdom === "Dark Side") { return dark; }
    if (kingdom === "Darker Side") { return darker; }
    if (kingdom === "Lake Kingdom") { return lake; }
    if (kingdom === "Lost Kingdom") { return lost; }
    if (kingdom === "Luncheon Kingdom") { return luncheon; }
    if (kingdom === "Metro Kingdom") { return metro; }
    if (kingdom === "Moon Kingdom") { return moon; }
    if (kingdom === "Mushroom Kingdom") { return mushroom; }
    if (kingdom === "Ruined Kingdom") { return ruined; }
    if (kingdom === "Sand Kingdom") { return sand; }
    if (kingdom === "Seaside Kingdom") { return seaside; }
    if (kingdom === "Snow Kingdom") { return snow; }
    if (kingdom === "Wooded Kingdom") { return wooded; }
    return smohero;
}

export default Viewer;
