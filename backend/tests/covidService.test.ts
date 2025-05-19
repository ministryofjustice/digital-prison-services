import moment from 'moment'

Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const prisonApi = {
  getInmates: jest.fn(),
  getMovementsInBetween: jest.fn(),
}
const prisonerAlertsApi = {
  getAlerts: jest.fn(),
}
const systemOauthClient = {
  getClientCredentialsTokens: jest.fn(),
}
const now = moment('2020-01-10')
const covidService = require('../services/covidService').covidServiceFactory(
  systemOauthClient,
  prisonApi,
  prisonerAlertsApi,
  () => now
)

const returnSize = (count) => (context) => {
  // eslint-disable-next-line no-param-reassign,
  context.responseHeaders = { 'total-records': count }
}

describe('Covid Service', () => {
  describe('get count', () => {
    const requestHeaders = {
      'page-limit': 1,
      'page-offset': 0,
    }

    it('Retrieve count with alert', async () => {
      const req = { session: { userDetails: { username: 'ITAG_USER' } } }
      const res = { locals: { user: { activeCaseLoad: { caseLoadId: 'MDI' } } }, render: jest.fn() }

      prisonApi.getInmates.mockImplementationOnce(returnSize(21))

      const response = await covidService.getCount(req, res, 'UPIU')

      expect(response).toEqual(21)

      expect(prisonApi.getInmates).toHaveBeenCalledWith(expect.objectContaining({ requestHeaders }), 'MDI', {
        alerts: 'UPIU',
      })
    })

    it('Retrieve count without alert', async () => {
      const req = { session: { userDetails: { username: 'ITAG_USER' } } }
      const res = { locals: { user: { activeCaseLoad: { caseLoadId: 'MDI' } } }, render: jest.fn() }

      prisonApi.getInmates.mockImplementationOnce(returnSize(200))
      systemOauthClient.getClientCredentialsTokens.mockResolvedValue({})

      const response = await covidService.getCount(req, res)

      expect(response).toEqual(200)

      expect(prisonApi.getInmates).toHaveBeenCalledWith(expect.objectContaining({ requestHeaders }), 'MDI', {})
    })
  })

  describe('getAlertList', () => {
    const requestHeaders = {
      'page-limit': 3000,
      'page-offset': 0,
    }

    it('success', async () => {
      const req = { session: { userDetails: { username: 'ITAG_USER' } } }
      const res = { locals: { user: { activeCaseLoad: { caseLoadId: 'MDI' } } }, render: jest.fn() }

      prisonerAlertsApi.getAlerts.mockResolvedValue({
        content: [
          { prisonNumber: 'AA1234A', alertCode: { code: 'AA1' }, isActive: true, createdAt: '2020-01-02' },
          { prisonNumber: 'AA1234A', alertCode: { code: 'UPIU' }, isActive: true, createdAt: '2020-01-03' },
          { prisonNumber: 'BB1234A', alertCode: { code: 'UPIU' }, isActive: true, createdAt: '2020-01-04' },
        ],
      })

      prisonApi.getInmates.mockResolvedValue([
        {
          offenderNo: 'AA1234A',
          bookingId: 123,
          assignedLivingUnitDesc: '1-2-017',
          firstName: 'JAMES',
          lastName: 'STEWART',
        },
        {
          offenderNo: 'BB1234A',
          bookingId: 234,
          assignedLivingUnitDesc: '1-2-018',
          firstName: 'DONNA',
          lastName: 'READ',
        },
      ])

      const response = await covidService.getAlertList(req, res, 'UPIU')

      expect(response).toEqual([
        {
          alertCreated: '2020-01-03',
          assignedLivingUnitDesc: '1-2-017',
          bookingId: 123,
          name: 'Stewart, James',
          offenderNo: 'AA1234A',
        },
        {
          alertCreated: '2020-01-04',
          assignedLivingUnitDesc: '1-2-018',
          bookingId: 234,
          name: 'Read, Donna',
          offenderNo: 'BB1234A',
        },
      ])

      expect(prisonApi.getInmates).toHaveBeenCalledWith(expect.objectContaining({ requestHeaders }), 'MDI', {
        alerts: 'UPIU',
      })

      expect(prisonerAlertsApi.getAlerts).toHaveBeenCalledWith(expect.objectContaining({ requestHeaders }), {
        agencyId: 'MDI',
        offenderNumbers: ['AA1234A', 'BB1234A'],
      })
    })

    it('expired alerts are not displayed', async () => {
      const req = { session: { userDetails: { username: 'ITAG_USER' } } }
      const res = { locals: { user: { activeCaseLoad: { caseLoadId: 'MDI' } } }, render: jest.fn() }

      prisonerAlertsApi.getAlerts.mockResolvedValue({
        content: [
          { prisonNumber: 'AA1234A', alertCode: { code: 'UPIU' }, isActive: true, createdAt: '2020-01-03' },
          { prisonNumber: 'AA1234A', alertCode: { code: 'UPIU' }, isActive: false, createdAt: '2020-01-05' },
          { prisonNumber: 'BB1234A', alertCode: { code: 'UPIU' }, isActive: true, createdAt: '2020-01-04' },
        ],
      })

      prisonApi.getInmates.mockResolvedValue([
        {
          offenderNo: 'AA1234A',
          bookingId: 123,
          assignedLivingUnitDesc: '1-2-017',
          firstName: 'JAMES',
          lastName: 'STEWART',
        },
        {
          offenderNo: 'BB1234A',
          bookingId: 234,
          assignedLivingUnitDesc: '1-2-018',
          firstName: 'DONNA',
          lastName: 'READ',
        },
      ])

      const response = await covidService.getAlertList(req, res, 'UPIU')

      expect(response).toEqual([
        {
          alertCreated: '2020-01-03',
          assignedLivingUnitDesc: '1-2-017',
          bookingId: 123,
          name: 'Stewart, James',
          offenderNo: 'AA1234A',
        },
        {
          alertCreated: '2020-01-04',
          assignedLivingUnitDesc: '1-2-018',
          bookingId: 234,
          name: 'Read, Donna',
          offenderNo: 'BB1234A',
        },
      ])
    })
  })

  describe('getUnassignedNewEntrants', () => {
    const requestHeaders = {
      'page-limit': 3000,
      'page-offset': 0,
    }

    it('success', async () => {
      const context = { locals: { user: { activeCaseLoad: { caseLoadId: 'MDI' } } }, render: jest.fn() }

      systemOauthClient.getClientCredentialsTokens.mockResolvedValue({})

      prisonerAlertsApi.getAlerts.mockResolvedValue({
        content: [
          { prisonNumber: 'AA1234A', alertCode: { code: 'AA1' }, isActive: true, createdAt: '2020-01-02' },
          { prisonNumber: 'AA1234A', alertCode: { code: 'UPIU' }, isActive: true, createdAt: '2020-01-03' },
          { prisonNumber: 'BB1234A', alertCode: { code: 'UPIU' }, isActive: true, createdAt: '2020-01-04' },
          { prisonNumber: 'DD1234A', alertCode: { code: 'AA2' }, isActive: true, createdAt: '2020-01-05' },
        ],
      })

      prisonApi.getMovementsInBetween.mockResolvedValue([
        {
          offenderNo: 'AA1234A',
          bookingId: 123,
          location: '1-2-017',
          firstName: 'JAMES',
          lastName: 'STEWART',
          movementDateTime: '2020-01-04',
        },
        {
          offenderNo: 'BB1234A',
          bookingId: 234,
          location: '1-2-018',
          firstName: 'DONNA',
          lastName: 'READ',
          movementDateTime: '2020-01-05',
        },
        {
          offenderNo: 'CC1234A',
          bookingId: 345,
          location: '1-2-019',
          firstName: 'PEGGY',
          lastName: 'HUTTON',
          movementDateTime: '2020-01-06',
        },
        {
          offenderNo: 'DD1234A',
          bookingId: 456,
          location: '1-2-020',
          firstName: 'ELAINE',
          lastName: 'SMITH',
          movementDateTime: '2020-01-07',
        },
      ])

      const response = await covidService.getUnassignedNewEntrants(
        { session: { userDetails: { username: 'name' } } },
        context
      )

      expect(response).toEqual([
        {
          arrivalDate: '2020-01-06',
          assignedLivingUnitDesc: '1-2-019',
          bookingId: 345,
          name: 'Hutton, Peggy',
          offenderNo: 'CC1234A',
        },
        {
          arrivalDate: '2020-01-07',
          assignedLivingUnitDesc: '1-2-020',
          bookingId: 456,
          name: 'Smith, Elaine',
          offenderNo: 'DD1234A',
        },
      ])

      expect(prisonApi.getMovementsInBetween).toHaveBeenCalledWith(expect.objectContaining({ requestHeaders }), 'MDI', {
        fromDateTime: '2019-12-27T00:00:00',
      })

      expect(prisonerAlertsApi.getAlerts).toHaveBeenCalledWith(expect.objectContaining({}), {
        agencyId: 'MDI',
        offenderNumbers: ['AA1234A', 'BB1234A', 'CC1234A', 'DD1234A'],
      })
    })
  })
})
