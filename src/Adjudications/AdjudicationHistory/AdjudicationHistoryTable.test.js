import React from 'react'
import testRenderer from 'react-test-renderer'
import { MemoryRouter } from 'react-router'
import AdjudicationHistoryTable from './AdjudicationHistoryTable'

const initialState = {
  adjudicationHistory: {
    pageNumber: 0,
    pageSize: 20,
    totalRecords: 100,
    results: [
      {
        adjudicationNumber: 1111111,
        reportDate: '12/03/2018',
        reportTime: '12:20',
        establishment: 'Moorland',
        offenceDescription: 'Arson',
        findingDescription: 'Guilty',
      },
      {
        adjudicationNumber: 2222222,
        reportDate: '17/02/2017',
        reportTime: '10:20',
        establishment: 'Leeds',
        offenceDescription: 'Assault',
        findingDescription: ' Not Guilty',
      },
      {
        adjudicationNumber: 3333333,
        reportDate: '01/03/2017',
        reportTime: '04:20',
        establishment: 'Moorland',
        offenceDescription: 'Theft',
        findingDescription: '--',
      },
    ],
  },
}

describe('Adjudication History Table', () => {
  const store = {}
  const history = {}
  beforeEach(() => {
    store.getState = jest.fn()
    store.subscribe = jest.fn()
    store.dispatch = jest.fn()
    history.push = jest.fn()
    history.replace = jest.fn()
  })

  it('should render correctly', () => {
    store.getState.mockReturnValue(initialState)

    const wrapper = testRenderer
      .create(
        <MemoryRouter>
          <AdjudicationHistoryTable
            offenderNo="AAA123"
            store={store}
            changePerPage={jest.fn()}
            changePage={jest.fn()}
          />
        </MemoryRouter>
      )
      .toJSON()

    expect(wrapper).toMatchSnapshot()
  })
})
