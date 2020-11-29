import React from 'react';
import {Carousel, Jumbotron} from 'react-bootstrap';
import {Output} from './state';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Viewer.css';

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
            <div className="slide">
            <Carousel wrap={false}>
                {this.props.output.kingdoms.map((kingdom) => (
                    <Carousel.Item key={kingdom[0]} interval={undefined}>
                    <div className="contents">
                        <Jumbotron>
                           <h1>{kingdom[0]}</h1>
                        </Jumbotron>
                        <div className="list">
                            <div>
                               {kingdom[1].map((moon) => (
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
                    </Carousel.Item>
                ))}
            </Carousel>
            </div>
        );
    }

}

export default Viewer;
