import * as React from 'react';
import logo from '../../logo.svg';
import {connect} from "react-redux";
import {ApplicationState} from "../../reducers/index";
import {AnyAction, bindActionCreators, Dispatch} from "redux";
import {fetchAllJokes} from "../../reducers/generator/actions";
import MarkovChainGenerator from "../../utils/MarkovChainGenerator";
import {Joke} from "../../utils/MarkovChainGenerator";
import Button from "../Button/Button";
import styles from './App.module.css';

interface Props {
    fetchAllJokes: () => void;
    jokes: Joke[],
    isFetching: boolean;
}

interface State {
    joke: string,
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
        this.setState({
           joke: "Fetching Jokes from API, please wait..."
        });
        await this.props.fetchAllJokes();
        this.setState({
            joke: "Click 'Generate Joke' Button to generate new Joke"
        });
        this.generator = new MarkovChainGenerator(this.props.jokes);
    };

    generateJoke = () => {
        const joke = this.generator.generateJoke();
        this.setState({joke: "Joke: " + joke});
    };

    render() {
        const {isFetching} = this.props;
        return (
            <div className={styles.App}>
                <header className={styles["App-header"]}>
                    <img src={logo} className={styles["App-logo"]} alt="logo"/>
                    <div className={styles.joke}> {this.state.joke} </div>
                    {isFetching && <div className={styles.loader} />}
                    <Button onClick={this.generateJoke} title={"Generate Joke"} disabled={isFetching} />
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
