import considerRisksReception from '../../controllers/receptionMove/considerRisksReception'
import logger from '../../log'

jest.mock('../../log')

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
  getReceptionsWithCapacity: jest.fn(),
  getOffendersInReception: jest.fn(),
}

const movementsService = {
  getOffendersInReception: jest.fn(),
  getCsraForMultipleOffenders: jest.fn(),
}

const nonAssociationsApi = {
  getNonAssociationsLegacy: jest.fn(),
}

const logError = jest.fn()
logger.info = jest.fn()

const res = { locals: { homeUrl: `prisoner/${someOffenderNumber}` }, redirect: jest.fn(), render: jest.fn() }
let controller
let req

describe('Consider risks reception', () => {
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
    prisonApi.getReceptionsWithCapacity.mockResolvedValue([
      {
        capacity: 10,
        noOfOccupants: 9,
      },
    ])

    movementsService.getOffendersInReception.mockResolvedValue([])
    movementsService.getCsraForMultipleOffenders.mockResolvedValue([{}])
    nonAssociationsApi.getNonAssociationsLegacy.mockResolvedValue({
      nonAssociations: [],
    })

    res.render = jest.fn()

    req = {
      originalUrl: 'original-url',
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

    controller = considerRisksReception({ oauthApi, prisonApi, movementsService, nonAssociationsApi, logError })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('page', () => {
    it('should make the correct api calls', async () => {
      movementsService.getOffendersInReception.mockResolvedValue([
        {
          offenderNo: someOffenderNumber,
          lastName: 'Smith',
          alerts: ['RDV', 'RKS', 'OIOM'],
        },
      ])

      await controller.view(req, res)
      expect(prisonApi.getDetails).toHaveBeenNthCalledWith(
        1,
        { homeUrl: `prisoner/${someOffenderNumber}` },
        someOffenderNumber,
        true
      )
      expect(prisonApi.getCsraAssessments).toHaveBeenCalledWith({ homeUrl: `prisoner/${someOffenderNumber}` }, [
        someOffenderNumber,
      ])
      expect(movementsService.getCsraForMultipleOffenders).toHaveBeenCalledWith(
        { homeUrl: `prisoner/${someOffenderNumber}` },
        ['A12345']
      )
      expect(nonAssociationsApi.getNonAssociationsLegacy).toHaveBeenCalledWith(
        { homeUrl: `prisoner/${someOffenderNumber}` },
        someOffenderNumber
      )
    })

    it('should redirect if reception already full', async () => {
      req.body = { considerRisksReception: 'yes' }
      prisonApi.getReceptionsWithCapacity.mockResolvedValue([])
      await controller.view(req, res)
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${someOffenderNumber}/reception-move/reception-full`)
      expect(logger.info).toBeCalledWith('Can not move to reception as already full to capacity')
    })

    it('should not request csras if no other offenders in reception', async () => {
      movementsService.getOffendersInReception.mockResolvedValue([])
      await controller.view(req, res)
      expect(movementsService.getCsraForMultipleOffenders).not.toHaveBeenCalled()
    })

    it('should check user has correct roles', async () => {
      oauthApi.userRoles.mockReturnValue([{ roleCode: 'SOME_OTHER_ROLE' }])
      await controller.view(req, res)
      expect(res.render).toHaveBeenCalledWith('notFound.njk', { url: '/prisoner-search' })
      expect(logger.info).toBeCalledWith('User does not have correct roles')
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
    it('should populate view model with correct text for one prisoners in reception', async () => {
      movementsService.getOffendersInReception.mockResolvedValue([
        {
          offenderNo: 'A123',
          firstName: 'Max',
          lastName: 'Mercedes',

          alerts: [],
        },
      ])
      await controller.view(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'receptionMoves/considerRisksReception.njk',
        expect.objectContaining({
          inReceptionCount: '1 person in reception',
          offendersInReception: [
            {
              alerts: [],
              csraClassification: 'Not entered',
              displayCsraLink: undefined,
              name: 'Mercedes, Max',
              nonAssociation: false,
              offenderNo: 'A123',
            },
          ],
        })
      )
    })
    it('should populate view model with other prisoners correctly when more than 1 prisoner in reception', async () => {
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
          backUrl: 'http://localhost:3000/prisoner/A12345/location-details',
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
      expect(res.redirect).toHaveBeenCalledWith(`http://localhost:3000/prisoner/${someOffenderNumber}/location-details`)
    })

    it('should throw error when call to upstream api rejects', async () => {
      const error = new Error('Network error')
      movementsService.getOffendersInReception.mockRejectedValue(error)
      await expect(controller.view(req, res)).rejects.toThrowError(error)
      expect(res.locals.homeUrl).toBe(`/prisoner/${someOffenderNumber}`)
      expect(logError).toHaveBeenCalledWith('original-url', error, 'error getting consider-risks-reception')
    })
  })
})
