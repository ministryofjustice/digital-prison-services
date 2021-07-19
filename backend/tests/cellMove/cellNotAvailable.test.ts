// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'cellNotAva... Remove this comment to see the full error message
const cellNotAvailable = require('../../controllers/cellMove/cellNotAvailable')

describe('Cell not available', () => {
  const res = { locals: {} }
  let req

  const prisonApi = {}
  let logError
  let controller

  beforeEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest.fn().mockResolvedValue({
      firstName: 'John',
      lastName: 'Doe',
    })
    logError = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{ loca... Remove this comment to see the full error message
    res.redirect = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    res.render = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{ locals... Remove this comment to see the full error message
    res.status = jest.fn()

    controller = cellNotAvailable({ prisonApi, logError })

    req = {
      originalUrl: 'http://localhost',
      params: {
        offenderNo: 'A12345',
      },
      query: {
        cellDescription: 'Location 1',
      },
    }
  })

  it('should redirect back to select cell page when no cellDescription is available', async () => {
    req.query = {}
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{ loca... Remove this comment to see the full error message
    expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/cell-move/select-cell')
  })

  it('should make a request for offender details', async () => {
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    expect(prisonApi.getDetails).toHaveBeenCalledWith({}, 'A12345')
  })

  it('should render page with the correct view model', async () => {
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    expect(res.render).toHaveBeenCalledWith('cellMove/cellNotAvailable.njk', {
      header: 'Cell Location 1 is no longer available',
      breadcrumbPrisonerName: 'Doe, John',
      offenderNo: 'A12345',
      selectCellUrl: `/prisoner/A12345/cell-move/select-cell`,
    })
  })

  it('should store correct redirect and home url then re-throw the error', async () => {
    const offenderNo = 'A12345'
    const error = new Error('network error')

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest.fn().mockRejectedValue(error)

    await expect(controller(req, res)).rejects.toThrowError(error)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirectUrl' does not exist on type '{}'... Remove this comment to see the full error message
    expect(res.locals.redirectUrl).toBe(`/prisoner/${offenderNo}/cell-move/search-for-cell`)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'homeUrl' does not exist on type '{}'.
    expect(res.locals.homeUrl).toBe(`/prisoner/${offenderNo}`)
  })
})
