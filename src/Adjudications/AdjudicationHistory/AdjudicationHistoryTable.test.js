import React from 'react'
import testRenderer from 'react-test-renderer'
import { MemoryRouter } from 'react-router'
import AdjudicationHistoryTable from './AdjudicationHistoryTable'
import { ConnectedFlagsProvider } from '../../flags'

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
  offenderDetails: {
    offenderNo: 'AAA123',
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

  it('should render correctly with feature toggle enabled', () => {
    store.getState.mockReturnValue({
      ...initialState,
      flags: {
        adjudicationDetailsLinkEnabled: true,
      },
    })

    const wrapper = testRenderer
      .create(
        <MemoryRouter>
          <ConnectedFlagsProvider store={store}>
            <AdjudicationHistoryTable store={store} changePerPage={jest.fn()} changePage={jest.fn()} />
          </ConnectedFlagsProvider>
        </MemoryRouter>
      )
      .toJSON()

    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with feature toggle disabled', () => {
    store.getState.mockReturnValue({
      ...initialState,
      flags: {
        adjudicationDetailsLinkEnabled: false,
      },
    })

    const wrapper = testRenderer
      .create(
        <MemoryRouter>
          <ConnectedFlagsProvider store={store}>
            <AdjudicationHistoryTable store={store} changePerPage={jest.fn()} changePage={jest.fn()} />
          </ConnectedFlagsProvider>
        </MemoryRouter>
      )
      .toJSON()

    expect(wrapper).toMatchSnapshot()
  })
})
