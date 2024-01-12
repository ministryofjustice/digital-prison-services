import { Response } from 'express'
import changeCaseloadFactory from '../controllers/changeCaseload'

const systemToken = { system: 'system' }
const systemOauthClient = {
  getClientCredentialsTokens: jest.fn(),
}
const prisonApi = {
  userCaseLoads: jest.fn(),
  setActiveCaseload: jest.fn(),
}

describe('index', () => {
  let mockRes: Partial<Response>
  const logError = jest.fn()

  const service = changeCaseloadFactory(prisonApi, logError, systemOauthClient)

  beforeEach(() => {
    jest.resetAllMocks()
    mockRes = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        user: {
          allCaseloads: [
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
          ],
        },
      },
      status: jest.fn(),
    }
    systemOauthClient.getClientCredentialsTokens.mockResolvedValue(systemToken)
  })

  it('should render the change caseload page with correct data', async () => {
    const req = {
      headers: { referer: 'http://localhost:3000/pshUrl/' },
      session: { userDetails: { name: 'Test User', activeCaseLoadId: 'LEI' } },
    }
    const res = { ...mockRes, status: jest.fn() }

    await service.index(req, res)

    expect(res.render).toHaveBeenCalledWith('changeCaseload.njk', {
      title: 'Change your location',
      options: [
        { value: 'LEI', text: 'Leeds (HMP)' },
        { value: 'HEI', text: 'Hewell (HMP)' },
      ],
      backUrl: 'http://localhost:3000/pshUrl/',
    })
  })

  it.each([undefined, 'http://localhost/change-caseload', 'http://localhost/change-caseload/'])(
    'shouldnt provide a back link if the referrer is undefined or the change-caseload page itself',
    async (referer) => {
      const req = {
        headers: { referer },
        session: { userDetails: { name: 'Test User', activeCaseLoadId: 'LEI' } },
      }
      const res = { ...mockRes }

      await service.index(req, res)

      expect(res.render).toHaveBeenCalledWith('changeCaseload.njk', {
        title: 'Change your location',
        options: [
          { value: 'LEI', text: 'Leeds (HMP)' },
          { value: 'HEI', text: 'Hewell (HMP)' },
        ],
      })
    }
  )

  it('should redirect back to homepage if user has less than 2 caseloads', async () => {
    const req = {
      headers: { referer: 'http://localhost:3000/newNomisEndpoint' },
      session: { userDetails: { name: 'Test User', activeCaseLoadId: 'LEI' } },
    }
    const res = {
      ...mockRes,
      locals: {
        user: {
          allCaseloads: [
            {
              caseLoadId: 'LEI',
              description: 'Leeds (HMP)',
              type: 'INST',
              currentlyActive: true,
            },
          ],
        },
      },
    }

    await service.index(req, res)

    expect(res.redirect).toHaveBeenCalledWith('/')
  })
})

describe('post', () => {
  const req = {
    session: {
      userDetails: { activeCaseLoadId: 'LEI' },
      data: {
        activeCaseLoadId: 'LEI',
      },
    },
    body: {},
  }
  const res = {
    redirect: jest.fn(),
    render: jest.fn(),
    status: jest.fn(),
  }

  const logError = jest.fn()

  const service = changeCaseloadFactory(prisonApi, logError, systemOauthClient)

  beforeEach(() => {
    jest.resetAllMocks()
    systemOauthClient.getClientCredentialsTokens.mockResolvedValue(systemToken)
  })

  it('should call the API with the correct body', async () => {
    req.body = { caseLoadId: 'MDI' }

    await service.post(req, res)

    expect(prisonApi.setActiveCaseload).toHaveBeenCalledWith(systemToken, { caseLoadId: 'MDI' })
  })

  it('should redirect on success', async () => {
    req.body = { caseLoadId: 'MDI' }

    await service.post(req, res)

    expect(res.redirect).toHaveBeenCalledWith('/')
  })

  it('should update session with new caseload id and clear app session data', async () => {
    req.body = { caseLoadId: 'MDI' }

    await service.post(req, res)

    expect(req.session.data).toBe(null)
    expect(req.session.userDetails.activeCaseLoadId).toBe('MDI')
  })

  it('should error when caseload id is missing', async () => {
    req.body = {}

    await service.post(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.render).toHaveBeenCalledWith('error.njk', {
      url: '/change-caseload',
    })
  })
})
