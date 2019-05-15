import reducer from './iepHistory'
import * as Actions from '../actions'

describe('IEP history reducer', () => {
  const initialState = {
    establishments: [],
    levels: [],
    results: [],
  }
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toMatchObject({
      establishments: [],
      levels: [],
      results: [],
    })
  })

  it('should handle SET_IEP_HISTORY_RESULTS', () => {
    const results = ['result-1']

    const state = reducer(
      initialState,
      Actions.setIepHistoryResults({
        results,
      })
    )

    expect(state).toEqual({
      ...initialState,
      results,
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
})
