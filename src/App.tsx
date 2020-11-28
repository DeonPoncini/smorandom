import React, { FormEvent, ChangeEvent } from 'react';
import Input from './Input';

type AppProps = {};
type AppState = {
    executed: boolean
};

class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.state = {
            executed: false
        };
    }

    onExecute(execute: boolean): void {
        this.setState({executed: execute});
    }


    render() {
        if (!this.state.executed) {
            return(
                <Input executeFn={this.onExecute.bind(this)} />);
        } else {
            return(<div>READY TO GO</div>);
        }
    }
}

export default App;
