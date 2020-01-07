import reducer from './iepLevels'
import * as Actions from '../actions'

describe('Incentive levels reducer', () => {
  const initialState = {}
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toMatchObject({})
  })

  it('should handle SET_POSSIBLE_IEP_LEVELS', () => {
    const levels = ['level-1']

    const state = reducer(
      initialState,
      Actions.setPossibleIepLevels({
        levels,
      })
    )

    expect(state).toEqual({
      ...initialState,
      levels: { levels },
    })
  })
})
