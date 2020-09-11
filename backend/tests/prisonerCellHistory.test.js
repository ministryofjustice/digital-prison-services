const moment = require('moment')
const prisonerCellHistory = require('../controllers/prisonerProfile/prisonerCellHistory')

describe('Prisoner cell history', () => {
  const offenderNo = 'ABC123'
  const bookingId = '123'
  const elite2Api = {}

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = {
      originalUrl: 'http://localhost',
      params: { offenderNo },
      query: {},
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost'),
    }
    res = { locals: {}, render: jest.fn() }

    logError = jest.fn()

    elite2Api.getDetails = jest.fn().mockResolvedValue({ bookingId, firstName: 'John', lastName: 'Smith ' })
    elite2Api.getOffenderCellHistory = jest.fn().mockResolvedValue({
      content: [
        {
          agencyId: 'MDI',
          assignmentDate: '2020-09-01',
          assignmentDateTime: '2020-09-01T12:48:33.375Z',
          assignmentReason: 'ADM',
          bookingId,
          description: 'MDI-1-02',
          livingUnitId: 1,
        },
        {
          agencyId: 'RNI',
          assignmentDate: '2020-08-01',
          assignmentDateTime: '2020-08-01T12:48:33.375Z',
          assignmentEndDate: '2020-09-01',
          assignmentEndDateTime: '2020-09-01T12:48:33.375Z',
          assignmentReason: 'ADM',
          bookingId,
          description: 'RNI-1-03',
          livingUnitId: 3,
        },
      ],
    })
    elite2Api.getAgencyDetails = jest.fn().mockResolvedValue([])
    elite2Api.getInmatesAtLocation = jest.fn().mockResolvedValue([])

    controller = prisonerCellHistory({ elite2Api, logError })
  })

  it('should make the expected API calls', async () => {
    await controller(req, res)

    expect(elite2Api.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(elite2Api.getOffenderCellHistory).toHaveBeenCalledWith(res.locals, bookingId, { page: 0, size: 10000 })
    expect(elite2Api.getAgencyDetails.mock.calls.length).toBe(2)
    expect(elite2Api.getInmatesAtLocation).toHaveBeenCalledWith(res.locals, 1, {})
  })

  describe('cell history for offender', () => {
    beforeEach(() => {
      elite2Api.getAgencyDetails = jest
        .fn()
        .mockResolvedValueOnce({ agencyId: 'MDI', description: 'Moorland' })
        .mockResolvedValueOnce({ agencyId: 'RNI', description: 'Ranby' })
      elite2Api.getInmatesAtLocation.mockResolvedValue([
        { bookingId: '144', firstName: 'Another', lastName: 'Offender', offenderNo: 'B12345' },
      ])
    })

    it('sends the right data to the tempalte', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerCellHistory.njk',
        expect.objectContaining({
          cellData: [
            {
              agencyId: 'RNI',
              assignmentDate: '2020-08-01',
              assignmentEndDate: '2020-09-01',
              establishment: 'Ranby',
              livingUnitId: 3,
              location: '1-03',
              movedIn: '01/08/2020 - 12:48',
              movedOut: '01/09/2020 - 12:48',
            },
          ],
          occupants: [
            {
              name: 'Offender, Another',
              profileUrl: '/prisoner/B12345',
            },
          ],
          currentLocation: {
            agencyId: 'MDI',
            assignmentDate: '2020-09-01',
            assignmentEndDate: moment().format('YYYY-MM-DD'),
            establishment: 'Moorland',
            livingUnitId: 1,
            location: '1-02',
            movedIn: '01/09/2020 - 12:48',
          },
        })
      )
    })
  })
})
