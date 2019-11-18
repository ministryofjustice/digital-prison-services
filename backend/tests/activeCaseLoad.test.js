const { activeCaseloadFactory } = require('../controllers/setactivecaseload')
const config = require('../config')

config.app.notmEndpointUrl = '//newNomisEndPointUrl/'

describe('Switch caseload', () => {
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

  beforeEach(() => {
    elite2Api.setActiveCaseload = jest.fn()
  })
  it('should call the API with the correct body', async () => {
    const controller = activeCaseloadFactory(elite2Api, logError)

    req.body = { caseLoadId: 'MDI' }

    await controller.setActiveCaseload(req, res)

    expect(elite2Api.setActiveCaseload).toHaveBeenCalledWith(res.locals, { caseLoadId: 'MDI' })
  })

  it('should redirect on success', async () => {
    const controller = activeCaseloadFactory(elite2Api, logError)

    req.body = { caseLoadId: 'MDI' }

    await controller.setActiveCaseload(req, res)

    expect(res.redirect).toHaveBeenCalledWith('//newNomisEndPointUrl/')
  })

  it('should update session with new caseload id and clear app session data', async () => {
    const controller = activeCaseloadFactory(elite2Api, logError)

    req.body = { caseLoadId: 'MDI' }

    await controller.setActiveCaseload(req, res)

    expect(req.session.data).toBe(null)
    expect(req.session.userDetails.activeCaseLoadId).toBe('MDI')
  })

  it('should error when caseload id is missing', async () => {
    const controller = activeCaseloadFactory(elite2Api, logError)

    req.body = {}

    await controller.setActiveCaseload(req, res)

    expect(res.render).toBeCalledWith('error.njk', {
      url: '/change-caseload',
    })
  })
})
