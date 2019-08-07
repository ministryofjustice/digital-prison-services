import moment from 'moment'
import * as ActionTypes from '../actions/actionTypes'

const initialState = {
  now: moment(),
  establishments: [],
  levels: [],
  results: [],
  caseLoadOptions: [],
  roles: [],
  userCanMaintainIep: false,
}

export default function iepHistory(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.SET_IEP_HISTORY_RESULTS: {
      const { offenderAgencyId } = action.results
      const { caseLoadOptions, roles } = state

      const caseLoad = caseLoadOptions.find(x => x.caseLoadId === offenderAgencyId)

      return {
        ...state,
        ...action.results,
        userCanMaintainIep: Boolean(caseLoad && roles.includes('MAINTAIN_IEP')),
      }
    }
    case ActionTypes.SET_IEP_HISTORY_FILTER:
      return {
        ...state,
        ...action.fields,
      }
    case ActionTypes.SET_USER_DETAILS:
      return { ...state, caseLoadOptions: action.user.caseLoadOptions, roles: action.user.roles }
    default:
      return state
  }
}
