import React from 'react';
import {Button, Container, Row, Col} from 'react-bootstrap';
import {Output} from './state';
import MoonView from './MoonView';
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
}
type ViewerState = {
    current_index: number;
    checks: Map<string, boolean>;
}

class Viewer extends React.Component<ViewerProps, ViewerState> {

    constructor(props: ViewerProps) {
        super(props);
        this.state = {
            current_index: 0,
            checks: new Map()
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

    onCheck(name: string, check: boolean): void {
        let checks = this.state.checks;
        checks.set(name, check);
        this.setState({checks: checks});
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
                <div className="entry" style={location}>
               <MoonView name={moons[x][0]} count={moons[x][1]}
                    checked={c} checkFn={this.onCheck.bind(this)}/>
                </div>
            );
            row++;
            if (row === rows) {
                col++;
                row = 1;
            }
        }
        return(
            <div className="slide" style={bgimage}>
                <Container>
                    <Row>
                    <Col sm={2}>
                        <Button type="primary" disabled={prev_disabled}
                            onClick={this.previous.bind(this)}>
                            Previous
                        </Button>
                    </Col>
                    <Col>
                        <div className="heading">
                        <h1>
                            {this.props.output.kingdoms[
                                this.state.current_index][0]}
                        </h1>
                        </div>
                    </Col>
                    <Col sm={2}>
                        <Button type="primary" disabled={next_disabled}
                            onClick={this.next.bind(this)}>
                            Next
                        </Button>
                    </Col>
                    </Row>
                </Container>
                <div className="contents">
                    {checks}
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
