import React from 'react';
import {Carousel} from 'react-bootstrap';
import {Output} from './state';
import 'bootstrap/dist/css/bootstrap.min.css';

type ViewerProps = {
    output: Output
}
type ViewerState = {
}

class Viewer extends React.Component<ViewerProps, ViewerState> {

    constructor(props: ViewerProps) {
        super(props);
        this.state = {
        };
    }

    render() {
        return(
            <Carousel>
                {this.props.output.kingdoms.map((kingdom) => (
                    <Carousel.Item key={kingdom[0]}>
                       {kingdom[0]}<br />
                        <ul>
                           {kingdom[1].map((moon) => (
                               <li>{moon[0]}{moon[1] === 3 && 3}
                               </li>
                           ))}
                       </ul>
                    </Carousel.Item>
                ))}
            </Carousel>
        );
    }

}

export default Viewer;
