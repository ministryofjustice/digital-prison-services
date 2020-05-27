const currentUser = require('./currentUser')

describe('Current user', () => {
  const elite2Api = {}
  const oauthApi = {}
  let req
  let res

  beforeEach(() => {
    elite2Api.userCaseLoads = jest.fn()
    oauthApi.currentUser = jest.fn()

    oauthApi.currentUser.mockReturnValue({
      name: 'Bob Smith',
      activeCaseLoadId: 'MDI',
    })

    req = { session: {} }
    res = { locals: {} }

    elite2Api.userCaseLoads.mockReturnValue([{ caseLoadId: 'MDI', description: 'Moorland' }])
  })

  it('should request and store user details', async () => {
    const controller = currentUser({ elite2Api, oauthApi })

    await controller(req, res, () => {})

    expect(oauthApi.currentUser).toHaveBeenCalled()
    expect(req.session.userDetails).toEqual({
      name: 'Bob Smith',
      activeCaseLoadId: 'MDI',
    })
  })

  it('should request and store user case loads', async () => {
    const controller = currentUser({ elite2Api, oauthApi })

    await controller(req, res, () => {})

    expect(elite2Api.userCaseLoads).toHaveBeenCalled()
    expect(req.session.allCaseloads).toEqual([{ caseLoadId: 'MDI', description: 'Moorland' }])
  })

  it('should stash data into res.locals', async () => {
    const controller = currentUser({ elite2Api, oauthApi })

    await controller(req, res, () => {})

    expect(res.locals.user).toEqual({
      allCaseloads: [
        {
          caseLoadId: 'MDI',
          description: 'Moorland',
        },
      ],
      activeCaseLoad: {
        caseLoadId: 'MDI',
        description: 'Moorland',
      },
      displayName: 'Bob Smith',
    })
  })

  it('ignore xhr requests', async () => {
    const controller = currentUser({ elite2Api, oauthApi })
    req.xhr = true

    const next = jest.fn()

    await controller(req, res, next)

    expect(oauthApi.currentUser.mock.calls.length).toEqual(0)
    expect(elite2Api.userCaseLoads.mock.calls.length).toEqual(0)
    expect(next).toHaveBeenCalled()
  })
})
