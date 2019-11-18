const { changeCaseloadFactory } = require('../controllers/changeCaseload')
const config = require('../config')

config.app.notmEndpointUrl = '//newNomisEndPointUrl/'

describe('index', () => {
  const elite2Api = {}
  const oauthApi = {}
  const mockRes = { render: jest.fn(), redirect: jest.fn(), locals: {} }
  const logError = jest.fn()

  let service

  beforeEach(() => {
    elite2Api.userCaseLoads = jest.fn()
    oauthApi.currentUser = jest.fn()

    service = changeCaseloadFactory(oauthApi, elite2Api, logError)
  })

  it('should make a request for user and caseloads', async () => {
    const res = { ...mockRes }
    await service.index({}, res)

    expect(elite2Api.userCaseLoads).toHaveBeenCalledWith({})
    expect(oauthApi.currentUser).toHaveBeenCalledWith({})
  })

  it('should render the change caseload page with correct data', async () => {
    const req = {
      headers: { referer: '//newNomisEndPointUrl/' },
    }
    const res = { ...mockRes }

    elite2Api.userCaseLoads.mockReturnValue([
      {
        caseLoadId: 'LEI',
        description: 'Leeds (HMP)',
        type: 'INST',
        currentlyActive: true,
      },
      {
        caseLoadId: 'HEI',
        description: 'Hewell (HMP)',
        type: 'INST',
        currentlyActive: false,
      },
    ])

    oauthApi.currentUser.mockReturnValue({ name: 'Test User', activeCaseLoadId: 'LEI' })
    await service.index(req, res)

    expect(res.render).toBeCalledWith('changeCaseload.njk', {
      title: 'Change caseload',
      options: [{ value: 'LEI', text: 'Leeds (HMP)' }, { value: 'HEI', text: 'Hewell (HMP)' }],
      user: {
        displayName: 'Test User',
        activeCaseLoad: {
          description: 'Leeds (HMP)',
          id: 'LEI',
        },
      },
      caseLoadId: 'LEI',
      backUrl: '//newNomisEndPointUrl/',
    })
  })

  it('should redirect back to homepage if user has less than 2 caseloads', async () => {
    const req = {
      headers: { referer: '//newNomisEndPointUrl/' },
    }
    const res = { ...mockRes }

    elite2Api.userCaseLoads.mockReturnValue([
      {
        caseLoadId: 'LEI',
        description: 'Leeds (HMP)',
        type: 'INST',
        currentlyActive: true,
      },
    ])

    oauthApi.currentUser.mockReturnValue({ name: 'Test User', activeCaseLoadId: 'LEI' })
    await service.index(req, res)

    expect(res.redirect).toHaveBeenCalledWith('//newNomisEndPointUrl/')
  })

  it('should show error page when there is an error', async () => {
    const req = {}
    const res = { ...mockRes }
    await service.index(req, res)

    expect(res.render).toBeCalledWith('error.njk', {
      url: '/change-caseload',
    })
  })
})
