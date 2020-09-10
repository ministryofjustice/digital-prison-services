const makeCellMove = require('../../controllers/cellMove/makeCellMove')

describe('Make a cell move', () => {
  const elite2Api = {}
  const req = { originalUrl: 'http://localhost' }
  const res = { locals: {} }

  let logError
  let controller

  beforeEach(() => {
    logError = jest.fn()

    elite2Api.getDetails = jest.fn()
    elite2Api.moveToCell = jest.fn()

    controller = makeCellMove({ elite2Api, logError })

    req.params = {
      offenderNo: 'A12345',
    }

    res.render = jest.fn()

    res.redirect = jest.fn()
  })

  it('should redirect back to select cell page when location description is missing', async () => {
    req.body = {}

    await controller(req, res)

    expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/cell-move/select-cell')
  })

  it('should call elite api to make the cell move', async () => {
    elite2Api.getDetails = jest.fn().mockResolvedValue({ bookingId: 1 })
    req.body = { location: 'MDI-01-01' }

    await controller(req, res)

    expect(elite2Api.getDetails).toHaveBeenCalledWith({}, 'A12345')
    expect(elite2Api.moveToCell).toHaveBeenCalledWith({}, { bookingId: 1, internalLocationDescription: 'MDI-01-01' })
    expect(res.redirect).toHaveBeenCalledWith(
      '/prisoner/A12345/cell-move/cell-move-confirmation?=location=MDI-01-01&=A12345'
    )
  })

  it('should handle api errors', async () => {
    req.body = { location: 'MDI' }

    const error = new Error('network error')

    elite2Api.getDetails.mockRejectedValue(new Error('network error'))
    await controller(req, res)

    expect(logError).toHaveBeenCalledWith('http://localhost', error, 'Failed to make cell move')

    expect(res.render).toHaveBeenCalledWith(
      'error.njk',
      expect.objectContaining({
        url: '/prisoner/A12345/cell-move/select-cell',
      })
    )
  })
})
