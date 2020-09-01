import React from 'react'
import { shallow } from 'enzyme/build'
import IncentiveLevelChangeContainer from './IncentiveLevelChangeContainer'
import OffenderPage from '../OffenderPage'

const initialState = {
  iepHistory: {
    currentIepLevel: 'Standard',
    daysOnIepLevel: '625',
    currentIepDateTime: '2017-08-15T16:04:35',
    nextReviewDate: '15/08/2018',
    establishments: [{ agencyId: 'LEI', description: 'Leeds' }],
    levels: ['Standard'],
    results: [
      {
        bookingId: -1,
        iepDate: '2017-08-13',
        iepTime: '2017-08-13T16:04:35',
        formattedTime: '13/08/2017 - 16:04',
        iepEstablishment: 'Leeds',
        iepStaffMember: 'Staff Member',
        agencyId: 'LEI',
        iepLevel: 'Standard',
        userId: 'ITAG_USER',
      },
    ],
  },
  app: {
    user: {
      currentCaseLoadId: 'LEI',
    },
  },
  iepLevels: {
    levels: [
      {
        diff: -1,
        title: 'Basic',
        value: 'BAS',
      },
      {
        diff: 1,
        title: 'Enhanced',
        value: 'ENH',
      },
    ],
  },
  offenderDetails: {
    offenderNo: 'AAA123',
  },
}

describe('Incentive Level change container', () => {
  const store = {}
  const history = {}
  beforeEach(() => {
    store.getState = jest.fn()
    store.subscribe = jest.fn()
    store.dispatch = jest.fn()
    history.push = jest.fn()
    history.replace = jest.fn()
  })

  it('should render the Incentive level history table correctly', () => {
    store.getState.mockReturnValue(initialState)

    const wrapper = shallow(
      <IncentiveLevelChangeContainer
        store={store}
        handleError={jest.fn()}
        setLoadedDispatch={jest.fn()}
        resetErrorDispatch={jest.fn()}
        raiseAnalyticsEvent={jest.fn()}
        history={history}
      />
    )

    const page = wrapper.dive().find(OffenderPage)

    expect(page.length).toBe(1)
    expect(page.getElement().props.title()).toBe('Change incentive level')
    expect(page.find('Connect(IncentiveLevelChangeForm)').length).toBe(1)
  })
})
