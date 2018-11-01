import {AnyAction, combineReducers, Reducer} from "redux";

import generatorReducer, {GeneratorState} from "./generator/index";
import {GeneratorActions} from "./generator/actions";

export interface ApplicationActions {
    GeneratorActions: GeneratorActions;
}

export interface ApplicationState {
    generator: GeneratorState;
}

const reducers: Reducer<ApplicationState, AnyAction> = combineReducers({
  generator: generatorReducer,
});


export default reducers;