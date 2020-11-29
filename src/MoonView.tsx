import React from 'react';
import {Form} from 'react-bootstrap';

type MoonViewProps = {
    name: string,
    count: number,
    checked: boolean,
    checkFn: (name: string, check: boolean) => void;
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
        this.props.checkFn(this.props.name, checked);
    }

    render() {
        return(
            <div>
                <Form>
                <Form.Group controlId={this.props.name}>
                <Form.Check id={this.props.name} type="switch"
                    label={this.props.name} checked={this.props.checked}
                    onChange={this.handleCheck.bind(this)}/>
                </Form.Group>
                </Form>
            </div>
        );
    }
}

export default MoonView;
