import reducer from './adjudications'
import * as Actions from '../actions'

describe('Adjudications reducer', () => {
  const initialState = {
    agencies: [],
    offences: [],
    results: [],
    pageNumber: 0,
    pageSize: 20,
    detail: {},
  }
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toMatchObject({
      agencies: [],
      offences: [],
      results: [],
      pageNumber: 0,
      pageSize: 20,
      detail: {},
    })
  })

  it('should handle SET_ADJUDICATION_HISTORY_RESULTS', () => {
    const results = ['result-1']

    const state = reducer(
      initialState,
      Actions.setAdjudicationHistoryResults({
        results,
      })
    )

    expect(state).toEqual({
      ...initialState,
      results,
    })
  })

  it('should handle SET_ADJUDICATION_DETAIL', () => {
    const detail = { establishment: 'MDI' }
    const state = reducer(initialState, Actions.setAdjudicationDetail(detail))

    expect(state).toEqual({
      ...initialState,
      detail,
    })
  })

  it('should handle SET_ADJUDICATION_HISTORY_FILTER', () => {
    const filter = { establishment: 'MDI', offenceId: 123 }
    const state = reducer(initialState, Actions.setAdjudicationHistoryFilter(filter))

    expect(state).toEqual({
      ...initialState,
      ...filter,
    })
  })

  it('should handle SET_ADJUDICATION_HISTORY_PAGE_NUMBER', () => {
    const pageNumber = 3
    const state = reducer(initialState, Actions.setAdjudicationHistoryPageNumber(pageNumber))

    expect(state).toEqual({
      ...initialState,
      pageNumber,
    })
  })

  it('should handle SET_ADJUDICATION_HISTORY_PAGE_SIZE', () => {
    const pageSize = 1000
    const state = reducer(initialState, Actions.setAdjudicationHistoryPageSize(pageSize))

    expect(state).toEqual({
      ...initialState,
      pageSize,
    })
  })
})
