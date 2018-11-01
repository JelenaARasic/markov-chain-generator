import * as types from "./types";
import {Dispatch} from "redux";

export interface FetchAllJokes {}
export const fetchAllJokes = (): FetchAllJokes => async (dispatch: Dispatch) => {
    dispatch({ type: types.FETCH_ALL_JOKES });
    try {
        const fetchedJokes = await []; // fetching goes here;
        dispatch({ type: types.FETCH_ALL_JOKES_SUCCESS, payload: {fetchedJokes}})
    } catch (error) {
        dispatch({ type: types.FETCH_ALL_JOKES_FAILED, payload: {error}});
        throw error;
    }
};


export type GeneratorActions = FetchAllJokes;




