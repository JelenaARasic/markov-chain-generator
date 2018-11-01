import * as React from 'react';
import logo from './logo.svg';
import './App.css';
import {connect} from "react-redux";
import {ApplicationState} from "./reducers";
import {AnyAction, bindActionCreators, Dispatch} from "redux";
import {fetchAllJokes} from "./reducers/generator/actions";
import MarkovChainGenerator from "./utils/MarkovChainGenerator";
import {Joke} from "./utils/MarkovChainGenerator";

interface Props {
    fetchAllJokes: () => void;
    jokes: Joke[],
    isFetching: boolean;
}

interface State {
}

class App extends React.Component<Props, State> {
    generator: any;

    state = {
        joke: ""
    };

    componentWillMount () {
        this.fetchJokes();
    }

    fetchJokes = async () => {
        await this.props.fetchAllJokes();
        this.generator = new MarkovChainGenerator(this.props.jokes);
        for (let i = 0;  i < 3; i++) {
            console.log(this.generator.generateJoke());
        }
    };

    generateJoke = () => {
        const joke = this.generator.generateJoke();
        this.setState({joke});
    };

    render() {
        const {isFetching} = this.props;
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <p>
                        Edit <code>src/App.js</code> and save to reload.
                    </p>
                    <div> Joke: {this.state.joke} </div>
                    <button className="button" disabled={isFetching} onClick={this.generateJoke}>Generate Joke </button>
                </header>
            </div>
        );
    }
}

const mapStateToProps = ({generator}: ApplicationState) => ({
    jokes: generator.fetchedJokes,
    isFetching: generator.isLoading,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
    bindActionCreators({
        fetchAllJokes,
    }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(App);
