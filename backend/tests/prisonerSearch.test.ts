import type apis from '../apis'
import prisonerSearchController from '../controllers/search/prisonerSearch'
import { serviceUnavailableMessage } from '../common-messages'
import { makeResetError, makeResetErrorWithStack } from './helpers'

describe('Prisoner search', () => {
  const prisonApi = {
    userLocations: jest.fn(),
    getInmates: jest.fn(),
  }
  const offenderSearchApi = {
    establishmentSearch: jest.fn(),
  }
  const incentivesApi = {} as jest.Mocked<typeof apis.incentivesApi>
  const paginationService = {
    getPagination: jest.fn(),
  }
  const telemetry = {
    trackEvent: jest.fn(),
  }
  const systemOauthClient = {
    getClientCredentialsTokens: jest.fn(),
  }

  let req
  let res
  let logError
  let controller
  const systemContext = {
    token: 'system token',
  }

  beforeEach(() => {
    req = {
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost'),
      baseUrl: '/prisoner-search',
      originalUrl: '/prisoner-search',
      query: {},
      body: { sortFieldsWithOrder: 'lastName,firstName:ASC ' },
      session: {
        userDetails: {
          username: 'user1',
        },
      },
    }
    res = {
      locals: {
        user: { activeCaseLoad: { caseLoadId: 'MDI' }, allCaseloads: [{ caseLoadId: 'MDI' }, { caseLoadId: 'BXI' }] },
        responseHeaders: {
          'total-records': 0,
        },
      },
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn(),
    }

    logError = jest.fn()

    prisonApi.userLocations = jest.fn().mockReturnValue([
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
    prisonApi.getInmates = jest.fn().mockReturnValue([])

    paginationService.getPagination = jest.fn()

    telemetry.trackEvent = jest.fn().mockResolvedValue([])

    systemOauthClient.getClientCredentialsTokens = jest.fn().mockResolvedValue(systemContext)

    offenderSearchApi.establishmentSearch = jest.fn().mockReturnValue([])

    controller = prisonerSearchController({
      paginationService,
      prisonApi,
      incentivesApi,
      telemetry,
      logError,
      offenderSearchApi,
      systemOauthClient,
    })
  })

  describe('index', () => {
    beforeEach(() => {
      req = {
        ...req,
        query: { feature: 'new' },
      }
    })
    it('should make a call for the users current caseload locations', async () => {
      await controller.index(req, res)

      expect(prisonApi.userLocations).toHaveBeenCalledWith(res.locals)
    })

    it('should request the current users active case load prisoners if no location specified in the query', async () => {
      await controller.index(req, res)

      expect(offenderSearchApi.establishmentSearch).toHaveBeenCalledWith(expect.anything(), 'MDI', expect.anything())
    })

    it('should request with location when supplied in query', async () => {
      req.query.location = 'BXI'

      await controller.index(req, res)

      expect(offenderSearchApi.establishmentSearch).toHaveBeenCalledWith(expect.anything(), 'BXI', {})
    })

    it('should request with parsed location when supplied in query with dash to indicate partial match', async () => {
      req.query.location = 'BXI-B'

      await controller.index(req, res)

      expect(offenderSearchApi.establishmentSearch).toHaveBeenCalledWith(expect.anything(), 'BXI', {
        cellLocationPrefix: 'BXI-B-',
      })
    })

    it('should request with full location as cell prefix when supplied in query', async () => {
      req.query.location = 'BXI-B'

      await controller.index(req, res)

      expect(offenderSearchApi.establishmentSearch).toHaveBeenCalledWith(expect.anything(), 'BXI', expect.anything())
    })

    it('should not even make a request when location is not in any of the users caseload', async () => {
      req.query.location = 'FXI'

      await controller.index(req, res)

      expect(offenderSearchApi.establishmentSearch).toHaveBeenCalledTimes(0)
    })

    it('should not even make a request when location is not in any of the users caseloads', async () => {
      req.query.location = 'FXI'

      await controller.index(req, res)

      expect(offenderSearchApi.establishmentSearch).toHaveBeenCalledTimes(0)
    })

    it('should render the prisoner search template with the correct alert and location options', async () => {
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
            { checked: false, text: 'ViSOR', value: ['PVN'] },
          ],
          locationOptions: [
            { text: 'Moorland (HMP & YOI)', value: 'MDI' },
            { text: 'Houseblock 1', value: 'MDI-1' },
            { text: 'Houseblock 2', value: 'MDI-2' },
          ],
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

    it('should not send custom event as there arent any results', async () => {
      req.query = {
        alerts: ['HA', 'HA1'],
        keywords: 'Smith',
        location: 'MDI',
      }

      await controller.index(req, res)

      expect(telemetry.trackEvent).not.toHaveBeenCalled()
    })

    describe('with inmates returned', () => {
      beforeEach(() => {
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
            categoryCode: 'C',
            alertsDetails: ['XA', 'XVL'],
            currentIncentive: {
              level: {
                description: 'Standard',
              },
              dateTime: '2022-11-21T16:40:01',
              nextReviewDate: '2022-11-28',
            },
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
            categoryCode: 'C',
            alertsDetails: ['RSS', 'XC'],
            currentIncentive: {
              level: {
                description: 'Standard',
              },
              dateTime: '2022-11-21T16:40:01',
              nextReviewDate: '2022-11-28',
            },
          },
        ]
        offenderSearchApi.establishmentSearch = jest.fn().mockImplementation((context) => {
          // also mutate the context to emulate real service call
          context.responseHeaders = { 'total-records': inmates.length }
          return inmates
        })
      })

      it('should call pagination service and return the correctly formatted results', async () => {
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
              expect.objectContaining({
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
              }),
              expect.objectContaining({
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
              }),
            ],
            totalRecords: 2,
          })
        )
      })

      it('should send custom event with visible offender numbers, search terms, username and active caseload', async () => {
        req.query = {
          alerts: ['HA', 'HA1'],
          keywords: 'Smith',
          location: 'MDI',
          feature: 'new',
        }

        await controller.index(req, res)

        expect(telemetry.trackEvent).toHaveBeenCalledWith({
          name: 'PrisonerSearch',
          properties: {
            offenderNos: ['A1234BC', 'B4567CD'],
            filters: {
              alerts: ['HA', 'HA1'],
              keywords: 'Smith',
              location: 'MDI',
              feature: 'new',
            },
            username: 'user1',
            caseLoadId: 'MDI',
          },
        })
      })
    })

    it('should render template with correct urls containing view type and printed values', async () => {
      req.baseUrl = '/prisoner-search'
      req.query = {
        alerts: ['HA', 'HA1'],
        keywords: 'Smith',
        location: 'MDI',
        view: 'grid',
        feature: 'new',
      }

      await controller.index(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerSearch/prisonerSearch.njk',
        expect.objectContaining({
          links: {
            allResults:
              '/prisoner-search?alerts=HA&alerts=HA1&keywords=Smith&location=MDI&view=grid&feature=new&alerts%5B%5D=HA&alerts%5B%5D=HA1&viewAll=true&pageLimitOption=0',
            gridView:
              '/prisoner-search?alerts=HA&alerts=HA1&keywords=Smith&location=MDI&view=grid&feature=new&alerts%5B%5D=HA&alerts%5B%5D=HA1',
            listView:
              '/prisoner-search?alerts=HA&alerts=HA1&keywords=Smith&location=MDI&view=list&feature=new&alerts%5B%5D=HA&alerts%5B%5D=HA1',
          },
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
        feature: 'new',
      }

      await controller.index(req, res)

      expect(offenderSearchApi.establishmentSearch).toHaveBeenCalledWith(
        {
          ...systemContext,
          requestHeaders: expect.objectContaining({
            'sort-fields': 'assignedLivingUnitDesc',
            'sort-order': 'DESC',
          }),
        },
        'MDI',
        {
          alerts: ['HA1', 'RTP', 'RLG'],
          term: 'Smith',
        }
      )
    })

    it('should render the error template if there is a problem', async () => {
      offenderSearchApi.establishmentSearch.mockImplementation(() => Promise.reject(new Error('Network error')))

      await controller.index(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(logError).toHaveBeenCalledWith(req.originalUrl, new Error('Network error'), serviceUnavailableMessage)
      expect(res.render).toHaveBeenCalledWith('error.njk', { url: '/' })
    })

    it('should not log connection reset API errors', async () => {
      offenderSearchApi.establishmentSearch.mockImplementation(() => Promise.reject(makeResetError()))

      await controller.index(req, res)

      expect(logError.mock.calls.length).toBe(0)
    })

    it('should not log connection reset API errors with timeout in stack', async () => {
      offenderSearchApi.establishmentSearch.mockImplementation(() => Promise.reject(makeResetErrorWithStack()))

      await controller.index(req, res)

      expect(logError.mock.calls.length).toBe(0)
    })

    it('should NOT set prisonerSearchUrl to the originalUrl if there has NOT been a search', async () => {
      await controller.index(req, res)

      expect(req.session).toEqual({ userDetails: { username: 'user1' } })
    })

    it('should set the Page-Limit in the request header if pageLimitOption is specified in the url', async () => {
      req.query.pageLimitOption = '500'

      await controller.index(req, res)

      expect(offenderSearchApi.establishmentSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          requestHeaders: expect.objectContaining({
            'page-limit': 500,
          }),
        }),
        'MDI',
        { alerts: undefined, keywords: undefined }
      )
    })
  })
  describe('index (generic)', () => {
    it('should render template with an encoded version of the OriginalUrl', async () => {
      req.originalUrl =
        '/prisoner-search?alerts=HA&alerts=HA1&keywords=Smith&location=MDI&view=grid&feature=new&alerts%5B%5D=HA&alerts%5B%5D=HA1'

      await controller.index(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerSearch/prisonerSearch.njk',
        expect.objectContaining({
          encodedOriginalUrl:
            '%2Fprisoner-search%3Falerts%3DHA%26alerts%3DHA1%26keywords%3DSmith%26location%3DMDI%26view%3Dgrid%26feature%3Dnew%26alerts%255B%255D%3DHA%26alerts%255B%255D%3DHA1',
        })
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
