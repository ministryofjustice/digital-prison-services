import moment from 'moment'
import * as ActionTypes from '../actions/actionTypes'

const initialState = {
  now: moment(),
  agencies: [],
  offences: [],
  results: [],
  pageNumber: 0,
  pageSize: 20,
  totalRecords: 0,
  detail: {},
}

export default function adjudicationHistory(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.SET_ADJUDICATION_DETAIL:
      return {
        ...state,
        detail: action.detail,
      }
    case ActionTypes.SET_ADJUDICATION_HISTORY_RESULTS:
      return {
        ...state,
        ...action.results,
      }
    case ActionTypes.SET_ADJUDICATION_HISTORY_FILTER:
      return {
        ...state,
        ...action.fields,
      }
    case ActionTypes.SET_ADJUDICATION_HISTORY_PAGE_NUMBER:
      return {
        ...state,
        pageNumber: action.number,
      }
    case ActionTypes.SET_ADJUDICATION_HISTORY_PAGE_SIZE:
      return {
        ...state,
        pageSize: action.size,
      }
    default:
      return state
  }
}
