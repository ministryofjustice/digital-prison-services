const { communityApiFactory } = require('./communityApi')

const client = {}
const communityApi = communityApiFactory(client, '/someprefix')
const context = { some: 'context' }

describe('communityapi api', () => {
  describe('prefix test', () => {
    const response = { bob: 'hello there' }
    let actual

    beforeEach(() => {
      client.get = jest.fn().mockReturnValue({ then: () => response })
      actual = communityApi.getOffenderDetails(context, { offenderNo: 'joe' })
    })

    it('should return response from endpoint', () => {
      expect(actual).toEqual(response)
    })
    it('should call offender details endpoint with correct prefix', () => {
      expect(client.get).toBeCalledWith(context, '/someprefix/offenders/nomsNumber/joe')
    })
  })
})
