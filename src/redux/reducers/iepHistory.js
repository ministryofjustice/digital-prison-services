import moment from 'moment'
import * as ActionTypes from '../actions/actionTypes'

const initialState = {
  now: moment(),
  establishments: [],
  levels: [],
  results: [],
}

export default function iepHistory(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.SET_IEP_HISTORY_RESULTS:
      return {
        ...state,
        ...action.results,
      }
    case ActionTypes.SET_IEP_HISTORY_FILTER:
      return {
        ...state,
        ...action.fields,
      }
    default:
      return state
  }
}
