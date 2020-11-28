import React from 'react';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, Jumbotron, Form} from 'react-bootstrap';

type AppProps = {};
type AppState = {
};

class App extends React.Component<AppProps, AppState> {

    constructor(props: AppProps) {
        super(props);
        this.state = {
        };
    }

    render() {
        return(
            <div className="bgimage">
                <Jumbotron>
                <Form>
                <Form.Group controlId="seed">
                    <Form.Control type="text" placeholder="Seed" />
                </Form.Group>
                <Form.Group controlId="run">
                    <Form.Check inline type="radio" label="Any %"
                        name="runtype" id="runtypeany" />
                    <Form.Check inline type="radio" label="Dark Side"
                        name="runtype" id="runtypedark" />
                    <Form.Check inline type="radio" label="Darker Side"
                        name="runtype" id="runtypedarker" />
                    <Form.Check inline type="radio" label="All Moons"
                        name="runtype" id="runtypeall" />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Generate
                </Button>
                </Form>
                </Jumbotron>
            </div>
        );
    }
}

export default App;
