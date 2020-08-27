import React from 'react'
import testRenderer from 'react-test-renderer'
import CurrentIncentiveLevel from './CurrentIncentiveLevel'

const initialState = {
  iepHistory: {
    currentIepLevel: 'Standard',
    daysOnIepLevel: '625',
    currentIepDateTime: '2017-08-15T16:04:35',
    nextReviewDate: '15/08/2018',
    establishments: [{ agencyId: 'LEI', description: 'Leeds' }],
    levels: ['Standard'],
    userCanMaintainIep: false,
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
}

describe('Current incentive level', () => {
  const store = {}
  const history = {}
  beforeEach(() => {
    store.getState = jest.fn()
    store.subscribe = jest.fn()
    store.dispatch = jest.fn()
    history.push = jest.fn()
    history.replace = jest.fn()
  })

  describe('should render the current Incentive Level correctly', () => {
    it("when user can't maintain Incentive Level", () => {
      store.getState.mockReturnValue(initialState)
      const wrapper = testRenderer.create(<CurrentIncentiveLevel history={history} store={store} />).toJSON()

      expect(wrapper).toMatchSnapshot()
    })

    it('when user can maintain Incentive Level', () => {
      store.getState.mockReturnValue({
        ...initialState,
        iepHistory: { ...initialState.iepHistory, userCanMaintainIep: true },
      })
      const wrapper = testRenderer.create(<CurrentIncentiveLevel history={history} store={store} />).toJSON()

      expect(wrapper).toMatchSnapshot()
    })
  })
})
