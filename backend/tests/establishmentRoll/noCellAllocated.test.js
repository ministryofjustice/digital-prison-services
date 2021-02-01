const noCellAllocated = require('../../controllers/establishmentRoll/noCellAllocated')

describe('No cell allocated', () => {
  const prisonApi = {}

  let req
  let res
  let controller

  beforeEach(() => {
    req = {
      originalUrl: 'http://localhost',
    }
    res = { locals: { user: { activeCaseLoad: { caseLoadId: 'MDI' } } }, render: jest.fn() }

    prisonApi.getInmatesAtLocationPrefix = jest.fn()
    prisonApi.getOffenderCellHistory = jest.fn()
    prisonApi.getDetails = jest.fn()
    prisonApi.getStaffDetails = jest.fn()

    controller = noCellAllocated({ prisonApi })
  })

  describe('with no data', () => {
    beforeEach(() => {
      prisonApi.getInmatesAtLocationPrefix.mockResolvedValue([])
    })

    it('should make the expected calls', async () => {
      await controller(req, res)

      expect(prisonApi.getInmatesAtLocationPrefix).toHaveBeenCalled()
      expect(prisonApi.getOffenderCellHistory).not.toHaveBeenCalled()
      expect(prisonApi.getDetails).not.toHaveBeenCalled()
      expect(prisonApi.getStaffDetails).not.toHaveBeenCalled()
    })

    it('should render the template with the correct data', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('establishmentRoll/noCellAllocated.njk', {
        results: [],
      })
    })
  })

  describe('with data', () => {
    beforeEach(() => {
      prisonApi.getInmatesAtLocationPrefix.mockResolvedValue([
        {
          bookingId: 1201093,
          bookingNo: '38508A',
          offenderNo: 'A7777DY',
          firstName: 'TOMMY',
          lastName: 'BIGGLES',
          dateOfBirth: '1970-01-01',
          age: 51,
          agencyId: 'MDI',
          assignedLivingUnitId: 722023,
          assignedLivingUnitDesc: 'CSWAP',
          convictedStatus: 'Convicted',
          imprisonmentStatus: 'ADIMP_ORA20',
          alertsCodes: [],
          alertsDetails: [],
          legalStatus: 'SENTENCED',
        },
        {
          bookingId: 1055111,
          bookingNo: 'V38990',
          offenderNo: 'G4081UT',
          firstName: 'BUCK',
          middleName: 'KEVETRIA',
          lastName: 'BINNALL',
          dateOfBirth: '1992-12-03',
          age: 28,
          agencyId: 'MDI',
          assignedLivingUnitId: 25800,
          assignedLivingUnitDesc: '3-1-029',
          facialImageId: 3668602,
          convictedStatus: 'Convicted',
          imprisonmentStatus: 'SENT03',
          alertsCodes: [],
          alertsDetails: [],
          legalStatus: 'SENTENCED',
        },
      ])
      prisonApi.getOffenderCellHistory.mockResolvedValue({
        content: [
          {
            bookingId: 1201093,
            livingUnitId: 3979,
            assignmentDate: '2015-11-13',
            assignmentDateTime: '2015-11-13T16:53:11',
            assignmentEndDate: '2015-11-13',
            assignmentEndDateTime: '2015-11-13T16:56:26',
            agencyId: 'MDI',
            description: 'MDI-RECP',
            bedAssignmentHistorySequence: 1,
            movementMadeBy: 'ZQH07Y',
          },
          {
            bookingId: 1201093,
            livingUnitId: 391874,
            assignmentDate: '2015-11-13',
            assignmentDateTime: '2015-11-13T16:56:26',
            assignmentReason: 'ADM',
            assignmentEndDate: '2015-11-13',
            assignmentEndDateTime: '2015-11-13T22:50:02',
            agencyId: 'MDI',
            description: 'MDI-CSWAP',
            bedAssignmentHistorySequence: 2,
            movementMadeBy: 'ZQH07Y',
          },
        ],
      })
      prisonApi.getDetails.mockResolvedValue({
        bookingId: 1201093,
        firstName: 'TOMMY',
        lastName: 'BIGGLES',
      })
      prisonApi.getStaffDetails.mockResolvedValue({ firstName: 'Barry', lastName: 'Smith' })
    })

    it('should make the expected calls', async () => {
      await controller(req, res)

      expect(prisonApi.getInmatesAtLocationPrefix).toHaveBeenCalled()
      expect(prisonApi.getOffenderCellHistory).toHaveBeenCalledTimes(1)
      expect(prisonApi.getOffenderCellHistory).toHaveBeenCalledWith(res.locals, 1201093, {
        page: 0,
        size: 10000,
      })
      expect(prisonApi.getDetails).toHaveBeenCalledTimes(1)
      expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, 'A7777DY')
      expect(prisonApi.getStaffDetails).toHaveBeenCalledTimes(1)
      expect(prisonApi.getStaffDetails).toHaveBeenCalledWith(res.locals, 'ZQH07Y')
    })

    it('should render the template with the correct data', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('establishmentRoll/noCellAllocated.njk', {
        results: [
          {
            movedBy: 'Barry Smith',
            name: 'Biggles, Tommy',
            offenderNo: 'A7777DY',
            previousCell: 'RECP',
            timeOut: '16:56',
          },
        ],
      })
    })
  })

  describe('when there are errors', () => {
    it('set the redirect url and throw the error', async () => {
      const error = new Error('Network error')
      prisonApi.getInmatesAtLocationPrefix.mockRejectedValue(error)

      await expect(controller(req, res)).rejects.toThrowError(error)
      expect(res.locals.redirectUrl).toBe('/establishment-roll')
    })
  })
})
