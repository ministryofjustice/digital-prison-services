import prisonerFullImage from '../controllers/prisonerProfile/prisonerFullImage'

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

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails.mockReturnValue({ firstName: 'Test', lastName: 'Prisoner' })

    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; logError: any; ... Remove this comment to see the full error message
    controller = prisonerFullImage({ prisonApi, logError })
  })

  it('should make a call for the basic details of a prisoner', async () => {
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
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
