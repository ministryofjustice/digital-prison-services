const prisonerCellHistory = require('../controllers/prisonerProfile/prisonerCellHistory')

describe('Prisoner cell history', () => {
  const offenderNo = 'ABC123'
  const bookingId = '123'
  const prisonApi = {}
  const oauthApi = {}

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

    oauthApi.userRoles = jest.fn().mockResolvedValue([])
    prisonApi.getDetails = jest.fn().mockResolvedValue({ bookingId, firstName: 'John', lastName: 'Smith' })
    prisonApi.getOffenderCellHistory = jest.fn().mockResolvedValue({
      content: [
        {
          agencyId: 'MDI',
          assignmentDate: '2020-01-01',
          assignmentDateTime: '2020-01-01T11:48:33',
          assignmentEndDate: '2020-02-01',
          assignmentEndDateTime: '2020-02-01T11:48:33',
          assignmentReason: 'ADM',
          bookingId,
          description: 'MDI-1-01',
          livingUnitId: 1,
          movementMadeBy: 'STAFF_1',
        },
        // Previous location without end date/time
        {
          agencyId: 'RNI',
          assignmentDate: '2020-02-01',
          assignmentDateTime: '2020-02-01T12:48:33.375Z',
          assignmentReason: 'ADM',
          bookingId,
          description: 'RNI-1-03',
          livingUnitId: 3,
          movementMadeBy: 'STAFF_2',
        },
        // Current location
        {
          agencyId: 'MDI',
          assignmentDate: '2020-05-01',
          assignmentDateTime: '2020-05-01T12:48:33.375Z', // Avoid BST
          assignmentReason: 'ADM',
          bookingId,
          description: 'MDI-1-02',
          livingUnitId: 1,
          movementMadeBy: 'STAFF_1',
        },
        {
          agencyId: 'MDI',
          assignmentDate: '2020-03-01',
          assignmentDateTime: '2020-03-01T12:48:33.375Z',
          assignmentEndDate: '2020-04-01',
          assignmentEndDateTime: '2020-04-01T12:48:33.375Z',
          assignmentReason: 'ADM',
          bookingId,
          description: 'MDI-RECP',
          livingUnitId: 2,
          movementMadeBy: 'STAFF_3',
        },
        {
          agencyId: 'MDI',
          assignmentDate: '2020-04-01',
          assignmentDateTime: '2020-04-01T12:48:33.375Z',
          assignmentEndDate: '2020-05-01',
          assignmentEndDateTime: '2020-05-01T12:48:33.375Z',
          assignmentReason: 'ADM',
          bookingId,
          description: 'MDI-1-03',
          livingUnitId: 2,
          movementMadeBy: 'STAFF_3',
        },
      ],
    })
    prisonApi.getAgencyDetails = jest.fn()
    prisonApi.getInmatesAtLocation = jest.fn()
    prisonApi.getStaffDetails = jest.fn()

    controller = prisonerCellHistory({ oauthApi, prisonApi, logError })

    jest.spyOn(Date, 'now').mockImplementation(() => 1603988100000) // Friday, 29 Oct 2020 16:15 UTC (avoid BST)
  })

  afterEach(() => {
    Date.now.mockRestore()
  })

  describe('cell history for offender', () => {
    beforeEach(() => {
      prisonApi.getAgencyDetails = jest
        .fn()
        .mockResolvedValueOnce({ agencyId: 'MDI', description: 'Moorland' })
        .mockResolvedValueOnce({ agencyId: 'RNI', description: 'Ranby' })
      prisonApi.getInmatesAtLocation.mockResolvedValue([
        { bookingId: '144', firstName: 'Another', lastName: 'Offender', offenderNo: 'B12345' },
      ])
      prisonApi.getStaffDetails
        .mockResolvedValueOnce({ firstName: 'Staff', lastName: 'Two', username: 'STAFF_2' })
        .mockResolvedValueOnce({ firstName: 'Staff', lastName: 'Three', username: 'STAFF_3' })
        .mockResolvedValue({ firstName: 'Staff', lastName: 'One', username: 'STAFF_1' })
    })

    it('should make the expected API calls', async () => {
      await controller(req, res)

      expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
      expect(prisonApi.getOffenderCellHistory).toHaveBeenCalledWith(res.locals, bookingId, { page: 0, size: 10000 })
      expect(prisonApi.getAgencyDetails.mock.calls.length).toBe(2)
      expect(prisonApi.getStaffDetails.mock.calls.length).toBe(5)
      expect(prisonApi.getStaffDetails).toHaveBeenCalledWith(res.locals, 'STAFF_1')
      expect(prisonApi.getStaffDetails).toHaveBeenCalledWith(res.locals, 'STAFF_2')
      expect(prisonApi.getStaffDetails).toHaveBeenCalledWith(res.locals, 'STAFF_3')
      expect(prisonApi.getInmatesAtLocation).toHaveBeenCalledWith(res.locals, 1, {})
    })

    it('sends the right data to the template', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerCellHistory.njk', {
        breadcrumbPrisonerName: 'Smith, John',
        canViewCellMoveButton: false,
        cellHistoryGroupedByAgency: [
          {
            name: 'Moorland',
            datePeriod: 'from 01/03/2020 to 01/05/2020',
            cellHistory: [
              {
                agencyId: 'MDI',
                assignmentDateTime: '2020-04-01T12:48:33',
                assignmentEndDateTime: '2020-05-01T12:48:33',
                establishment: 'Moorland',
                establishmentWithAgencyLeaveDate: 'Moorland2020-05-01T12:48:33',
                livingUnitId: 2,
                isTemporaryLocation: false,
                location: '1-03',
                movedInBy: 'Staff Three',
                movedIn: '01/04/2020 - 12:48',
                movedOut: '01/05/2020 - 12:48',
              },
              {
                agencyId: 'MDI',
                assignmentDateTime: '2020-03-01T12:48:33',
                assignmentEndDateTime: '2020-04-01T12:48:33',
                establishment: 'Moorland',
                establishmentWithAgencyLeaveDate: 'Moorland2020-05-01T12:48:33',
                livingUnitId: 2,
                isTemporaryLocation: true,
                location: 'Reception',
                movedInBy: 'Staff Three',
                movedIn: '01/03/2020 - 12:48',
                movedOut: '01/04/2020 - 12:48',
              },
            ],
          },
          {
            name: 'Ranby',
            datePeriod: 'from 01/02/2020 to Unknown',
            cellHistory: [
              {
                agencyId: 'RNI',
                assignmentDateTime: '2020-02-01T12:48:33',
                assignmentEndDateTime: undefined,
                establishment: 'Ranby',
                establishmentWithAgencyLeaveDate: 'Ranbyundefined',
                livingUnitId: 3,
                isTemporaryLocation: false,
                location: '1-03',
                movedInBy: 'Staff Two',
                movedIn: '01/02/2020 - 12:48',
                movedOut: undefined,
              },
            ],
          },
          {
            name: 'Moorland',
            datePeriod: 'from 01/01/2020 to 01/02/2020',
            cellHistory: [
              {
                agencyId: 'MDI',
                assignmentDateTime: '2020-01-01T11:48:33',
                assignmentEndDateTime: '2020-02-01T11:48:33',
                establishment: 'Moorland',
                establishmentWithAgencyLeaveDate: 'Moorland2020-02-01T11:48:33',
                livingUnitId: 1,
                isTemporaryLocation: false,
                location: '1-01',
                movedInBy: 'Staff One',
                movedIn: '01/01/2020 - 11:48',
                movedOut: '01/02/2020 - 11:48',
              },
            ],
          },
        ],
        changeCellLink: '/prisoner/ABC123/cell-move/search-for-cell',
        currentLocation: {
          agencyId: 'MDI',
          assignmentDateTime: '2020-05-01T12:48:33',
          assignmentEndDateTime: '2020-10-29T16:15:00',
          establishment: 'Moorland',
          livingUnitId: 1,
          isTemporaryLocation: false,
          location: '1-02',
          movedIn: '01/05/2020 - 12:48',
          movedInBy: 'Staff One',
        },
        occupants: [{ name: 'Offender, Another', profileUrl: '/prisoner/B12345' }],
        prisonerName: 'John Smith',
        profileUrl: '/prisoner/ABC123',
      })
    })

    it('sets the cell move correctly if role exists', async () => {
      oauthApi.userRoles = jest.fn().mockReturnValue([{ roleCode: 'CELL_MOVE' }])
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerCellHistory.njk',
        expect.objectContaining({
          canViewCellMoveButton: true,
        })
      )
    })
  })
})
