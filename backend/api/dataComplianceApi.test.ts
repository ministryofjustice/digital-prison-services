// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'dataCompli... Remove this comment to see the full error message
const { dataComplianceApiFactory } = require('./dataComplianceApi')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'client'.
const client = {}
const dataComplianceApi = dataComplianceApiFactory(client)
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'context'.
const context = { some: 'context' }

describe('data compliance api', () => {
  describe('get offender retention reasons', () => {
    const responseBody = { some: 'response' }
    let actual

    beforeEach(async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'get' does not exist on type '{}'.
      client.get = jest.fn().mockResolvedValue({ body: responseBody })
      actual = await dataComplianceApi.getOffenderRetentionReasons(context)
    })

    it('should call the correct endpoint', () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'get' does not exist on type '{}'.
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
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'get' does not exist on type '{}'.
      client.get = jest.fn().mockResolvedValue({ headers: { etag: '"0"' }, body: { some: 'response' } })
      actual = await dataComplianceApi.getOffenderRetentionRecord(context, 'A1234BC')
    })

    it('should call the correct endpoint', () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'get' does not exist on type '{}'.
      expect(client.get).toBeCalledWith(context, '/retention/offenders/A1234BC')
    })

    it('handles jetty bug where gzip encoding causes etag suffix', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'get' does not exist on type '{}'.
      client.get = jest.fn().mockResolvedValue({ headers: { etag: '"0--gzip"' }, body: { some: 'response' } })
      actual = await dataComplianceApi.getOffenderRetentionRecord(context, 'A1234BC')
      expect(actual).toEqual(responseBody)
    })

    it('handles weak etag prefix', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'get' does not exist on type '{}'.
      client.get = jest.fn().mockResolvedValue({ headers: { etag: 'W/"0"' }, body: { some: 'response' } })
      actual = await dataComplianceApi.getOffenderRetentionRecord(context, 'A1234BC')
      expect(actual).toEqual(responseBody)
    })

    it('should return null if 404 received', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'get' does not exist on type '{}'.
      client.get = jest.fn().mockRejectedValue({ response: { status: 404 } })
      const errorResponse = await dataComplianceApi.getOffenderRetentionRecord(context, 'A1234BC')
      expect(errorResponse).toEqual(null)
    })

    it('should propagate error if other status code received', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'get' does not exist on type '{}'.
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
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'put' does not exist on type '{}'.
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

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'put' does not exist on type '{}'.
      expect(client.put).toBeCalledWith(expectedContext, '/retention/offenders/A1234BC', body)
    })
  })
})
