import React from 'react'
import { shallow } from 'enzyme'
import moment from 'moment'

import AdjudicationHistoryContainer from './AdjudicationHistoryContainer'

const initialState = {
  adjudicationHistory: {
    pageNumber: 0,
    pageSize: 20,
  },
}

describe('Adjudication History container', () => {
  const now = moment('2019-10-10T21:00:00Z')
  const store = {}
  const history = {}
  beforeEach(() => {
    store.getState = jest.fn()
    store.subscribe = jest.fn()
    store.dispatch = jest.fn()
    history.push = jest.fn()
    history.replace = jest.fn()
    store.getState.mockReturnValue(initialState)
  })

  it('should render correctly', () => {
    const wrapper = shallow(
      <AdjudicationHistoryContainer
        now={now}
        store={store}
        offenderNumber="AA123BB"
        handleError={jest.fn()}
        setLoadedDispatch={jest.fn()}
        resetErrorDispatch={jest.fn()}
        history={history}
      />
    )

    expect(wrapper.dive().debug()).toMatchSnapshot()
  })
})
