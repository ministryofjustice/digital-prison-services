import * as jwt from 'jsonwebtoken'
import currentUser from './currentUser'

describe('Current user', () => {
  const prisonApi = {
    userCaseLoads: jest.fn(),
    setActiveCaseload: jest.fn(),
  }
  const hmppsManageUsersApi = {
    currentUser: jest.fn(),
  }
  const systemToken = { system: 'system' }
  const getClientCredentialsTokens = jest.fn()
  let req
  let res

  beforeEach(() => {
    jest.resetAllMocks()
    hmppsManageUsersApi.currentUser.mockResolvedValue({
      username: 'BSMITH',
      name: 'Bob Smith',
      activeCaseLoadId: 'MDI',
    })

    prisonApi.userCaseLoads.mockResolvedValue([{ caseLoadId: 'MDI', description: 'Moorland' }])
    getClientCredentialsTokens.mockResolvedValue(systemToken)
    req = { xhr: false, session: { userDetails: null, allCaseloads: [], userBackLink: '' } }
    res = { locals: { access_token: '', user: {} } }
  })

  it('should request and store user details', async () => {
    const controller = currentUser({ prisonApi, hmppsManageUsersApi, getClientCredentialsTokens })

    await controller(req, res, () => {})

    expect(hmppsManageUsersApi.currentUser).toHaveBeenCalled()
    expect(req.session.userDetails).toEqual({
      username: 'BSMITH',
      name: 'Bob Smith',
      activeCaseLoadId: 'MDI',
    })
  })

  it('should request and store user case loads', async () => {
    const controller = currentUser({ prisonApi, hmppsManageUsersApi, getClientCredentialsTokens })

    await controller(req, res, () => {})

    expect(prisonApi.userCaseLoads).toHaveBeenCalled()
    expect(req.session.allCaseloads).toEqual([{ caseLoadId: 'MDI', description: 'Moorland' }])
  })

  it('should stash data into res.locals', async () => {
    res.locals.access_token = jwt.sign({ authorities: ['ROLE_PRISON'] }, 'secret')
    req.session.userBackLink = 'http://backlink'

    const controller = currentUser({ prisonApi, hmppsManageUsersApi, getClientCredentialsTokens })

    await controller(req, res, () => {})

    expect(res.locals.user).toEqual({
      username: 'BSMITH',
      userRoles: ['ROLE_PRISON'],
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
      backLink: 'http://backlink',
      displayName: 'B. Smith',
    })
  })

  it('ignore xhr requests', async () => {
    const controller = currentUser({ prisonApi, hmppsManageUsersApi, getClientCredentialsTokens })
    req.xhr = true

    const next = jest.fn()

    await controller(req, res, next)

    expect(hmppsManageUsersApi.currentUser.mock.calls.length).toEqual(0)
    expect(prisonApi.userCaseLoads.mock.calls.length).toEqual(0)
    expect(next).toHaveBeenCalled()
  })

  it('should default active caseload when not set', async () => {
    hmppsManageUsersApi.currentUser.mockResolvedValue({
      username: 'BSMITH',
      name: 'Bob Smith',
      activeCaseLoadId: null,
    })

    const controller = currentUser({ prisonApi, hmppsManageUsersApi, getClientCredentialsTokens })

    await controller(req, res, () => {})

    expect(hmppsManageUsersApi.currentUser).toHaveBeenCalled()
    expect(prisonApi.setActiveCaseload).toHaveBeenCalledWith(systemToken, {
      caseLoadId: 'MDI',
      description: 'Moorland',
    })
    expect(req.session.userDetails).toEqual({
      username: 'BSMITH',
      name: 'Bob Smith',
      activeCaseLoadId: 'MDI',
    })
  })

  it('should not set caseload when already set', async () => {
    hmppsManageUsersApi.currentUser.mockResolvedValue({
      username: 'BSMITH',
      name: 'Bob Smith',
      activeCaseLoadId: 'MDI',
    })

    const controller = currentUser({ prisonApi, hmppsManageUsersApi, getClientCredentialsTokens })

    req.session.userDetails = { username: 'BSMITH', activeCaseLoadId: 'MDI', name: 'Bob Smith' }
    req.session.allCaseloads = [{ caseLoadId: 'MDI', description: 'Moorland' }]

    await controller(req, res, () => {})

    expect(hmppsManageUsersApi.currentUser).not.toHaveBeenCalled()
    expect(prisonApi.setActiveCaseload).not.toHaveBeenCalled()
    expect(req.session.userDetails).toEqual({
      username: 'BSMITH',
      name: 'Bob Smith',
      activeCaseLoadId: 'MDI',
    })
  })
})
