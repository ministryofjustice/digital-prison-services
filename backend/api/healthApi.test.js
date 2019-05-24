const MockAdapter = require('axios-mock-adapter')
const clientFactory = require('./oauthEnabledClient')
const { healthApiFactory } = require('./healthApi')

describe('healthApi', () => {
  const client1 = clientFactory({ baseUrl: 'http://localhost:12455' })
  const mock1 = new MockAdapter(client1.axiosInstance)
  const healthApi = healthApiFactory(client1)

  afterEach(() => {
    mock1.reset()
  })

  it('should return true if api is up', async () => {
    mock1.onGet('/health').reply(200, {})
    expect(await healthApi.isUp()).toBe(true)
  })

  it('should return false if api is unreachable', async () => {
    mock1.onGet('/health').networkError()
    expect(await healthApi.isUp()).toBe(false)
  })

  it('should return false if api times out', async () => {
    mock1.onGet('/health').timeout()
    expect(await healthApi.isUp()).toBe(false)
  })

  it('should return false if api returns 500', async () => {
    mock1.onGet('/health').reply(500, {})
    expect(await healthApi.isUp()).toBe(false)
  })
})
