import React from 'react';
import Input from './Input';
import Viewer from './Viewer';
import {Output} from './state';

type AppProps = {};
type AppState = {
    executed: boolean,
    output: Output,
    seed: number
};

class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.state = {
            executed: false,
            output: new Output(),
            seed: 0
        };
    }

    onExecute(execute: boolean, output: Output, seed: number): void {
        this.setState({executed: execute, output: output, seed: seed});
    }

    onExit(): void {
        this.setState({executed: false});
    }


    render() {
        if (!this.state.executed) {
            return(
                <Input executeFn={this.onExecute.bind(this)} />);
        } else {
            return(
                <Viewer output={this.state.output}
                    exitFn={this.onExit.bind(this)} seed={this.state.seed}/>
            );
        }
    }
}

export default App;
