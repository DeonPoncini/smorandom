import React from 'react';
import {Button, Container, Row, Col, Jumbotron} from 'react-bootstrap';
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
}
type ViewerState = {
    current_index: number;
}

class Viewer extends React.Component<ViewerProps, ViewerState> {

    constructor(props: ViewerProps) {
        super(props);
        this.state = {
            current_index: 0
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
                        <Jumbotron>
                        <h1>
                            {this.props.output.kingdoms[
                                this.state.current_index][0]}
                        </h1>
                        </Jumbotron>
                    </Col>
                    <Col sm={2}>
                        <Button type="primary" disabled={next_disabled}
                            onClick={this.next.bind(this)}>
                            Next
                        </Button>
                    </Col>
                    </Row>
                    <Row>
                    <div className="contents">
                        <div>
                           {this.props.output.kingdoms[
                               this.state.current_index][1]
                                   .map((moon) => (
                               <div>
                               <div className="entry">
                                   {moon[0]}
                               </div>
                               <br />
                               </div>
                           ))}
                        </div>
                    </div>
                    </Row>
                </Container>
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
