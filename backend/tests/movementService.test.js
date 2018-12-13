import { movementsServiceFactory } from '../controllers/movementsService'

describe('Movement service', () => {
  const eliteApi = {}
  const oauthClient = {}
  const context = {}
  const agency = 'LEI'
  const offenders = [{ offenderNo: 'offenderNo1' }, { offenderNo: 'offenderNo2' }]
  const offenderNumbers = offenders.map(offender => offender.offenderNo)

  beforeEach(() => {
    eliteApi.getMovementsOut = jest.fn()
    eliteApi.getAlertsSystem = jest.fn()
    eliteApi.getAssessments = jest.fn()
    oauthClient.getClientCredentialsTokens = jest.fn()
  })

  describe('Out today', () => {
    it('handles no offenders out today', async () => {
      const response = await movementsServiceFactory(eliteApi).getMovementsOut({}, 'LEI')
      expect(response).toEqual([])
    })

    it('handles no assessments and no alerts', async () => {
      eliteApi.getMovementsOut.mockReturnValue(offenders)

      const response = await movementsServiceFactory(eliteApi, oauthClient).getMovementsOut(context, agency)

      expect(response).toEqual(
        offenders.map(offender => ({
          ...offender,
        }))
      )
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
  })
})
