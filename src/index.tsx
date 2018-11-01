import * as React from "react";
import './index.css';
import App from './App';
import {render} from "react-dom";
import * as serviceWorker from './serviceWorker';
import {createStore, applyMiddleware} from "redux";
import thunk from "redux-thunk";
import {Provider} from "react-redux"
import reducers from "./reducers";
import axios from "axios";

axios.defaults.headers.common["Accept"] = "application/json";

const rootEl = document.getElementById("root");
const store = createStore(reducers, applyMiddleware(thunk));

const AppWrapper = () => {
    return (
        <Provider store={store}>
            <App/>
        </Provider>
    );
};


render(<AppWrapper/>, rootEl);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
