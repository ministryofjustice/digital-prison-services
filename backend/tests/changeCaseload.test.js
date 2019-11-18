const { changeCaseloadFactory } = require('../controllers/changeCaseload')
const config = require('../config')

config.app.notmEndpointUrl = '//newNomisEndPointUrl/'

describe('index', () => {
  const elite2Api = {}
  const mockRes = { render: jest.fn(), redirect: jest.fn(), locals: {} }
  const logError = jest.fn()

  let service

  beforeEach(() => {
    elite2Api.userCaseLoads = jest.fn()
    service = changeCaseloadFactory(elite2Api, logError)
  })

  it('should make a request for caseloads', async () => {
    const req = {
      headers: { referer: '//newNomisEndPointUrl/' },
      session: { userDetails: { name: 'Test User', activeCaseLoadId: 'LEI' } },
    }
    const res = { ...mockRes }
    await service.index(req, res)

    expect(elite2Api.userCaseLoads).toHaveBeenCalledWith({})
  })

  it('should render the change caseload page with correct data', async () => {
    const req = {
      headers: { referer: '//newNomisEndPointUrl/' },
      session: { userDetails: { name: 'Test User', activeCaseLoadId: 'LEI' } },
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

    await service.index(req, res)

    expect(res.render).toBeCalledWith('changeCaseload.njk', {
      title: 'Change caseload',
      options: [{ value: 'LEI', text: 'Leeds (HMP)' }, { value: 'HEI', text: 'Hewell (HMP)' }],
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
      session: { userDetails: { name: 'Test User', activeCaseLoadId: 'LEI' } },
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

describe('post', () => {
  const elite2Api = {}
  const req = {
    session: {
      userDetails: {},
      data: {
        activeCaseLoadId: 'LEI',
      },
    },
  }
  const res = {
    redirect: jest.fn(),
    render: jest.fn(),
  }

  const logError = jest.fn()

  let service

  beforeEach(() => {
    elite2Api.setActiveCaseload = jest.fn()
  })

  it('should call the API with the correct body', async () => {
    service = changeCaseloadFactory(elite2Api, logError)

    req.body = { caseLoadId: 'MDI' }

    await service.post(req, res)

    expect(elite2Api.setActiveCaseload).toHaveBeenCalledWith(res.locals, { caseLoadId: 'MDI' })
  })

  it('should redirect on success', async () => {
    service = changeCaseloadFactory(elite2Api, logError)

    req.body = { caseLoadId: 'MDI' }

    await service.post(req, res)

    expect(res.redirect).toHaveBeenCalledWith('//newNomisEndPointUrl/')
  })

  it('should update session with new caseload id and clear app session data', async () => {
    service = changeCaseloadFactory(elite2Api, logError)

    req.body = { caseLoadId: 'MDI' }

    await service.post(req, res)

    expect(req.session.data).toBe(null)
    expect(req.session.userDetails.activeCaseLoadId).toBe('MDI')
  })

  it('should error when caseload id is missing', async () => {
    service = changeCaseloadFactory(elite2Api, logError)

    req.body = {}

    await service.post(req, res)

    expect(res.render).toBeCalledWith('error.njk', {
      url: '/change-caseload',
    })
  })
})
