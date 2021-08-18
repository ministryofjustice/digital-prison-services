import noCellAllocated from '../../controllers/establishmentRoll/noCellAllocated'

describe('No cell allocated', () => {
  const prisonApi = {}
  const oauthApi = {}
  const systemOauthClient = {}

  const credentialsRef = { token: 'example' }

  let req
  let res
  let controller

  beforeEach(() => {
    req = {
      originalUrl: 'http://localhost',
    }
    res = { locals: { user: { activeCaseLoad: { caseLoadId: 'MDI' } } }, render: jest.fn() }

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
    systemOauthClient.getClientCredentialsTokens = jest.fn().mockResolvedValue(credentialsRef)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getInmatesAtLocationPrefix' does not exi... Remove this comment to see the full error message
    prisonApi.getInmatesAtLocationPrefix = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderCellHistory' does not exist o... Remove this comment to see the full error message
    prisonApi.getOffenderCellHistory = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisoners' does not exist on type '{}... Remove this comment to see the full error message
    prisonApi.getPrisoners = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getUserDetailsList' does not exist on ty... Remove this comment to see the full error message
    prisonApi.getUserDetailsList = jest.fn()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
    oauthApi.userRoles = jest.fn()

    controller = noCellAllocated({ oauthApi, systemOauthClient, prisonApi })
  })

  describe('with no data', () => {
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
      oauthApi.userRoles.mockResolvedValue([])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getInmatesAtLocationPrefix' does not exi... Remove this comment to see the full error message
      prisonApi.getInmatesAtLocationPrefix.mockResolvedValue([])
    })

    it('should make the expected calls', async () => {
      await controller(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
      expect(oauthApi.userRoles).toHaveBeenCalled()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getInmatesAtLocationPrefix' does not exi... Remove this comment to see the full error message
      expect(prisonApi.getInmatesAtLocationPrefix).toHaveBeenCalled()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisoners' does not exist on type '{}... Remove this comment to see the full error message
      expect(prisonApi.getPrisoners).not.toHaveBeenCalled()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderCellHistory' does not exist o... Remove this comment to see the full error message
      expect(prisonApi.getOffenderCellHistory).not.toHaveBeenCalled()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getUserDetailsList' does not exist on ty... Remove this comment to see the full error message
      expect(prisonApi.getUserDetailsList).not.toHaveBeenCalled()
    })

    it('should render the template with the correct data', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('establishmentRoll/noCellAllocated.njk', {
        results: [],
        userCanAllocateCell: false,
      })
    })
  })

  describe('with data', () => {
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
      oauthApi.userRoles.mockResolvedValue([{ roleCode: 'CELL_MOVE' }])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getInmatesAtLocationPrefix' does not exi... Remove this comment to see the full error message
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
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisoners' does not exist on type '{}... Remove this comment to see the full error message
      prisonApi.getPrisoners.mockResolvedValue([
        {
          offenderNo: 'A7777DY',
          latestBookingId: 1201093,
          firstName: 'TOMMY',
          lastName: 'BIGGLES',
        },
      ])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderCellHistory' does not exist o... Remove this comment to see the full error message
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
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getUserDetailsList' does not exist on ty... Remove this comment to see the full error message
      prisonApi.getUserDetailsList.mockResolvedValue([{ username: 'ZQH07Y', firstName: 'Barry', lastName: 'Smith' }])
    })

    it('should make the expected calls', async () => {
      await controller(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getInmatesAtLocationPrefix' does not exi... Remove this comment to see the full error message
      expect(prisonApi.getInmatesAtLocationPrefix).toHaveBeenCalled()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderCellHistory' does not exist o... Remove this comment to see the full error message
      expect(prisonApi.getOffenderCellHistory).toHaveBeenCalledTimes(1)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderCellHistory' does not exist o... Remove this comment to see the full error message
      expect(prisonApi.getOffenderCellHistory).toHaveBeenCalledWith(res.locals, 1201093, {
        page: 0,
        size: 10000,
      })

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
      expect(systemOauthClient.getClientCredentialsTokens).toHaveBeenCalledTimes(1)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisoners' does not exist on type '{}... Remove this comment to see the full error message
      expect(prisonApi.getPrisoners).toHaveBeenCalledTimes(1)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisoners' does not exist on type '{}... Remove this comment to see the full error message
      expect(prisonApi.getPrisoners).toHaveBeenCalledWith(
        { ...credentialsRef, requestHeaders: { 'page-offset': 0, 'page-limit': 2000 } },
        { offenderNos: ['A7777DY'] }
      )
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getUserDetailsList' does not exist on ty... Remove this comment to see the full error message
      expect(prisonApi.getUserDetailsList).toHaveBeenCalledTimes(1)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getUserDetailsList' does not exist on ty... Remove this comment to see the full error message
      expect(prisonApi.getUserDetailsList).toHaveBeenCalledWith(res.locals, ['ZQH07Y'])
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
        userCanAllocateCell: true,
      })
    })
  })

  describe('when there are errors', () => {
    it('set the redirect url and throw the error', async () => {
      const error = new Error('Network error')
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getInmatesAtLocationPrefix' does not exi... Remove this comment to see the full error message
      prisonApi.getInmatesAtLocationPrefix.mockRejectedValue(error)

      await expect(controller(req, res)).rejects.toThrowError(error)
      expect(res.locals.redirectUrl).toBe('/establishment-roll')
    })
  })
})
