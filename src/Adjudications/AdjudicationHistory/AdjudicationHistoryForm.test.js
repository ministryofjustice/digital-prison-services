import React from 'react'
import moment from 'moment'
import testRenderer from 'react-test-renderer'

import AdjudicationHistoryForm from './AdjudicationHistoryForm'

const initialState = {
  adjudicationHistory: {
    now: moment('2017-03-21'),
    pageNumber: 0,
    pageSize: 20,
    totalRecords: 100,
    agencies: [
      { agencyId: 'MDI', agencyType: 'INST', description: 'Moorland' },
      { agencyId: 'LEI', agencyType: 'INST', description: 'Leicester' },
    ],
    establishment: 'MDI',
    fromDate: moment('2017-03-29'),
    toDate: moment('2017-03-29'),
  },
}

describe('Adjudication History Form', () => {
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
    const wrapper = testRenderer
      .create(<AdjudicationHistoryForm store={store} search={jest.fn()} reset={jest.fn()} />)
      .toJSON()

    expect(wrapper).toMatchSnapshot()
  })
})
