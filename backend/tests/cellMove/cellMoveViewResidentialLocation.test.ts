import viewResidentialLocationController from '../../controllers/cellMove/cellMoveViewResidentialLocation'

describe('View Residential Location', () => {
  const prisonApi = {
    getInmates: jest.fn(),
  }
  const whereaboutsApi = {
    getAgencyGroupLocationPrefix: jest.fn(),
    searchGroups: jest.fn(),
  }

  const systemOauthClient = {
    getClientCredentialsTokens: jest.fn(),
  }

  let req
  let res
  let controller

  beforeEach(() => {
    req = {
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost'),
      baseUrl: '/change-someones-cell/view-residential-location',
      query: {},
      body: {},
      session: {},
    }
    res = {
      locals: {
        user: { activeCaseLoad: { caseLoadId: 'MDI' } },
        responseHeaders: {
          'total-records': 0,
        },
      },
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn(),
    }

    whereaboutsApi.searchGroups = jest.fn().mockReturnValue([
      {
        name: 'Houseblock 1',
        key: 'H 1',
      },
      {
        name: 'Houseblock 2',
        key: 'H 2',
      },
    ])

    whereaboutsApi.getAgencyGroupLocationPrefix = jest.fn().mockReturnValue({
      locationPrefix: '1',
    })

    prisonApi.getInmates = jest.fn().mockReturnValue([])

    controller = viewResidentialLocationController({ systemOauthClient, prisonApi, whereaboutsApi })
  })

  describe('index', () => {
    it('should make a call to whereabouts to get available locations', async () => {
      req.query = {}

      await controller(req, res)

      expect(whereaboutsApi.searchGroups).toHaveBeenCalledWith(
        {
          ...res.locals,
        },
        'MDI'
      )
    })

    it('should make a call to whereabouts to get location id from the location key', async () => {
      const locationValue = ''
      req.query = {
        location: locationValue,
      }

      await controller(req, res)

      expect(whereaboutsApi.getAgencyGroupLocationPrefix).toHaveBeenCalledWith(
        {
          ...res.locals,
        },
        `MDI`,
        locationValue
      )
    })

    it('should make a call to get inmates using shortened location prefix from whereabouts if present', async () => {
      whereaboutsApi.getAgencyGroupLocationPrefix = jest.fn().mockReturnValue({
        locationPrefix: 'MDI-1-',
      })

      req.query = {
        location: 'A location',
      }

      await controller(req, res)

      expect(prisonApi.getInmates).toHaveBeenCalledWith(
        {
          requestHeaders: expect.objectContaining({
            'Page-Limit': '5000',
            'Sort-Fields': 'lastName,firstName',
            'Sort-Order': 'ASC',
          }),
        },
        `MDI-1`,
        {
          returnAlerts: 'true',
        }
      )
    })

    it('should make a call to get inmates using location id built from case load and location key if whereabouts prefix not present', async () => {
      whereaboutsApi.getAgencyGroupLocationPrefix = jest.fn().mockReturnValue(null)

      req.query = {
        location: '1',
      }

      await controller(req, res)

      expect(prisonApi.getInmates).toHaveBeenCalledWith(
        {
          requestHeaders: expect.objectContaining({
            'Page-Limit': '5000',
            'Sort-Fields': 'lastName,firstName',
            'Sort-Order': 'ASC',
          }),
        },
        `MDI-1`,
        {
          returnAlerts: 'true',
        }
      )
    })

    it('should render template with correct data when searched', async () => {
      const inmates = [
        {
          bookingId: 1,
          offenderNo: 'A1234BC',
          firstName: 'JOHN',
          lastName: 'SMITH',
          dateOfBirth: '1990-10-12',
          age: 29,
          agencyId: 'MDI',
          assignedLivingUnitId: 1,
          assignedLivingUnitDesc: 'UNIT-1',
          iepLevel: 'Standard',
          categoryCode: 'C',
          alertsDetails: ['XA', 'XVL'],
        },
        {
          bookingId: 2,
          offenderNo: 'B4567CD',
          firstName: 'STEVE',
          lastName: 'SMITH',
          dateOfBirth: '1989-11-12',
          age: 30,
          agencyId: 'MDI',
          assignedLivingUnitId: 2,
          assignedLivingUnitDesc: 'CSWAP',
          iepLevel: 'Standard',
          categoryCode: 'C',
          alertsDetails: ['RSS', 'XC'],
        },
      ]
      prisonApi.getInmates = jest.fn().mockReturnValue(inmates)

      req.query = {
        location: 'H 1',
      }

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/cellMoveViewResidentialLocation.njk',
        expect.objectContaining({
          showResults: true,
          locationOptions: [
            {
              text: 'Select',
              value: 'SELECT',
            },
            {
              text: 'Houseblock 1',
              value: 'H 1',
            },
            {
              text: 'Houseblock 2',
              value: 'H 2',
            },
          ],
          results: [
            {
              age: 29,
              agencyId: 'MDI',
              alerts: [
                {
                  alertCodes: ['XA'],
                  classes: 'alert-status alert-status--arsonist',
                  img: '/images/Arsonist_icon.png',
                  label: 'Arsonist',
                },
              ],
              alertsDetails: ['XA', 'XVL'],
              assignedLivingUnitDesc: 'UNIT-1',
              assignedLivingUnitId: 1,
              bookingId: 1,
              categoryCode: 'C',
              dateOfBirth: '1990-10-12',
              firstName: 'JOHN',
              iepLevel: 'Standard',
              lastName: 'SMITH',
              name: 'Smith, John',
              formattedName: 'John Smith',
              offenderNo: 'A1234BC',
              cellHistoryUrl: `/prisoner/A1234BC/cell-history`,
              cellSearchUrl: `/prisoner/A1234BC/cell-move/search-for-cell`,
            },
            {
              age: 30,
              agencyId: 'MDI',
              alerts: [],
              alertsDetails: ['RSS', 'XC'],
              assignedLivingUnitDesc: 'No cell allocated',
              assignedLivingUnitId: 2,
              bookingId: 2,
              categoryCode: 'C',
              dateOfBirth: '1989-11-12',
              firstName: 'STEVE',
              iepLevel: 'Standard',
              lastName: 'SMITH',
              name: 'Smith, Steve',
              formattedName: 'Steve Smith',
              offenderNo: 'B4567CD',
              cellHistoryUrl: `/prisoner/B4567CD/cell-history`,
              cellSearchUrl: `/prisoner/B4567CD/cell-move/search-for-cell`,
            },
          ],
          totalOffenders: 2,
        })
      )
    })

    it('should render template without results when not searched', async () => {
      req.query = {}

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/cellMoveViewResidentialLocation.njk',
        expect.objectContaining({
          showResults: false,
          locationOptions: [
            {
              text: 'Select',
              value: 'SELECT',
            },
            {
              text: 'Houseblock 1',
              value: 'H 1',
            },
            {
              text: 'Houseblock 2',
              value: 'H 2',
            },
          ],
        })
      )
    })

    it('should render template with error when searched without keywords', async () => {
      req.query = {
        location: 'SELECT',
      }

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/cellMoveViewResidentialLocation.njk',
        expect.objectContaining({
          showResults: false,
          locationOptions: [
            {
              text: 'Select',
              value: 'SELECT',
            },
            {
              text: 'Houseblock 1',
              value: 'H 1',
            },
            {
              text: 'Houseblock 2',
              value: 'H 2',
            },
          ],
          errors: [
            {
              href: '#location',
              text: 'Select a residential location',
            },
          ],
        })
      )
    })
  })
})
