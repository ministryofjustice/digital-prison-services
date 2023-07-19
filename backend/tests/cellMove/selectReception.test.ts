import selectReceptionFactory from '../../controllers/cellMove/selectReception'

const someOffenderNumber = 'A12345'
const someBookingId = -10
const someAgency = 'LEI'

describe('Select reception', () => {
  const prisonApi = {
    userCaseLoads: jest.fn(),
    getDetails: jest.fn(),
    getCsraAssessments: jest.fn(),
    getAlerts: jest.fn(),
    getLocation: jest.fn(),
    getCellsWithCapacity: jest.fn(),
    getInmatesAtLocation: jest.fn(),
    getReceptionsWithCapacity: jest.fn(),
    getNonAssociations: jest.fn(),
  }

  const nonAssociationsApi = {
    getNonAssociations: jest.fn(),
  }

  const whereaboutsApi = {
    getCellsWithCapacity: jest.fn(),
    searchGroups: jest.fn(),
  }
  const oauthApi = {
    userRoles: jest.fn(),
  }

  const res = { locals: {}, render: jest.fn() }
  let controller
  let req

  res.render = jest.fn()

  beforeEach(() => {
    oauthApi.userRoles = jest.fn().mockReturnValue([{ roleCode: 'CELL_MOVE' }])
    prisonApi.userCaseLoads = jest.fn().mockResolvedValue([{ caseLoadId: 'LEI' }])
    prisonApi.getDetails = jest.fn().mockResolvedValue({
      firstName: 'John',
      lastName: 'Doe',
      offenderNo: someOffenderNumber,
      bookingId: someBookingId,
      agencyId: someAgency,
      alerts: [],
    })

    prisonApi.getLocation = jest.fn().mockResolvedValue({})
    prisonApi.getCellsWithCapacity = jest.fn().mockResolvedValue([])
    prisonApi.getInmatesAtLocation = jest.fn().mockResolvedValue([])
    prisonApi.getReceptionsWithCapacity = jest.fn().mockResolvedValue([
      {
        id: 1234,
        description: 'ABC-RECP',
        capacity: 100,
        noOfOccupants: 96,
        attributes: [],
      },
    ])

    whereaboutsApi.searchGroups = jest.fn().mockResolvedValue([
      {
        name: 'Houseblock 1',
        key: 'hb1',
        children: [{ name: 'Sub value', key: 'sl' }],
      },
    ])

    controller = selectReceptionFactory({ oauthApi, prisonApi, whereaboutsApi, nonAssociationsApi })

    req = {
      params: {
        offenderNo: someOffenderNumber,
      },
      query: {},
      session: {
        userDetails: {
          activeCaseLoadId: 'LEI',
        },
      },
    }
  })

  describe('Default page state', () => {
    it('Redirects when offender not in user caseloads', async () => {
      prisonApi.userCaseLoads = jest.fn().mockResolvedValue([{ caseLoadId: 'BWY' }])
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('notFound.njk', { url: '/prisoner-search' })
    })

    it('should populate view model with reception location details', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/selectReception.njk',
        expect.objectContaining({
          cells: [
            {
              attributes: [],
              capacity: 100,
              description: 'ABC-RECP',
              id: 1234,
              noOfOccupants: 96,
              occupants: [],
              spaces: 4,
              type: false,
            },
          ],
        })
      )
    })
  })
})
