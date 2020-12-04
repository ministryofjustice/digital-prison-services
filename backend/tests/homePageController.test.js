const config = require('../config')

const controllerFactory = require('../controllers/homePage/homePage')

config.apis.moic.url = 'http://omic-ui'

describe('Home page controller', () => {
  const oauthApi = {}
  let controller
  const req = {}
  const res = { locals: {} }

  beforeEach(() => {
    oauthApi.userRoles = jest.fn().mockResolvedValue([])
    res.render = jest.fn()

    controller = controllerFactory({ oauthApi })
  })

  it('should render home page with no tasks', async () => {
    await controller(req, res)
    expect(res.render).toHaveBeenCalledWith(
      'homePage/homePage.njk',
      expect.objectContaining({
        tasks: [],
      })
    )
  })

  it('should make a request for users roles', async () => {
    await controller(req, res)

    expect(oauthApi.userRoles).toHaveBeenCalledWith({})
  })

  it('should render home page with the global search task', async () => {
    oauthApi.userRoles = jest.fn().mockResolvedValue([{ roleCode: 'GLOBAL_SEARCH' }])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'homePage/homePage.njk',
      expect.objectContaining({
        tasks: [
          {
            id: 'global-search',
            linkUrl: '/global-search',
            subText: 'Search for someone in any establishment, or who has been released.',
            text: 'Global search',
          },
        ],
      })
    )
  })

  it('should render home page with the manage key workers task', async () => {
    oauthApi.userRoles = jest.fn().mockResolvedValue([{ roleCode: 'OMIC_ADMIN' }, { roleCode: 'KEYWORKER_MONITOR' }])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'homePage/homePage.njk',
      expect.objectContaining({
        tasks: [
          {
            id: 'manage-key-workers',
            linkUrl: 'http://omic-ui',
            text: 'Manage key workers',
          },
        ],
      })
    )
  })
})
