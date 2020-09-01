const prisonerSearchController = require('../controllers/search/prisonerSearch')
const { serviceUnavailableMessage } = require('../common-messages')

const { makeResetError, makeResetErrorWithStack } = require('./helpers')

describe('Prisoner search', () => {
  const elite2Api = {}
  const paginationService = {}

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = {
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost'),
      baseUrl: '/prisoner-search',
      originalUrl: '/prisoner-search',
      query: {},
      body: { sortFieldsWithOrder: 'lastName,firstName:ASC ' },
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
    }

    logError = jest.fn()

    elite2Api.userLocations = jest.fn().mockReturnValue([
      {
        locationId: 1,
        locationType: 'INST',
        description: 'Moorland (HMP & YOI)',
        agencyId: 'MDI',
        locationPrefix: 'MDI',
      },
      {
        locationId: 2,
        locationType: 'WING',
        description: 'Houseblock 1',
        agencyId: 'MDI',
        locationPrefix: 'MDI-1',
        userDescription: 'Houseblock 1',
      },
      {
        locationId: 3,
        locationType: 'WING',
        description: 'Houseblock 2',
        agencyId: 'MDI',
        locationPrefix: 'MDI-2',
        userDescription: 'Houseblock 2',
      },
    ])
    elite2Api.getInmates = jest.fn().mockReturnValue([])

    paginationService.getPagination = jest.fn()

    controller = prisonerSearchController({ paginationService, elite2Api, logError })
  })

  describe('index', () => {
    it('should make a call for the users current caseload locations', async () => {
      await controller.index(req, res)

      expect(elite2Api.userLocations).toHaveBeenCalledWith(res.locals)
    })

    it('should request the current users active case load prisoners if no location specified in the query', async () => {
      await controller.index(req, res)

      expect(elite2Api.getInmates).toHaveBeenCalledWith(
        {
          ...res.locals,
          requestHeaders: {
            'Page-Limit': 50,
            'Page-Offset': 0,
            'Sort-Fields': 'lastName,firstName',
            'Sort-Order': 'ASC',
          },
        },
        'MDI',
        { alerts: undefined, keywords: undefined, returnAlerts: 'true', returnCategory: 'true', returnIep: 'true' }
      )
    })

    it('should render the prisoner search template with the correct alert, location options and notm url', async () => {
      await controller.index(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerSearch/prisonerSearch.njk',
        expect.objectContaining({
          alertOptions: [
            { checked: false, text: 'ACCT open', value: ['HA'] },
            { checked: false, text: 'ACCT post closure', value: ['HA1'] },
            { checked: false, text: 'Arsonist', value: ['XA'] },
            { checked: false, text: 'Care experienced', value: ['LCE'] },
            { checked: false, text: 'Chemical attacker', value: ['XCA'] },
            { checked: false, text: 'Concerted indiscipline', value: ['XCI'] },
            { checked: false, text: 'Conflict', value: ['RCON'] },
            { checked: false, text: 'Controlled unlock', value: ['XCU'] },
            { checked: false, text: 'Corruptor', value: ['XCO'] },
            { checked: false, text: 'CSIP', value: ['CSIP'] },
            { checked: false, text: 'E-list', value: ['XEL'] },
            { checked: false, text: 'Gang member', value: ['XGANG'] },
            { checked: false, text: 'Hostage taker', value: ['XHT'] },
            { checked: false, text: 'No one-to-one', value: ['RNO121'] },
            { checked: false, text: 'PEEP', value: ['PEEP'] },
            { checked: false, text: 'Protective Isolation Unit', value: ['UPIU'] },
            { checked: false, text: 'Quarantined', value: ['RCDR'] },
            { checked: false, text: 'Racist', value: ['XR'] },
            { checked: false, text: 'Refusing to shield', value: ['URS'] },
            { checked: false, text: 'Reverse Cohorting Unit', value: ['URCU'] },
            { checked: false, text: 'Risk to females', value: ['XRF'] },
            { checked: false, text: 'Risk to LGBT', value: ['RTP', 'RLG'] },
            { checked: false, text: 'Shielding Unit', value: ['USU'] },
            { checked: false, text: 'Staff assaulter', value: ['XSA'] },
            { checked: false, text: 'TACT', value: ['XTACT'] },
            { checked: false, text: 'Veteran', value: ['F1'] },
          ],
          locationOptions: [
            { text: 'Moorland (HMP & YOI)', value: 'MDI' },
            { text: 'Houseblock 1', value: 'MDI-1' },
            { text: 'Houseblock 2', value: 'MDI-2' },
          ],
          notmUrl: 'http://localhost:3000/',
        })
      )

      expect(res.render).toHaveBeenCalledWith(
        'prisonerSearch/prisonerSearch.njk',
        expect.objectContaining({
          alertOptions: expect.not.arrayContaining([
            { checked: false, text: 'Isolated', value: ['VIP'] },
            { checked: false, text: 'Risk to known adults', value: ['RKS'] },
          ]),
        })
      )
    })

    it('should return correctly checked alert options when there is only one alert in the query', async () => {
      req.query.alerts = ['HA']

      await controller.index(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerSearch/prisonerSearch.njk',
        expect.objectContaining({
          formValues: req.query,
          alertOptions: expect.arrayContaining([
            { checked: true, text: 'ACCT open', value: ['HA'] },
            { checked: false, text: 'ACCT post closure', value: ['HA1'] },
          ]),
          printedValues: { alerts: ['ACCT open'] },
        })
      )
    })

    it('should return correctly checked alert options when there are multiple alerts in the query', async () => {
      req.query.alerts = ['HA1', 'RTP,RLG']

      await controller.index(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerSearch/prisonerSearch.njk',
        expect.objectContaining({
          formValues: req.query,
          alertOptions: expect.arrayContaining([
            { checked: true, text: 'ACCT post closure', value: ['HA1'] },
            { checked: true, text: 'Risk to LGBT', value: ['RTP', 'RLG'] },
          ]),
          printedValues: { alerts: ['ACCT post closure', 'Risk to LGBT'] },
        })
      )
    })

    it('should return correctly checked alert option when one checkbox has multiple associated alert codes', async () => {
      req.query.alerts = ['RTP,RLG']

      await controller.index(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerSearch/prisonerSearch.njk',
        expect.objectContaining({
          formValues: req.query,
          alertOptions: expect.arrayContaining([{ checked: true, text: 'Risk to LGBT', value: ['RTP', 'RLG'] }]),
          printedValues: { alerts: ['Risk to LGBT'] },
        })
      )
    })

    it('should call pagination service and return the correctly formatted results', async () => {
      const inmates = [
        {
          bookingId: 1,
          offenderNo: 'A1234BC',
          firstName: 'JOHN',
          lastName: 'SAUNDERS',
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
          assignedLivingUnitDesc: 'UNIT-2',
          iepLevel: 'Standard',
          categoryCode: 'C',
          alertsDetails: ['RSS', 'XC'],
        },
      ]
      res.locals.responseHeaders['total-records'] = inmates.length
      elite2Api.getInmates = jest.fn().mockReturnValue(inmates)

      await controller.index(req, res)
      expect(paginationService.getPagination).toHaveBeenCalledWith(
        2,
        0,
        50,
        new URL('http://localhost/prisoner-search')
      )
      expect(res.render).toHaveBeenCalledWith(
        'prisonerSearch/prisonerSearch.njk',
        expect.objectContaining({
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
              lastName: 'SAUNDERS',
              name: 'Saunders, John',
              offenderNo: 'A1234BC',
            },
            {
              age: 30,
              agencyId: 'MDI',
              alerts: [],
              alertsDetails: ['RSS', 'XC'],
              assignedLivingUnitDesc: 'UNIT-2',
              assignedLivingUnitId: 2,
              bookingId: 2,
              categoryCode: 'C',
              dateOfBirth: '1989-11-12',
              firstName: 'STEVE',
              iepLevel: 'Standard',
              lastName: 'SMITH',
              name: 'Smith, Steve',
              offenderNo: 'B4567CD',
            },
          ],
          totalRecords: 2,
        })
      )
    })

    it('should render template with search url containing view type and printed values', async () => {
      req.baseUrl = '/prisoner-search'
      req.query = {
        alerts: ['HA', 'HA1'],
        keywords: 'Smith',
        location: 'MDI',
        view: 'grid',
      }

      await controller.index(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerSearch/prisonerSearch.njk',
        expect.objectContaining({
          searchUrl: '/prisoner-search?location=MDI&keywords=Smith&alerts%5B%5D=HA&alerts%5B%5D=HA1&pageOffsetOption=',
          view: 'grid',
          printedValues: {
            alerts: ['ACCT open', 'ACCT post closure'],
            location: { text: 'Moorland (HMP & YOI)', value: 'MDI' },
          },
        })
      )
    })

    it('should make make a call to get inmates using the specified search and sorting options', async () => {
      req.query = {
        alerts: ['HA1', 'RTP,RLG'],
        keywords: 'Smith',
        sortFieldsWithOrder: 'assignedLivingUnitDesc:DESC',
      }

      await controller.index(req, res)

      expect(elite2Api.getInmates).toHaveBeenCalledWith(
        {
          ...res.locals,
          requestHeaders: expect.objectContaining({
            'Sort-Fields': 'assignedLivingUnitDesc',
            'Sort-Order': 'DESC',
          }),
        },
        'MDI',
        {
          alerts: ['HA1', 'RTP', 'RLG'],
          keywords: 'Smith',
          returnAlerts: 'true',
          returnCategory: 'true',
          returnIep: 'true',
        }
      )
    })

    it('should render the error template if there is a problem', async () => {
      elite2Api.getInmates.mockImplementation(() => Promise.reject(new Error('Network error')))

      await controller.index(req, res)

      expect(logError).toHaveBeenCalledWith(req.originalUrl, new Error('Network error'), serviceUnavailableMessage)
      expect(res.render).toHaveBeenCalledWith('error.njk', { url: '/', homeUrl: '/' })
    })

    it('should not log connection reset API errors', async () => {
      elite2Api.getInmates.mockImplementation(() => Promise.reject(makeResetError()))

      await controller.index(req, res)

      expect(logError.mock.calls.length).toBe(0)
    })

    it('should not log connection reset API errors with timeout in stack', async () => {
      elite2Api.getInmates.mockImplementation(() => Promise.reject(makeResetErrorWithStack()))

      await controller.index(req, res)

      expect(logError.mock.calls.length).toBe(0)
    })

    it('should NOT set prisonerSearchUrl to the originalUrl if there has NOT been a search', async () => {
      await controller.index(req, res)

      expect(req.session).toEqual({})
    })

    it('should set prisonerSearchUrl to the originalUrl if there has been a search', async () => {
      req.query.alerts = ['HA']

      await controller.index(req, res)

      expect(req.session).toEqual({ prisonerSearchUrl: req.originalUrl })
    })

    it('should set the Page-Limit in the request header if pageLimitOption is specified in the url', async () => {
      req.query.pageLimitOption = '500'

      await controller.index(req, res)

      expect(elite2Api.getInmates).toHaveBeenCalledWith(
        expect.objectContaining({
          requestHeaders: expect.objectContaining({
            'Page-Limit': 500,
          }),
        }),
        'MDI',
        { alerts: undefined, keywords: undefined, returnAlerts: 'true', returnCategory: 'true', returnIep: 'true' }
      )
    })
  })

  describe('post', () => {
    it('should redirect with no alerts if there are no specified', async () => {
      await controller.post(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/prisoner-search?sortFieldsWithOrder=lastName%2CfirstName%3AASC%20')
    })

    it('should correctly redirect when there is a single alert specified', async () => {
      req.query.alerts = ['HA']

      await controller.post(req, res)

      expect(res.redirect).toHaveBeenCalledWith(
        '/prisoner-search?alerts%5B%5D=HA&sortFieldsWithOrder=lastName%2CfirstName%3AASC%20'
      )
    })

    it('should correctly redirect when there is are multiple alerts and keywords specified', async () => {
      req.query = {
        ...req.query,
        keywords: 'Smith',
        alerts: ['HA', 'XR'],
      }

      await controller.post(req, res)

      expect(res.redirect).toHaveBeenCalledWith(
        '/prisoner-search?keywords=Smith&alerts%5B%5D=HA&alerts%5B%5D=XR&sortFieldsWithOrder=lastName%2CfirstName%3AASC%20'
      )
    })
  })
})
