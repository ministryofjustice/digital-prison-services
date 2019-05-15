import * as ActionTypes from '../actions/actionTypes'

const initialState = {
  entries: [],
  absentReasons: [],
}

export default function content(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.SET_CONTENT_SUCCESS:
      return {
        ...state,
        entries: [...state.entries, action.payload],
      }
    case ActionTypes.GET_ABSENT_REASONS:
      return {
        ...state,
        absentReasons: action.payload,
      }
    default:
      return state
  }
}
