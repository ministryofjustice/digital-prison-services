Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const elite2Api = {}
const covidService = require('../services/covidService').covidServiceFactory(elite2Api)

beforeEach(() => {
  elite2Api.getInmates = jest.fn()
  elite2Api.getAlerts = jest.fn()
})

const returnSize = count => context => {
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
      const context = { locals: { user: { activeCaseLoad: { caseLoadId: 'MDI' } } }, render: jest.fn() }

      elite2Api.getInmates.mockImplementationOnce(returnSize(21))

      const response = await covidService.getCount(context, 'UPIU')

      expect(response).toEqual(21)

      expect(elite2Api.getInmates).toHaveBeenCalledWith(expect.objectContaining({ requestHeaders }), 'MDI', {
        alerts: 'UPIU',
      })
    })

    it('Retrieve count without alert', async () => {
      const context = { locals: { user: { activeCaseLoad: { caseLoadId: 'MDI' } } }, render: jest.fn() }

      elite2Api.getInmates.mockImplementationOnce(returnSize(200))

      const response = await covidService.getCount(context)

      expect(response).toEqual(200)

      expect(elite2Api.getInmates).toHaveBeenCalledWith(expect.objectContaining({ requestHeaders }), 'MDI', {})
    })
  })

  describe('getAlertList', () => {
    const requestHeaders = {
      'page-limit': 3000,
      'page-offset': 0,
    }

    it('success', async () => {
      const context = { locals: { user: { activeCaseLoad: { caseLoadId: 'MDI' } } }, render: jest.fn() }

      elite2Api.getAlerts.mockResolvedValue([
        { offenderNo: 'AA1234A', alertCode: 'AA1', expired: false, dateCreated: '2020-01-02' },
        { offenderNo: 'AA1234A', alertCode: 'UPIU', expired: false, dateCreated: '2020-01-03' },
        { offenderNo: 'BB1234A', alertCode: 'UPIU', expired: false, dateCreated: '2020-01-04' },
      ])

      elite2Api.getInmates.mockResolvedValue([
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

      const response = await covidService.getAlertList(context, 'UPIU')

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

      expect(elite2Api.getInmates).toHaveBeenCalledWith(expect.objectContaining({ requestHeaders }), 'MDI', {
        alerts: 'UPIU',
      })

      expect(elite2Api.getAlerts).toHaveBeenCalledWith(expect.objectContaining({ requestHeaders }), {
        agencyId: 'MDI',
        offenderNumbers: ['AA1234A', 'BB1234A'],
      })
    })

    it('expired alerts are not displayed', async () => {
      const context = { locals: { user: { activeCaseLoad: { caseLoadId: 'MDI' } } }, render: jest.fn() }

      elite2Api.getAlerts.mockResolvedValue([
        { offenderNo: 'AA1234A', alertCode: 'UPIU', expired: false, dateCreated: '2020-01-03' },
        { offenderNo: 'AA1234A', alertCode: 'UPIU', expired: true, dateCreated: '2020-01-05' },
        { offenderNo: 'BB1234A', alertCode: 'UPIU', expired: false, dateCreated: '2020-01-04' },
      ])

      elite2Api.getInmates.mockResolvedValue([
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

      const response = await covidService.getAlertList(context, 'UPIU')

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
})
