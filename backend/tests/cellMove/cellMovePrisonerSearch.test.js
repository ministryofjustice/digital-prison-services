const prisonerSearchController = require('../../controllers/cellMove/cellMovePrisonerSearch')

describe('Prisoner search', () => {
  const prisonApi = {}

  let req
  let res
  let controller

  beforeEach(() => {
    req = {
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost'),
      baseUrl: '/change-someones-cell/prisoner-search',
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

    prisonApi.getInmates = jest.fn().mockReturnValue([])

    controller = prisonerSearchController({ prisonApi })
  })

  describe('index', () => {
    it('should make make a call to get inmates using current active caseload and the specified search terms', async () => {
      req.query = {
        keywords: 'Smith',
      }

      await controller(req, res)

      expect(prisonApi.getInmates).toHaveBeenCalledWith(
        {
          ...res.locals,
          requestHeaders: expect.objectContaining({
            'Page-Limit': '5000',
            'Sort-Fields': 'lastName,firstName',
            'Sort-Order': 'ASC',
          }),
        },
        'MDI',
        {
          keywords: 'Smith',
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
        keywords: 'Smith',
      }

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/cellMovePrisonerSearch.njk',
        expect.objectContaining({
          showResults: true,
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
              offenderNo: 'A1234BC',
              cellHistoryUrl: '/prisoner/A1234BC/cell-history',
              cellSearchUrl: '/prisoner/A1234BC/cell-move/search-for-cell?returnUrl=/change-someones-cell',
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
              offenderNo: 'B4567CD',
              cellHistoryUrl: '/prisoner/B4567CD/cell-history',
              cellSearchUrl: '/prisoner/B4567CD/cell-move/search-for-cell?returnUrl=/change-someones-cell',
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
        'cellMove/cellMovePrisonerSearch.njk',
        expect.objectContaining({
          showResults: false,
          errors: [],
        })
      )
    })

    it('should render template with error when searched without keywords', async () => {
      req.query = {
        keywords: '',
      }

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/cellMovePrisonerSearch.njk',
        expect.objectContaining({
          showResults: false,
          errors: [
            {
              href: '#keywords',
              html: 'Enter a prisoner&#8217;s name or number',
            },
          ],
        })
      )
    })
  })
})
