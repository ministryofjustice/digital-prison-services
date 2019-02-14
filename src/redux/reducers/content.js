import * as ActionTypes from '../actions/actionTypes'

const initialState = {
  links: [],
  entries: [],
}

export default function content(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.SET_CONTENT_LINKS_SUCCESS:
      return {
        ...state,
        links: action.payload,
      }
    case ActionTypes.SET_CONTENT_SUCCESS:
      return {
        ...state,
        entries: [...state.entries, action.payload],
      }
    default:
      return state
  }
}
