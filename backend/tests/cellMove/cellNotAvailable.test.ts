import cellNotAvailable from '../../controllers/cellMove/cellNotAvailable'

describe('Cell not available', () => {
  const res = { locals: {} as any, redirect: {}, render: {}, status: {} }
  let req

  const prisonApi = {
    getDetails: jest.fn(),
  }
  let logError
  let controller

  beforeEach(() => {
    prisonApi.getDetails = jest.fn().mockResolvedValue({
      firstName: 'John',
      lastName: 'Doe',
    })
    logError = jest.fn()
    res.redirect = jest.fn()
    res.render = jest.fn()
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

    expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/cell-move/select-cell')
  })

  it('should make a request for offender details', async () => {
    await controller(req, res)

    expect(prisonApi.getDetails).toHaveBeenCalledWith({}, 'A12345')
  })

  it('should render page with the correct view model', async () => {
    await controller(req, res)

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

    prisonApi.getDetails = jest.fn().mockRejectedValue(error)

    await expect(controller(req, res)).rejects.toThrowError(error)

    expect(res.locals.redirectUrl).toBe(`/prisoner/${offenderNo}/cell-move/search-for-cell`)
    expect(res.locals.homeUrl).toBe(`/prisoner/${offenderNo}`)
  })
})
