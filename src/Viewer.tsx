import React from 'react';
import {Button, Container, Row, Col, Jumbotron} from 'react-bootstrap';
import {Output} from './state';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Viewer.css';

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
            backgroundImage: 'url("images/smohero.jpg")'
        };
        return(
            <div className="slide">
            <div style={bgimage}>
                <Container>
                    <Row>
                    <Col>
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
                    <Col>
                        <Button type="primary" disabled={next_disabled}
                            onClick={this.next.bind(this)}>
                            Next
                        </Button>
                    </Col>
                    </Row>
                    <Row>
                    <div className="contents">
                        <div className="list">
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
                        </div>
                    </Row>
                </Container>
            </div>
            </div>
        );
    }

}

export default Viewer;
