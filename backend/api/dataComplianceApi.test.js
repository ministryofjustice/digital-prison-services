const { dataComplianceApiFactory } = require('./dataComplianceApi')

const client = {}
const dataComplianceApi = dataComplianceApiFactory(client)
const context = { some: 'context' }

describe('data compliance api', () => {
  describe('get offender retention reasons', () => {
    const responseBody = { some: 'response' }
    let actual

    beforeEach(async () => {
      client.get = jest.fn().mockResolvedValue({ body: responseBody })
      actual = await dataComplianceApi.getOffenderRetentionReasons(context)
    })

    it('should call the correct endpoint', () => {
      expect(client.get).toBeCalledWith(context, '/retention/offenders/retention-reasons')
    })

    it('should return response from endpoint', async () => {
      expect(actual).toEqual(responseBody)
    })
  })

  describe('get offender retention record', () => {
    const responseBody = { etag: '"0"', some: 'response' }
    let actual

    beforeEach(async () => {
      client.get = jest.fn().mockResolvedValue({ headers: { etag: '"0"' }, body: { some: 'response' } })
      actual = await dataComplianceApi.getOffenderRetentionRecord(context, 'A1234BC')
    })

    it('should call the correct endpoint', () => {
      expect(client.get).toBeCalledWith(context, '/retention/offenders/A1234BC')
    })

    it('handles jetty bug where gzip encoding causes etag suffix', async () => {
      client.get = jest.fn().mockResolvedValue({ headers: { etag: '"0--gzip"' }, body: { some: 'response' } })
      actual = await dataComplianceApi.getOffenderRetentionRecord(context, 'A1234BC')
      expect(actual).toEqual(responseBody)
    })

    it('handles weak etag prefix', async () => {
      client.get = jest.fn().mockResolvedValue({ headers: { etag: 'W/"0"' }, body: { some: 'response' } })
      actual = await dataComplianceApi.getOffenderRetentionRecord(context, 'A1234BC')
      expect(actual).toEqual(responseBody)
    })

    it('should return null if 404 received', async () => {
      client.get = jest.fn().mockRejectedValue({ response: { status: 404 } })
      const errorResponse = await dataComplianceApi.getOffenderRetentionRecord(context, 'A1234BC')
      expect(errorResponse).toEqual(null)
    })

    it('should propagate error if other status code received', async () => {
      client.get = jest.fn().mockRejectedValue({ response: { status: 418 } })
      expect.assertions(1)
      try {
        await dataComplianceApi.getOffenderRetentionRecord(context, 'A1234BC')
      } catch (error) {
        expect(error.response.status).toEqual(418)
      }
    })
  })

  describe('put offender retention record', () => {
    it('should call the correct endpoint', async () => {
      client.put = jest.fn()

      const version = '"0"'
      const body = { some: 'body' }
      const expectedContext = {
        ...context,
        customRequestHeaders: {
          'if-match': version,
        },
      }

      await dataComplianceApi.putOffenderRetentionRecord(context, 'A1234BC', body, version)

      expect(client.put).toBeCalledWith(expectedContext, '/retention/offenders/A1234BC', body)
    })
  })
})
