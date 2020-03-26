const { dataComplianceApiFactory } = require('./dataComplianceApi')

const client = {}
const dataComplianceApi = dataComplianceApiFactory(client)
const context = { some: 'context' }

describe('data compliance api', () => {
  describe('get offender retention reasons', () => {
    const response = { some: 'response' }
    let actual

    beforeEach(() => {
      client.get = jest.fn().mockReturnValue({ then: () => response })
      actual = dataComplianceApi.getOffenderRetentionReasons(context)
    })

    it('should call the correct endpoint', () => {
      expect(client.get).toBeCalledWith(context, '/retention/offenders/retention-reasons')
    })

    it('should return response from endpoint', () => {
      expect(actual).toEqual(response)
    })
  })

  describe('get offender retention record', () => {
    const response = { some: 'response' }
    let actual

    beforeEach(() => {
      client.get = jest.fn().mockReturnValue({ then: () => response })
      actual = dataComplianceApi.getOffenderRetentionRecord(context, 'A1234BC')
    })

    it('should call the correct endpoint', () => {
      expect(client.get).toBeCalledWith(context, '/retention/offenders/A1234BC')
    })

    it('should return response from endpoint', () => {
      expect(actual).toEqual(response)
    })
  })
})
