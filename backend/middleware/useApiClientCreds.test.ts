import useApiClientCredsMiddleware from './useApiClientCreds'

const currentUser = {
  allCaseloads: [],
  displayName: 'T. User',
  activeCaseLoad: {
    caseLoadId: 'MDI',
    description: 'Moorland Closed (HMP & YOI)',
    type: 'INST',
    caseloadFunction: 'GENERAL',
    currentlyActive: true,
  },
}

const responseHeaders = {
  'page-limit': '10',
  'page-offset': '10',
  'total-records': '20',
}

describe('Use api client credentials', () => {
  const systemOauthClient = {
    getClientCredentialsTokens: () => {},
  }
  let useApiClientCreds
  let res
  let req

  beforeEach(() => {
    systemOauthClient.getClientCredentialsTokens = jest.fn().mockResolvedValue({})
    useApiClientCreds = useApiClientCredsMiddleware({ systemOauthClient })
    req = {}
    res = {
      locals: {
        // eslint-disable-next-line camelcase
        access_token: 'normal token',
        // eslint-disable-next-line camelcase
        refresh_token: 'normal refresh token',
        authSource: 'nomis',
        responseHeaders,
        user: currentUser,
      },
    }
  })

  it('should throw an error when there is no session', async () => {
    expect.assertions(1)
    const next = jest.fn()
    await useApiClientCreds(req, res, next)

    expect(next).toHaveBeenLastCalledWith(
      new Error(
        'No user session available. Make sure that the middleware is inserted after auth and current user middleware'
      )
    )
  })
  describe('With a valid session', () => {
    beforeEach(() => {
      req = {
        session: { userDetails: { username: 'test-username' } },
      }
      systemOauthClient.getClientCredentialsTokens = jest.fn().mockResolvedValue({
        access_token: 'api client creds token',
      })
    })
    it('should make client credentials request', async () => {
      await useApiClientCreds(req, res, () => {})

      expect(systemOauthClient.getClientCredentialsTokens).toHaveBeenLastCalledWith('test-username')
    })

    it('should overwrite the access_token with the api client access token ', async () => {
      await useApiClientCreds(req, res, () => {})

      expect(res.locals).toEqual({
        access_token: 'api client creds token',
        responseHeaders,
        user: currentUser,
      })
    })

    it('calls next once the new context has been set', async () => {
      const next = jest.fn()
      await useApiClientCreds(req, res, next)

      expect(next).toHaveBeenLastCalledWith()
    })
  })
})
