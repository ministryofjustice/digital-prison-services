/* eslint-disable no-unused-expressions, prefer-promise-reject-errors */
const config = require('../config')
const bvlRoutes = require('../setupBvlRoutes')

const prisonApi = jest.fn()
const whereaboutsApi = jest.fn()
const oauthApi = jest.fn()
const notifyClient = jest.fn()
const logError = jest.fn()
const router = { use: jest.fn(), get: jest.fn() }

describe('Test setupBvlRoutes for redirects', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  it('GET "/videolink" redirect = true, app redirects to http://localhost:3000', async () => {
    config.app.redirectToBookingVideoLinkEnabled = true
    bvlRoutes({ prisonApi, whereaboutsApi, oauthApi, notifyClient, logError }, router)

    expect(router.get).toHaveBeenCalledTimes(1)
    expect(router.use).not.toHaveBeenCalled()

    const [path, handler] = router.get.mock.calls[0]
    expect(path).toBe('/videolink')

    const res = {
      redirect: jest.fn(),
    }

    handler(null, res)

    expect(res.redirect).toHaveBeenCalledWith(config.apis.bookVideoLink.url)
  })

  it('GET "/videolink" redirect = false, route registration happens as normal', async () => {
    config.app.redirectToBookingVideoLinkEnabled = false
    bvlRoutes({ prisonApi, whereaboutsApi, oauthApi, notifyClient, logError }, router)
    expect(router.get).toHaveBeenCalled()
    expect(router.use).toHaveBeenCalled()
  })
})
