const prisonerLocationHistory = require('../controllers/prisonerProfile/prisonerLocationHistory')
const { serviceUnavailableMessage } = require('../common-messages')

describe('Prisoner location sharing history', () => {
  const offenderNo = 'ABC123'
  const bookingId = 1
  const prisonApi = {}
  const whereaboutsApi = {}
  const caseNotesApi = {}

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = {
      originalUrl: 'http://localhost',
      params: { offenderNo },
      query: { agencyId: 'MDI', locationId: 1, fromDate: '2019-12-31' },
    }
    res = { locals: {}, render: jest.fn() }

    logError = jest.fn()

    prisonApi.getDetails = jest.fn().mockResolvedValue({ bookingId, firstName: 'John', lastName: 'Smith' })
    prisonApi.getAttributesForLocation = jest.fn().mockResolvedValue({})
    prisonApi.getHistoryForLocation = jest.fn().mockResolvedValue([])
    prisonApi.getAgencyDetails = jest.fn().mockResolvedValue({})
    prisonApi.userCaseLoads = jest.fn().mockResolvedValue([])
    prisonApi.getPrisonerDetail = jest.fn()
    prisonApi.getStaffDetails = jest.fn().mockResolvedValue({})
    prisonApi.getCaseNote = jest.fn().mockResolvedValue({})

    caseNotesApi.getCaseNoteTypes = jest.fn().mockResolvedValue([])
    whereaboutsApi.getCellMoveReason = jest.fn().mockResolvedValue({})

    controller = prisonerLocationHistory({ prisonApi, whereaboutsApi, caseNotesApi, logError })

    jest.spyOn(Date, 'now').mockImplementation(() => 1578787200000) // Sun Jan 12 2020 00:00:00
  })

  afterEach(() => {
    Date.now.mockRestore()
  })

  it('should make the expected API calls', async () => {
    await controller(req, res)

    expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(prisonApi.getAttributesForLocation).toHaveBeenCalledWith(res.locals, 1)
    expect(prisonApi.getHistoryForLocation).toHaveBeenCalledWith(res.locals, {
      locationId: 1,
      fromDate: '2019-12-31',
      toDate: '2020-01-12',
    })
    expect(prisonApi.getAgencyDetails).toHaveBeenCalledWith(res.locals, 'MDI')
    expect(prisonApi.userCaseLoads).toHaveBeenCalledWith(res.locals)
    expect(prisonApi.getPrisonerDetail.mock.calls.length).toBe(0)
  })

  // describe('without data', () => {
  //   it('should still be able to render the template and not error', async () => {
  //     await controller(req, res)

  //     expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerLocationHistory.njk', {
  //       breadcrumbPrisonerName: 'Smith, John',
  //       dpsUrl: 'http://localhost:3000/',
  //       locationDetails: {
  //         movedOut: 'Current cell',
  //         // whatHappened: 'No details found',
  //       },
  //       locationSharingHistory: false,
  //       profileUrl: '/prisoner/ABC123',
  //       prisonerName: 'John Smith',
  //     })
  //   })
  // })

  describe('with data', () => {
    beforeEach(() => {
      prisonApi.getAttributesForLocation.mockResolvedValue({
        id: 1,
        description: 'MDI-1-1-015',
        capacity: 2,
        noOfOccupants: 2,
        attributes: [{ description: 'Double occupancy' }],
      })
      prisonApi.getHistoryForLocation.mockResolvedValue([
        {
          bookingId: 1,
          livingUnitId: 1,
          assignmentDate: '2020-08-28',
          assignmentDateTime: '2020-08-28T11:20:39',
          agencyId: 'MDI',
          description: 'MDI-1-1-015',
          movementMadeBy: 'USERID_GEN',
          assignmentReason: 'CLA',
          bedAssignmentHistorySequence: 1,
        },
        {
          bookingId: 2,
          livingUnitId: 1,
          assignmentDate: '2020-08-27',
          assignmentDateTime: '2020-08-27T11:10:00',
          assignmentReason: 'ADM',
          assignmentEndDate: '2020-08-28',
          assignmentEndDateTime: '2020-08-28T11:00:00',
          agencyId: 'LEI',
          description: 'MDI-1-1-015',
          movementMadeBy: 'USERID_GEN',
          bedAssignmentHistorySequence: 1,
        },
        {
          bookingId: 3,
          livingUnitId: 1,
          assignmentDate: '2020-08-25',
          assignmentDateTime: '2020-08-25T11:20:39',
          agencyId: 'MDI',
          description: 'MDI-1-1-015',
          movementMadeBy: 'USERID_GEN',
          assignmentReason: 'ADM',
          bedAssignmentHistorySequence: 1,
        },
      ])
      prisonApi.getAgencyDetails.mockResolvedValue({
        agencyId: 'MDI',
        description: 'Moorland (HMP & YOI)',
        agencyType: 'INST',
        active: true,
      })
      prisonApi.userCaseLoads.mockResolvedValue([
        {
          caseLoadId: 'MDI',
          description: 'Moorland Closed (HMP & YOI)',
          type: 'INST',
          caseloadFunction: 'GENERAL',
          currentlyActive: true,
        },
      ])
      prisonApi.getPrisonerDetail
        .mockResolvedValueOnce({ offenderNo, bookingId, firstName: 'John', lastName: 'Smith' })
        .mockResolvedValueOnce({ offenderNo: 'ABC456', bookingId: 2, firstName: 'Steve', lastName: 'Jones' })
        .mockResolvedValueOnce({ offenderNo: 'ABC789', bookingId: 3, firstName: 'Barry', lastName: 'Stevenson' })

      prisonApi.getCaseNote = jest
        .fn()
        .mockResolvedValue({ text: 'A long comment about what happened on the day to cause the move.' })

      prisonApi.getStaffDetails = jest.fn().mockResolvedValue({ firstName: 'Joe', lastName: 'Bloggs' })
      const caseNotesTypes = [
        {
          code: 'MOVED_CELL',
          subCodes: [
            { code: 'ADM', description: 'Administrative' },
            { code: 'BEH', description: 'Behaviour' },
            { code: 'CLA', description: 'Classification or re-classification' },
            { code: 'CON', description: 'Conflict with other prisoners' },
            { code: 'LN', description: 'Local needs' },
            { code: 'VP', description: 'Vulnerable prisoner' },
          ],
        },
      ]
      caseNotesApi.getCaseNoteTypes = jest.fn().mockResolvedValue(caseNotesTypes)
      whereaboutsApi.getCellMoveReason = jest.fn().mockResolvedValue({ caseNoteId: 123 })
      prisonApi.getCaseNote = jest
        .fn()
        .mockResolvedValue({ text: 'A long comment about what happened on the day to cause the move.' })
    })

    it('render the template with the correct data', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerLocationHistory.njk', {
        breadcrumbPrisonerName: 'Smith, John',
        dpsUrl: 'http://localhost:3000/',
        locationDetails: {
          attributes: [{ description: 'Double occupancy' }],
          description: 'Moorland (HMP & YOI)',
          movedIn: '28/08/2020 - 11:20',
          movedOut: 'Current cell',
          movedBy: 'Joe Bloggs',
          reasonForMove: 'Classification or re-classification',
          whatHappened: 'A long comment about what happened on the day to cause the move.',
        },
        locationSharingHistory: [
          {
            movedIn: '27/08/2020 - 11:10',
            movedOut: '28/08/2020 - 11:00',
            name: 'Jones, Steve',
            number: 'ABC456',
            shouldLink: false,
          },
          {
            movedIn: '25/08/2020 - 11:20',
            movedOut: 'Currently sharing',
            name: 'Stevenson, Barry',
            number: 'ABC789',
            shouldLink: true,
          },
        ],
        profileUrl: '/prisoner/ABC123',
        locationName: '1-1-015',
        prisonerName: 'John Smith',
      })
    })
  })

  describe('Errors', () => {
    it('should render the error template with a link to the homepage if there is a problem retrieving prisoner details', async () => {
      prisonApi.getDetails.mockImplementation(() => Promise.reject(new Error('Network error')))

      await controller(req, res)

      expect(logError).toHaveBeenCalledWith(req.originalUrl, new Error('Network error'), serviceUnavailableMessage)
      expect(res.render).toHaveBeenCalledWith('error.njk', { url: '/prisoner/ABC123' })
    })
  })
})
