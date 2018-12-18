import { movementsServiceFactory } from '../controllers/movementsService'

describe('Movement service', () => {
  const eliteApi = {}
  const oauthClient = {}
  const context = {}
  const agency = 'LEI'
  const offenders = [{ offenderNo: 'offenderNo1' }, { offenderNo: 'offenderNo2' }]
  const offenderNumbers = offenders.map(offender => offender.offenderNo)

  describe('Out today', () => {
    beforeEach(() => {
      eliteApi.getMovementsOut = jest.fn()
      eliteApi.getAlertsSystem = jest.fn()
      eliteApi.getAssessments = jest.fn()
      oauthClient.getClientCredentialsTokens = jest.fn()
    })

    it('handles no offenders out today', async () => {
      const response = await movementsServiceFactory(eliteApi).getMovementsOut({}, 'LEI')
      expect(response).toEqual([])
    })

    it('handles no assessments and no alerts', async () => {
      eliteApi.getMovementsOut.mockReturnValue(offenders)

      const response = await movementsServiceFactory(eliteApi, oauthClient).getMovementsOut(context, agency)

      expect(response).toEqual([{ offenderNo: 'offenderNo1' }, { offenderNo: 'offenderNo2' }])
    })

    it('should make a request for alerts using the systemContext and offender numbers', async () => {
      const securityContext = 'securityContextData'

      eliteApi.getMovementsOut.mockReturnValue(offenders)
      oauthClient.getClientCredentialsTokens.mockReturnValue(securityContext)

      await movementsServiceFactory(eliteApi, oauthClient).getMovementsOut(context, agency)

      expect(eliteApi.getAlertsSystem).toHaveBeenCalledWith(securityContext, offenderNumbers)
    })

    it('should make a request for assessments with the correct offender numbers and assessment code', async () => {
      eliteApi.getMovementsOut.mockReturnValue(offenders)

      await movementsServiceFactory(eliteApi, oauthClient).getMovementsOut(context, agency)

      expect(eliteApi.getAssessments).toHaveBeenCalledWith(context, { code: 'CATEGORY', offenderNumbers })
    })

    it('should only return active alert flags for HA and XEL', async () => {
      eliteApi.getMovementsOut.mockReturnValue(offenders)
      eliteApi.getAlertsSystem.mockReturnValue([
        {
          offenderNo: offenderNumbers[0],
          expired: true,
          alertCode: 'HA',
        },
        {
          offenderNo: offenderNumbers[0],
          expired: false,
          alertCode: 'HA',
        },
        {
          offenderNo: offenderNumbers[0],
          expired: true,
          alertCode: 'XEL',
        },
        {
          offenderNo: offenderNumbers[0],
          expired: false,
          alertCode: 'XEL',
        },
      ])

      const response = await movementsServiceFactory(eliteApi, oauthClient).getMovementsOut(context, agency)
      expect(response[0].alerts).toEqual(['HA', 'XEL'])
    })
  })

  describe('In today', () => {
    beforeEach(() => {
      eliteApi.getMovementsIn = jest.fn()
      eliteApi.getAlertsSystem = jest.fn()
      eliteApi.getAssessments = jest.fn()
      oauthClient.getClientCredentialsTokens = jest.fn()
    })

    it('Returns an empty array when there are no offenders in today', async () => {
      eliteApi.getMovementsIn.mockReturnValue([])

      const response = await movementsServiceFactory(eliteApi, oauthClient).getMovementsIn(context, agency)
      expect(response).toHaveLength(0)
    })

    it('Returns movements in', async () => {
      eliteApi.getMovementsIn.mockReturnValue([{ offenderNo: 'G0000GG' }, { offenderNo: 'G0001GG' }])
      const response = await movementsServiceFactory(eliteApi, oauthClient).getMovementsIn(context, agency)
      expect(response).toEqual([{ offenderNo: 'G0000GG' }, { offenderNo: 'G0001GG' }])
    })

    it('Decorates movements in with active alerts', async () => {
      eliteApi.getMovementsIn.mockReturnValue([{ offenderNo: 'G0000GG' }, { offenderNo: 'G0001GG' }])
      eliteApi.getAlertsSystem.mockReturnValue([
        { offenderNo: 'G0001GG', expired: true, alertCode: 'HA' },
        { offenderNo: 'G0001GG', expired: false, alertCode: 'XEL' },
      ])

      const response = await movementsServiceFactory(eliteApi, oauthClient).getMovementsIn(context, agency)
      expect(response).toEqual([{ offenderNo: 'G0000GG', alerts: [] }, { offenderNo: 'G0001GG', alerts: ['XEL'] }])
    })

    it('Decorates movements in with categories', async () => {
      eliteApi.getMovementsIn.mockReturnValue([{ offenderNo: 'G0000GG' }, { offenderNo: 'G0001GG' }])
      eliteApi.getAlertsSystem.mockReturnValue([])
      eliteApi.getAssessments.mockReturnValue([
        { offenderNo: 'G0000GG', classificationCode: 'A' },
        { offenderNo: 'G0001GG', classificationCode: 'E' },
      ])

      const response = await movementsServiceFactory(eliteApi, oauthClient).getMovementsIn(context, agency)
      expect(response).toEqual([
        { offenderNo: 'G0000GG', category: 'A', alerts: [] },
        { offenderNo: 'G0001GG', category: 'E', alerts: [] },
      ])
    })
  })
})
