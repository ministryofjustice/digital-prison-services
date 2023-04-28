import currentUser from './currentUser'

describe('Current user', () => {
  const prisonApi = {}
  const oauthApi = {}
  let req
  let res

  beforeEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userCaseLoads' does not exist on type '{... Remove this comment to see the full error message
    prisonApi.userCaseLoads = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'setActiveCaseload' does not exist on typ... Remove this comment to see the full error message
    prisonApi.setActiveCaseload = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'currentUser' does not exist on type '{}'... Remove this comment to see the full error message
    oauthApi.currentUser = jest.fn()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'currentUser' does not exist on type '{}'... Remove this comment to see the full error message
    oauthApi.currentUser.mockReturnValue({
      username: 'BSMITH',
      name: 'Bob Smith',
      activeCaseLoadId: 'MDI',
    })

    req = { session: {} }
    res = { locals: {} }

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userCaseLoads' does not exist on type '{... Remove this comment to see the full error message
    prisonApi.userCaseLoads.mockReturnValue([{ caseLoadId: 'MDI', description: 'Moorland' }])
  })

  it('should request and store user details', async () => {
    const controller = currentUser({ prisonApi, oauthApi })

    await controller(req, res, () => {})

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'currentUser' does not exist on type '{}'... Remove this comment to see the full error message
    expect(oauthApi.currentUser).toHaveBeenCalled()
    expect(req.session.userDetails).toEqual({
      username: 'BSMITH',
      name: 'Bob Smith',
      activeCaseLoadId: 'MDI',
    })
  })

  it('should request and store user case loads', async () => {
    const controller = currentUser({ prisonApi, oauthApi })

    await controller(req, res, () => {})

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userCaseLoads' does not exist on type '{... Remove this comment to see the full error message
    expect(prisonApi.userCaseLoads).toHaveBeenCalled()
    expect(req.session.allCaseloads).toEqual([{ caseLoadId: 'MDI', description: 'Moorland' }])
  })

  it('should stash data into res.locals', async () => {
    const controller = currentUser({ prisonApi, oauthApi })

    await controller(req, res, () => {})

    expect(res.locals.user).toEqual({
      username: 'BSMITH',
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
      displayName: 'B. Smith',
    })
  })

  it('ignore xhr requests', async () => {
    const controller = currentUser({ prisonApi, oauthApi })
    req.xhr = true

    const next = jest.fn()

    await controller(req, res, next)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'currentUser' does not exist on type '{}'... Remove this comment to see the full error message
    expect(oauthApi.currentUser.mock.calls.length).toEqual(0)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userCaseLoads' does not exist on type '{... Remove this comment to see the full error message
    expect(prisonApi.userCaseLoads.mock.calls.length).toEqual(0)
    expect(next).toHaveBeenCalled()
  })

  it('should default active caseload when not set', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'currentUser' does not exist on type '{}'... Remove this comment to see the full error message
    oauthApi.currentUser.mockReturnValue({
      username: 'BSMITH',
      name: 'Bob Smith',
      activeCaseLoadId: null,
    })

    const controller = currentUser({ prisonApi, oauthApi })

    await controller(req, res, () => {})

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'currentUser' does not exist on type '{}'... Remove this comment to see the full error message
    expect(oauthApi.currentUser).toHaveBeenCalled()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'setActiveCaseload' does not exist on typ... Remove this comment to see the full error message
    expect(prisonApi.setActiveCaseload).toHaveBeenCalledWith(res.locals, { caseLoadId: 'MDI', description: 'Moorland' })
    expect(req.session.userDetails).toEqual({
      username: 'BSMITH',
      name: 'Bob Smith',
      activeCaseLoadId: 'MDI',
    })
  })

  it('should not set caseload when already set', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'currentUser' does not exist on type '{}'... Remove this comment to see the full error message
    oauthApi.currentUser.mockReturnValue({
      username: 'BSMITH',
      name: 'Bob Smith',
      activeCaseLoadId: 'MDI',
    })

    const controller = currentUser({ prisonApi, oauthApi })

    req = {
      session: {
        userDetails: { username: 'BSMITH', activeCaseLoadId: 'MDI', name: 'Bob Smith' },
        allCaseloads: [{ caseLoadId: 'MDI', description: 'Moorland' }],
      },
    }

    await controller(req, res, () => {})

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'currentUser' does not exist on type '{}'... Remove this comment to see the full error message
    expect(oauthApi.currentUser).not.toHaveBeenCalled()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'setActiveCaseload' does not exist on typ... Remove this comment to see the full error message
    expect(prisonApi.setActiveCaseload).not.toHaveBeenCalled()
    expect(req.session.userDetails).toEqual({
      username: 'BSMITH',
      name: 'Bob Smith',
      activeCaseLoadId: 'MDI',
    })
  })
})
