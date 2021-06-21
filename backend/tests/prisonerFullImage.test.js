const prisonerFullImage = require('../controllers/prisonerProfile/prisonerFullImage')

describe('prisoner profile full image', () => {
  const offenderNo = 'ABC123'
  const prisonApi = {}

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = {
      headers: {},
      originalUrl: 'http://localhost',
      params: { offenderNo },
    }
    res = { locals: {}, render: jest.fn(), status: jest.fn() }

    logError = jest.fn()

    prisonApi.getDetails = jest.fn()
    prisonApi.getDetails.mockReturnValue({ firstName: 'Test', lastName: 'Prisoner' })

    controller = prisonerFullImage({ prisonApi, logError })
  })

  it('should make a call for the basic details of a prisoner', async () => {
    await controller(req, res)

    expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
  })

  it('should render with the correct back url if no referer', async () => {
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerFullImage.njk', {
      backUrl: `/prisoner/${offenderNo}`,
      offenderNo,
      offenderName: 'Prisoner, Test',
    })
  })

  it('should render with the correct back url if there is a referer', async () => {
    const refererUrl = `//prisonStaffHubUrl/prisoner/${offenderNo}/personal`

    req.headers.referer = refererUrl

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerFullImage.njk', {
      backUrl: refererUrl,
      offenderNo,
      offenderName: 'Prisoner, Test',
    })
  })
})
