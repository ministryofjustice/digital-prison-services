import prisonerLocationHistory from '../controllers/prisonerProfile/prisonerLocationHistory'
import { notEnteredMessage } from '../common-messages'
import { makeNotFoundError } from './helpers'

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

  const cellMoveReasonTypes = [
    { code: 'ADM', activeFlag: 'Y', description: 'Administrative' },
    { code: 'BEH', activeFlag: 'Y', description: 'Behaviour' },
    { code: 'CLA', activeFlag: 'Y', description: 'Classification or re-classification' },
    { code: 'CON', activeFlag: 'Y', description: 'Conflict with other prisoners' },
    { code: 'LN', activeFlag: 'N', description: 'Local needs' },
    { code: 'VP', activeFlag: 'N', description: 'Vulnerable prisoner' },
  ]

  beforeEach(() => {
    req = {
      originalUrl: 'http://localhost',
      params: { offenderNo },
      query: { agencyId: 'MDI', locationId: 1, fromDate: '2019-12-31' },
    }
    res = { locals: {}, render: jest.fn(), status: jest.fn() }

    logError = jest.fn()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest.fn().mockResolvedValue({ bookingId, firstName: 'John', lastName: 'Smith' })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAttributesForLocation' does not exist... Remove this comment to see the full error message
    prisonApi.getAttributesForLocation = jest.fn().mockResolvedValue({})
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getHistoryForLocation' does not exist on... Remove this comment to see the full error message
    prisonApi.getHistoryForLocation = jest.fn().mockResolvedValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyDetails' does not exist on type... Remove this comment to see the full error message
    prisonApi.getAgencyDetails = jest.fn().mockResolvedValue({})
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userCaseLoads' does not exist on type '{... Remove this comment to see the full error message
    prisonApi.userCaseLoads = jest.fn().mockResolvedValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerDetail' does not exist on typ... Remove this comment to see the full error message
    prisonApi.getPrisonerDetail = jest.fn()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getStaffDetails' does not exist on type ... Remove this comment to see the full error message
    prisonApi.getStaffDetails = jest.fn().mockResolvedValue({ firstName: 'Joe', lastName: 'Bloggs' })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCellMoveReasonTypes' does not exist o... Remove this comment to see the full error message
    prisonApi.getCellMoveReasonTypes = jest.fn().mockResolvedValue(cellMoveReasonTypes)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCaseNote' does not exist on type '{}'... Remove this comment to see the full error message
    caseNotesApi.getCaseNote = jest.fn().mockResolvedValue({ text: 'Some details regarding what happened' })

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCellMoveReason' does not exist on typ... Remove this comment to see the full error message
    whereaboutsApi.getCellMoveReason = jest.fn().mockResolvedValue({ cellMoveReason: { caseNoteId: 123 } })

    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; whereaboutsApi:... Remove this comment to see the full error message
    controller = prisonerLocationHistory({ prisonApi, whereaboutsApi, caseNotesApi, logError })

    jest.spyOn(Date, 'now').mockImplementation(() => 1578787200000) // Sun Jan 12 2020 00:00:00
  })

  afterEach(() => {
    const spy = jest.spyOn(Date, 'now')
    spy.mockRestore()
  })

  it('should make the expected API calls', async () => {
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAttributesForLocation' does not exist... Remove this comment to see the full error message
    expect(prisonApi.getAttributesForLocation).toHaveBeenCalledWith(res.locals, 1)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getHistoryForLocation' does not exist on... Remove this comment to see the full error message
    expect(prisonApi.getHistoryForLocation).toHaveBeenCalledWith(res.locals, {
      locationId: 1,
      fromDate: '2019-12-31',
      toDate: '2020-01-12',
    })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyDetails' does not exist on type... Remove this comment to see the full error message
    expect(prisonApi.getAgencyDetails).toHaveBeenCalledWith(res.locals, 'MDI')
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userCaseLoads' does not exist on type '{... Remove this comment to see the full error message
    expect(prisonApi.userCaseLoads).toHaveBeenCalledWith(res.locals)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerDetail' does not exist on typ... Remove this comment to see the full error message
    expect(prisonApi.getPrisonerDetail.mock.calls.length).toBe(0)
  })

  describe('without data', () => {
    it('should still be able to render the template and not error', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerLocationHistory.njk', {
        breadcrumbPrisonerName: 'Smith, John',
        locationDetails: {
          movedOut: 'Current cell',
          reasonForMove: notEnteredMessage,
          movedBy: 'Joe Bloggs',
          whatHappened: 'Some details regarding what happened',
        },
        locationSharingHistory: false,
        profileUrl: '/prisoner/ABC123',
        prisonerName: 'John Smith',
      })
    })
  })

  describe('with data', () => {
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAttributesForLocation' does not exist... Remove this comment to see the full error message
      prisonApi.getAttributesForLocation.mockResolvedValue({
        id: 1,
        description: 'MDI-1-1-015',
        capacity: 2,
        noOfOccupants: 2,
        attributes: [{ description: 'Double occupancy' }],
      })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getHistoryForLocation' does not exist on... Remove this comment to see the full error message
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
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyDetails' does not exist on type... Remove this comment to see the full error message
      prisonApi.getAgencyDetails.mockResolvedValue({
        agencyId: 'MDI',
        description: 'Moorland (HMP & YOI)',
        agencyType: 'INST',
        active: true,
      })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userCaseLoads' does not exist on type '{... Remove this comment to see the full error message
      prisonApi.userCaseLoads.mockResolvedValue([
        {
          caseLoadId: 'MDI',
          description: 'Moorland Closed (HMP & YOI)',
          type: 'INST',
          caseloadFunction: 'GENERAL',
          currentlyActive: true,
        },
      ])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerDetail' does not exist on typ... Remove this comment to see the full error message
      prisonApi.getPrisonerDetail
        .mockResolvedValueOnce({ offenderNo, bookingId, firstName: 'John', lastName: 'Smith' })
        .mockResolvedValueOnce({ offenderNo: 'ABC456', bookingId: 2, firstName: 'Steve', lastName: 'Jones' })
        .mockResolvedValueOnce({ offenderNo: 'ABC789', bookingId: 3, firstName: 'Barry', lastName: 'Stevenson' })

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getStaffDetails' does not exist on type ... Remove this comment to see the full error message
      prisonApi.getStaffDetails = jest.fn().mockResolvedValue({ firstName: 'Joe', lastName: 'Bloggs' })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCellMoveReasonTypes' does not exist o... Remove this comment to see the full error message
      prisonApi.getCellMoveReasonTypes = jest.fn().mockResolvedValue(cellMoveReasonTypes)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCellMoveReason' does not exist on typ... Remove this comment to see the full error message
      whereaboutsApi.getCellMoveReason = jest.fn().mockResolvedValue({ cellMoveReason: { caseNoteId: 123 } })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCaseNote' does not exist on type '{}'... Remove this comment to see the full error message
      caseNotesApi.getCaseNote = jest
        .fn()
        .mockResolvedValue({ text: 'A long comment about what happened on the day to cause the move.' })
    })

    it('render the template with the correct data', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerLocationHistory.njk', {
        breadcrumbPrisonerName: 'Smith, John',
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

    it('when we get cell move reason throws 404 then no trigger outer try', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCellMoveReason' does not exist on typ... Remove this comment to see the full error message
      whereaboutsApi.getCellMoveReason = jest.fn().mockRejectedValue(makeNotFoundError())
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerLocationHistory.njk',
        expect.objectContaining({})
      )
    })

    it('when we get cell move reason throws 404 then default what happened', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCellMoveReason' does not exist on typ... Remove this comment to see the full error message
      whereaboutsApi.getCellMoveReason = jest.fn().mockRejectedValue(makeNotFoundError())
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getHistoryForLocation' does not exist on... Remove this comment to see the full error message
      prisonApi.getHistoryForLocation = jest.fn().mockResolvedValue([
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
      ])
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerLocationHistory.njk',
        expect.objectContaining({
          locationDetails: expect.objectContaining({
            reasonForMove: notEnteredMessage,
            whatHappened: notEnteredMessage,
          }),
        })
      )
    })

    it('when assignmentReason is missing then default cell move reason', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getHistoryForLocation' does not exist on... Remove this comment to see the full error message
      prisonApi.getHistoryForLocation = jest.fn().mockResolvedValue([
        {
          bookingId: 1,
          livingUnitId: 1,
          assignmentDate: '2020-08-28',
          assignmentDateTime: '2020-08-28T11:20:39',
          agencyId: 'MDI',
          description: 'MDI-1-1-015',
          movementMadeBy: 'USERID_GEN',
          bedAssignmentHistorySequence: 1,
        },
      ])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerLocationHistory.njk',
        expect.objectContaining({
          locationDetails: expect.objectContaining({
            reasonForMove: notEnteredMessage,
            whatHappened: 'A long comment about what happened on the day to cause the move.',
          }),
        })
      )
    })
  })

  describe('Errors', () => {
    it('should render the error template with a link to the homepage if there is a problem retrieving prisoner details', async () => {
      const error = new Error('Network error')
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      prisonApi.getDetails.mockImplementation(() => Promise.reject(error))

      await expect(controller(req, res)).rejects.toThrowError(error)

      expect(res.locals.redirectUrl).toBe('/prisoner/ABC123')
    })
  })

  describe('Error in mapping', () => {
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      prisonApi.getDetails = jest.fn().mockResolvedValue({ bookingId, firstName: 'John', lastName: 'Smith' })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAttributesForLocation' does not exist... Remove this comment to see the full error message
      prisonApi.getAttributesForLocation.mockResolvedValue({
        id: 1,
        description: 'MDI-1-1-015',
        capacity: 2,
        noOfOccupants: 2,
        attributes: [{ description: 'Double occupancy' }],
      })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getHistoryForLocation' does not exist on... Remove this comment to see the full error message
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
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyDetails' does not exist on type... Remove this comment to see the full error message
      prisonApi.getAgencyDetails.mockResolvedValue({
        agencyId: 'MDI',
        description: 'Moorland (HMP & YOI)',
        agencyType: 'INST',
        active: true,
      })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userCaseLoads' does not exist on type '{... Remove this comment to see the full error message
      prisonApi.userCaseLoads.mockResolvedValue([
        {
          caseLoadId: 'MDI',
          description: 'Moorland Closed (HMP & YOI)',
          type: 'INST',
          caseloadFunction: 'GENERAL',
          currentlyActive: true,
        },
      ])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerDetail' does not exist on typ... Remove this comment to see the full error message
      prisonApi.getPrisonerDetail
        .mockResolvedValueOnce({ offenderNo, bookingId, firstName: 'John', lastName: 'Smith' })
        .mockResolvedValueOnce({ offenderNo: 'ABC456', bookingId: 2, firstName: 'Steve', lastName: 'Jones' })
        .mockResolvedValueOnce({ offenderNo: 'ABC789', bookingId: 3, firstName: 'Barry', lastName: 'Stevenson' })

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getStaffDetails' does not exist on type ... Remove this comment to see the full error message
      prisonApi.getStaffDetails = jest.fn().mockResolvedValue({ firstName: 'Joe', lastName: 'Bloggs' })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCellMoveReasonTypes' does not exist o... Remove this comment to see the full error message
      prisonApi.getCellMoveReasonTypes = jest.fn().mockResolvedValue(cellMoveReasonTypes)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCellMoveReason' does not exist on typ... Remove this comment to see the full error message
      whereaboutsApi.getCellMoveReason = jest.fn().mockResolvedValue({ cellMoveReason: { caseNoteId: 123 } })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCaseNote' does not exist on type '{}'... Remove this comment to see the full error message
      caseNotesApi.getCaseNote = jest.fn().mockResolvedValue({ text: 'Some comment' })
    })

    it('should render the error when fetch staff details fails', async () => {
      const error = new Error('Not found')

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getStaffDetails' does not exist on type ... Remove this comment to see the full error message
      prisonApi.getStaffDetails.mockImplementation(() => Promise.reject(error))

      await expect(controller(req, res)).rejects.toThrowError(error)
    })

    it('should render the error when fetch reason description', async () => {
      const error = new Error('Not found')
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCellMoveReasonTypes' does not exist o... Remove this comment to see the full error message
      prisonApi.getCellMoveReasonTypes.mockImplementation(() => Promise.reject(error))

      await expect(controller(req, res)).rejects.toThrowError(error)
    })

    it('should render the error for fetch what happened and get cell move reason fails', async () => {
      const error = new Error('Not found')
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCellMoveReason' does not exist on typ... Remove this comment to see the full error message
      whereaboutsApi.getCellMoveReason.mockImplementation(() => Promise.reject(error))

      await expect(controller(req, res)).rejects.toThrowError(error)
    })

    it('should render the error for fetch what happened and get case note fails', async () => {
      const error = new Error('Not found')
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCaseNote' does not exist on type '{}'... Remove this comment to see the full error message
      caseNotesApi.getCaseNote.mockImplementation(() => Promise.reject(error))

      await expect(controller(req, res)).rejects.toThrowError(error)
    })
  })
})
