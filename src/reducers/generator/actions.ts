import * as types from "./types";
import {Dispatch} from "redux";
import axios from "axios";
import storage from "../../utils/storage"

const STORED_JOKES = "STORED_JOKES";

export interface FetchAllJokes {
}

export const fetchAllJokes = (): FetchAllJokes => async (dispatch: Dispatch) => {
    dispatch({type: types.FETCH_ALL_JOKES});
    try {
        debugger;
        let response = storage.get(STORED_JOKES);
        let fetchedJokes = [];

        if (!response) {
            response = await axios.get('https://icanhazdadjoke.com/search');
            fetchedJokes = response.data.results;
            const totalPages = response.data.total_pages;

            for (let i = 2; i <= totalPages; i++) {
                response = await axios.get(`https://icanhazdadjoke.com/search?page=${i}`);
                fetchedJokes.push(...response.data.results);
            }
            storage.set(STORED_JOKES, fetchedJokes);
        } else {
            fetchedJokes = response;
        }
        dispatch({type: types.FETCH_ALL_JOKES_SUCCESS, payload: {fetchedJokes}})
    } catch (error) {
        dispatch({type: types.FETCH_ALL_JOKES_FAILED, payload: {error}});
        throw error;
    }
};


export type GeneratorActions = FetchAllJokes;




