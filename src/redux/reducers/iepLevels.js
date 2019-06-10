import * as ActionTypes from '../actions/actionTypes'

const initialState = {}

export default function iepLevels(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.SET_POSSIBLE_IEP_LEVELS:
      return {
        ...state,
        levels: action.levels,
      }
    default:
      return state
  }
}
