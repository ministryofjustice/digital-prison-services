import reducer from './iepHistory'
import * as Actions from '../actions'

describe('Incentive level history reducer', () => {
  const initialState = {
    establishments: [],
    levels: [],
    results: [],
    caseLoadOptions: [],
    roles: [],
    userCanMaintainIep: false,
  }
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toMatchObject({
      establishments: [],
      levels: [],
      results: [],
    })
  })

  describe('should handle SET_IEP_HISTORY_RESULTS', () => {
    it('no caseload intersection', () => {
      const results = { offenderAgencyId: 'MDI', results: ['result-1'] }
      const stateWithUser = {
        ...initialState,
        caseLoadOptions: [{ caseLoadId: 'LEI' }],
        roles: ['AUTH_ROLE', 'MAINTAIN_IEP'],
      }
      const state = reducer(stateWithUser, Actions.setIepHistoryResults(results))

      expect(state).toEqual({ ...stateWithUser, ...results })
    })

    it('no maintain iep role', () => {
      const results = { offenderAgencyId: 'MDI', results: ['result-1'] }
      const stateWithUser = {
        ...initialState,
        caseLoadOptions: [{ caseLoadId: 'MDI' }],
        roles: [],
      }
      const state = reducer(stateWithUser, Actions.setIepHistoryResults(results))

      expect(state).toEqual({ ...stateWithUser, ...results })
    })

    it('user can maintain iep', () => {
      const results = { offenderAgencyId: 'MDI', results: ['result-1'] }
      const stateWithUser = {
        ...initialState,
        caseLoadOptions: [{ caseLoadId: 'LEI' }, { caseLoadId: 'MDI' }],
        roles: ['AUTH_ROLE', 'MAINTAIN_IEP'],
      }
      const state = reducer(stateWithUser, Actions.setIepHistoryResults(results))

      expect(state).toEqual({ ...stateWithUser, ...results, userCanMaintainIep: true })
    })
  })

  it('should handle SET_IEP_HISTORY_FILTER', () => {
    const filter = { establishment: 'LEI', level: 'Basic' }
    const state = reducer(initialState, Actions.setIepHistoryFilter(filter))

    expect(state).toEqual({
      ...initialState,
      ...filter,
    })
  })

  it('should handle SET_USER_DETAILS', () => {
    const filter = { caseLoadOptions: ['LEI'], roles: ['IEP'] }
    const state = reducer(initialState, Actions.setUserDetails(filter))

    expect(state).toEqual({ ...initialState, ...filter })
  })
})
