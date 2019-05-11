import reducer from './offenderDetails'
import * as Actions from '../actions'

describe('Offender Details reducer', () => {
  const initialState = {
    firstName: null,
    lastName: null,
  }
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toMatchObject({
      firstName: null,
      lastName: null,
    })
  })

  it('should handle SET_OFFENDER', () => {
    const offender = {
      firstName: 'Bob',
      lastName: 'Smith',
    }
    const state = reducer(initialState, Actions.setOffender(offender))

    expect(state).toEqual(offender)
  })
})
