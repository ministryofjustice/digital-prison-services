const elite2Api = {}
const iepHistory = require('../controllers/iepHistory').getIepHistoryFactory(elite2Api).getIepHistory

function createIepHistoryReponse() {
  return {
    currentIepLevel: 'Standard',
    daysOnIepLevel: 625,
    currentIepDateTime: '2017-08-15T16:04:35',
    currentIepEstablishment: 'LEI',
    iepHistory: [
      {
        bookingId: -1,
        iepDate: '2017-08-15',
        iepTime: '2017-08-15T16:04:35',
        agencyId: 'LEI',
        iepLevel: 'Standard',
      },
    ],
    offenderName: 'ANDERSON, ARTHUR',
  }
}

beforeEach(() => {
  elite2Api.getDetails = jest.fn()
  elite2Api.getIepSummaryWithDetails = jest.fn()
})

describe('Activity list controller', async () => {
  it('Should return the IEP history for offender', async () => {
    elite2Api.getDetails.mockReturnValue({
      firstName: 'ARTHUR',
      lastName: 'ANDERSON',
    })
    elite2Api.getIepSummaryWithDetails.mockReturnValue({
      bookingId: -1,
      iepDate: '2017-08-15',
      iepTime: '2017-08-15T16:04:35',
      iepLevel: 'Standard',
      daysSinceReview: 625,
      iepDetails: [
        {
          bookingId: -1,
          iepDate: '2017-08-15',
          iepTime: '2017-08-15T16:04:35',
          agencyId: 'LEI',
          iepLevel: 'Standard',
        },
      ],
    })

    const response = await iepHistory({ offenderNo: '1' })
    const expected = createIepHistoryReponse()
    expect(response).toEqual(expected)

    expect(elite2Api.getDetails.mock.calls.length).toBe(1)
    expect(elite2Api.getIepSummaryWithDetails.mock.calls.length).toBe(1)
  })
})
