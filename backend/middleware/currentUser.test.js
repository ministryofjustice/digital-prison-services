const currentUser = require('./currentUser')

describe('Current user', () => {
  const elite2Api = {}
  const oauthApi = {}
  const njkEnv = {}
  let req

  beforeEach(() => {
    elite2Api.userCaseLoads = jest.fn()
    oauthApi.currentUser = jest.fn()
    njkEnv.addGlobal = jest.fn()

    oauthApi.currentUser.mockReturnValue({
      name: 'Bob Smith',
      activeCaseLoadId: 'MDI',
    })

    req = { session: {} }

    elite2Api.userCaseLoads.mockReturnValue([{ caseLoadId: 'MDI', description: 'Moorland' }])
  })

  it('should request and store user details', async () => {
    const controller = currentUser({ elite2Api, oauthApi, njkEnv })

    await controller(req, {}, () => {})

    expect(oauthApi.currentUser).toHaveBeenCalled()
    expect(req.session.userDetails).toEqual({
      name: 'Bob Smith',
      activeCaseLoadId: 'MDI',
    })
  })

  it('should request and store user case loads', async () => {
    const controller = currentUser({ elite2Api, oauthApi, njkEnv })

    await controller(req, {}, () => {})

    expect(elite2Api.userCaseLoads).toHaveBeenCalled()
    expect(req.session.allCaseloads).toEqual([{ caseLoadId: 'MDI', description: 'Moorland' }])
  })

  it('should add njk global variables', async () => {
    const controller = currentUser({ elite2Api, oauthApi, njkEnv })

    await controller(req, {}, () => {})

    expect(njkEnv.addGlobal).toHaveBeenCalledWith('user', {
      activeCaseLoad: {
        caseLoadId: 'MDI',
        description: 'Moorland',
      },
      displayName: 'Bob Smith',
    })
  })
})
