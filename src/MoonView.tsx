import React from 'react';
import {Form} from 'react-bootstrap';

type MoonViewProps = {
    name: string,
    count: number,
    checked: boolean,
    index: number,
    checkFn: (name: string, check: boolean, index: number) => void;
}
type MoonViewState = {
}

class MoonView extends React.Component<MoonViewProps, MoonViewState> {
    constructor(props: MoonViewProps) {
        super(props);
        this.state = {
        };
    }

    handleCheck(event: React.MouseEvent<HTMLInputElement>): void {
        let checked: boolean = event.currentTarget.checked;
        this.props.checkFn(this.props.name, checked, this.props.index);
    }

    render() {
        return(
            <div>
                <Form.Check id={this.props.name} type="switch"
                    label={this.props.name} checked={this.props.checked}
                    onChange={this.handleCheck.bind(this)}/>
            </div>
        );
    }
}

export default MoonView;
