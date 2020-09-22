const cellNotAvailable = require('../../controllers/cellMove/cellNotAvailable')

describe('Cell not available', () => {
  const res = { locals: {} }
  let req

  const elite2Api = {}
  let logError
  let controller

  beforeEach(() => {
    elite2Api.getDetails = jest.fn().mockResolvedValue({
      firstName: 'John',
      lastName: 'Doe',
    })
    logError = jest.fn()
    res.redirect = jest.fn()
    res.render = jest.fn()

    controller = cellNotAvailable({ elite2Api, logError })

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

    expect(elite2Api.getDetails).toHaveBeenCalledWith({}, 'A12345')
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

  it('should log and render the error page', async () => {
    const error = new Error('network error')

    elite2Api.getDetails.mockRejectedValue(error)

    await controller(req, res)

    expect(logError).toHaveBeenCalledWith(
      'http://localhost',
      error,
      'Failed to load offender details on cell not available page'
    )
    expect(res.render).toHaveBeenCalledWith('error.njk', {
      homeUrl: '/prisoner/A12345',
      url: '/prisoner/A12345/cell-move/select-location',
    })
  })
})
