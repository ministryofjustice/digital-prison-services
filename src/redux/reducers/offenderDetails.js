import * as ActionTypes from '../actions/actionTypes'

const initialState = {
  offenderNo: null,
  firstName: null,
  lastName: null,
}

export default function offenderDetails(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.SET_OFFENDER:
      return {
        ...state,
        ...action.offender,
      }
    default:
      return state
  }
}
