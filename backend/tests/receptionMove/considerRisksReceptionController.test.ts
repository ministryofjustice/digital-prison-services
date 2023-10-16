import considerRisksReception from '../../controllers/receptionMove/considerRisksReception'

const someOffenderNumber = 'A12345'
const someBookingId = -10
const someAgency = 'LEI'

const oauthApi = {
  userRoles: jest.fn(),
}

const prisonApi = {
  getDetails: jest.fn(),
  getCsraAssessments: jest.fn(),
  userCaseLoads: jest.fn(),
}

const movementsService = {
  getOffendersInReception: jest.fn(),
  getCsraForMultipleOffenders: jest.fn(),
}

const nonAssociationsApi = {
  getNonAssociationsLegacy: jest.fn(),
}

describe('Consider risks reception', () => {
  const res = { locals: { homeUrl: `prisoner/${someOffenderNumber}` }, redirect: jest.fn(), render: jest.fn() }
  let controller
  let req

  afterEach(() => {
    jest.clearAllMocks()
  })

  beforeEach(() => {
    oauthApi.userRoles.mockReturnValue([{ roleCode: 'CELL_MOVE' }])

    prisonApi.getDetails.mockResolvedValue({
      offenderNo: someOffenderNumber,
      bookingId: someBookingId,
      firstName: 'John ',
      lastName: 'Doe',
      alertsCodes: [],
      alerts: [],
      assignedLivingUnit: { description: 'Cell-1' },
      assessments: [],
      agencyId: 'LEI',
    })
    prisonApi.userCaseLoads.mockResolvedValue([{ caseLoadId: 'LEI' }])
    prisonApi.getCsraAssessments.mockResolvedValue([{}])

    movementsService.getOffendersInReception.mockResolvedValue([])
    movementsService.getCsraForMultipleOffenders.mockResolvedValue([{}])
    nonAssociationsApi.getNonAssociationsLegacy.mockResolvedValue({
      nonAssociations: [],
    })

    res.render = jest.fn()

    req = {
      params: {
        offenderNo: someOffenderNumber,
      },
      flash: jest.fn(),
      query: {},
      session: {
        userDetails: {
          activeCaseLoadId: someAgency,
        },
      },
    }

    controller = considerRisksReception({ oauthApi, prisonApi, movementsService, nonAssociationsApi })
  })

  describe('page', () => {
    it('should make the correct api calls', async () => {
      await controller.view(req, res)
      expect(prisonApi.getDetails).toHaveBeenNthCalledWith(
        1,
        { homeUrl: `prisoner/${someOffenderNumber}` },
        someOffenderNumber,
        true
      )
      expect(prisonApi.getDetails).toHaveBeenNthCalledWith(
        2,
        { homeUrl: `prisoner/${someOffenderNumber}` },
        undefined,
        true
      )
      expect(prisonApi.getCsraAssessments).toHaveBeenCalledWith({ homeUrl: `prisoner/${someOffenderNumber}` }, [
        someOffenderNumber,
      ])
      expect(movementsService.getCsraForMultipleOffenders).toHaveBeenCalledWith(
        { homeUrl: `prisoner/${someOffenderNumber}` },
        []
      )
      expect(nonAssociationsApi.getNonAssociationsLegacy).toHaveBeenCalledWith(
        { homeUrl: `prisoner/${someOffenderNumber}` },
        someOffenderNumber
      )
    })

    it('should populate view model with prisoner details', async () => {
      await controller.view(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'receptionMoves/considerRisksReception.njk',
        expect.objectContaining({
          prisonerAlerts: [],
          prisonerDetails: {
            alerts: [],
            alertsCodes: [],
            assessments: [],
            assignedLivingUnit: { description: 'Cell-1' },
            bookingId: -10,
            firstName: 'John ',
            lastName: 'Doe',
            offenderNo: 'A12345',
            agencyId: 'LEI',
          },
          reverseOrderPrisonerName: 'Doe, John',
          nonAssociationsRows: [],
          offendersInReception: [],
          inReceptionCount: '0 people in reception',
        })
      )
    })
    it('should populate view model with other prisoners in reception', async () => {
      movementsService.getOffendersInReception.mockResolvedValue([
        {
          offenderNo: 'A123',
          firstName: 'Max',
          lastName: 'Mercedes',

          alerts: [],
        },
        {
          offenderNo: 'B123',
          firstName: 'Jack',
          lastName: 'Simpson',
          alerts: [],
        },
      ])
      await controller.view(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'receptionMoves/considerRisksReception.njk',
        expect.objectContaining({
          inReceptionCount: '2 people in reception',
          offendersInReception: [
            {
              alerts: [],
              csraClassification: 'Not entered',
              displayCsraLink: undefined,
              name: 'Mercedes, Max',
              nonAssociation: false,
              offenderNo: 'A123',
            },
            {
              alerts: [],
              csraClassification: 'Not entered',
              displayCsraLink: undefined,
              name: 'Simpson, Jack',
              nonAssociation: false,
              offenderNo: 'B123',
            },
          ],
        })
      )
    })

    it('should populate view model with correct urls', async () => {
      prisonApi.getCsraAssessments.mockResolvedValue([
        { assessmentDate: ' 2020-10-10T10:00', assessmentComment: 'comment 1' },
      ])
      await controller.view(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'receptionMoves/considerRisksReception.njk',
        expect.objectContaining({
          backUrl: '/prisoners/A12345/location-details',
          csraDetailsUrl: '/prisoner/A12345/cell-move/cell-sharing-risk-assessment-details',
          displayLinkToPrisonersMostRecentCsra: 'comment 1',
          nonAssociationLink: '/prisoner/A12345/cell-move/non-associations',
          offenderDetailsUrl: '/prisoner/A12345/cell-move/prisoner-details',
          searchForCellRootUrl: '/prisoner/A12345/cell-move/search-for-cell',
        })
      )
    })

    it('should not flash errors', async () => {
      req.body = { considerRisksReception: 'yes' }
      await controller.submit(req, res)
      expect(req.flash).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${someOffenderNumber}/reception-move/confirm-reception-move`)
    })
    it('should flash errors', async () => {
      req.body = {}
      await controller.submit(req, res)
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#considerRisksReception', text: 'Select yes or no' }])
      expect(res.redirect).toHaveBeenCalledWith(
        `/prisoner/${someOffenderNumber}/reception-move/consider-risks-reception`
      )
    })

    it('should redirect to previous page', async () => {
      req.body = { considerRisksReception: 'no' }
      await controller.submit(req, res)
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${someOffenderNumber}/location-details`)
    })

    it('should throw error when call to upstream api rejects', async () => {
      const error = new Error('Network error')
      movementsService.getCsraForMultipleOffenders.mockRejectedValue(error)
      await expect(controller.view(req, res)).rejects.toThrowError(error)
      expect(res.locals.homeUrl).toBe(`/prisoner/${someOffenderNumber}`)
    })
  })
})
