import * as Types from "./types";

export type GeneratorState = {
    isLoading: boolean;
    fetched: boolean;
    fetchedJokes: any[];
};

export const initialState: GeneratorState = {
    isLoading: false,
    fetched: false,
    fetchedJokes: []
};

interface Action {
  type: string;
  payload: any;
}


export default (state = initialState, action: Action) => {
    const {type, payload} = action;

    switch (type) {
        case Types.FETCH_ALL_JOKES:
            return {
                ...state,
                isLoading: true,
                fetched: false,
                fetchedJokes: []
            };
        case Types.FETCH_ALL_JOKES_SUCCESS:
            return {
                ...state,
                isLoading: false,
                fetched: true,
                fetchedJokes: [
                    ...state.fetchedJokes,
                    payload
                ]
            };
        case Types.FETCH_ALL_JOKES_FAILED:
            return {
                ...state,
                isLoading: false,
                fetched: true,
                fetchedJokes: []
            };
    }

    return state;
};