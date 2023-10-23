import { deliusIntegrationApiFactory } from './deliusIntegrationApi'

const client = {} as any
const deliusIntegrationApi = deliusIntegrationApiFactory(client)
const context = { some: 'context' }

describe('delius integration api', () => {
  describe('prefix test', () => {
    const response = { bob: 'hello there' }
    let actual

    beforeEach(() => {
      client.get = jest.fn().mockReturnValue({ then: () => response })
      actual = deliusIntegrationApi.getProbationDocuments(context, { offenderNo: 'joe' })
    })

    it('should return response from endpoint', () => {
      expect(actual).toEqual(response)
    })
    it('should call offender details endpoint with correct prefix', () => {
      expect(client.get).toBeCalledWith(context, '/case/joe/documents')
    })
  })
})
