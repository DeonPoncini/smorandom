import React from 'react';
import Input from './Input';
import Viewer from './Viewer';
import {Output} from './state';

type AppProps = {};
type AppState = {
    executed: boolean,
    output: Output
};

class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.state = {
            executed: false,
            output: new Output()
        };
    }

    onExecute(execute: boolean, output: Output): void {
        this.setState({executed: execute, output: output});
    }


    render() {
        if (!this.state.executed) {
            return(
                <Input executeFn={this.onExecute.bind(this)} />);
        } else {
            return(
                <Viewer output={this.state.output} />
            );
        }
    }
}

export default App;
