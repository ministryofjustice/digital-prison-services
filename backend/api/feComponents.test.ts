import { feComponentsApiFactory } from './feComponents'

const client = {} as any
const feComponentsApi = feComponentsApiFactory(client)
const context = { access_token: 'token' }
const expectedContext = { access_token: 'token', customRequestHeaders: { 'x-user-token': context.access_token } }

describe('fe components api', () => {
  const responseBody = { header: { html: '<html></html>', css: [], javascript: [] } }
  beforeEach(async () => {
    client.get = jest.fn().mockResolvedValue({ body: responseBody })
  })

  describe('get offender retention reasons', () => {
    it('should call the correct endpoint with query params', async () => {
      const response = await feComponentsApi.getComponents(context, ['header', 'footer'])
      expect(client.get).toBeCalledWith(expectedContext, '/components', {}, 'component=header&component=footer')
      expect(response).toEqual(responseBody)
    })

    it('should handle only one query param', async () => {
      const response = await feComponentsApi.getComponents(context, ['header'])
      expect(client.get).toBeCalledWith(expectedContext, '/components', {}, 'component=header')
      expect(response).toEqual(responseBody)
    })
  })

  describe('latest features', () => {
    it('should send latest feature header if requested', async () => {
      const response = await feComponentsApi.getComponents(context, ['header'], true)
      expect(client.get).toBeCalledWith(
        {
          access_token: 'token',
          customRequestHeaders: { 'x-user-token': context.access_token, 'x-use-latest-features': 'true' },
        },
        '/components',
        {},
        'component=header'
      )
      expect(response).toEqual(responseBody)
    })
  })
})
